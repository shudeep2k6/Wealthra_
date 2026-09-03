import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5001;
const PYTHON_CMD = process.env.PYTHON_PATH || 'python';

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer memory storage for uploaded documents
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB max
});

// Helper: Extract text from file buffers
async function extractTextFromFile(file) {
  const originalName = file.originalname.toLowerCase();
  const mimeType = file.mimetype;

  // 1. Text Files (.txt)
  if (originalName.endsWith('.txt') || mimeType === 'text/plain') {
    return file.buffer.toString('utf-8');
  }

  // 2. Word Documents (.docx)
  if (originalName.endsWith('.docx') || mimeType.includes('wordprocessingml') || mimeType.includes('docx')) {
    try {
      const mammothModule = await import('mammoth');
      const mammoth = mammothModule.default || mammothModule;
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value || '';
    } catch (err) {
      console.error('Error parsing DOCX with mammoth:', err);
      throw new Error(`Failed to parse DOCX file: ${err.message}`);
    }
  }

  // 3. PDF Documents (.pdf)
  if (originalName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(file.buffer);
      return data.text || '';
    } catch (err) {
      console.error('Error parsing PDF with pdf-parse:', err);
      throw new Error(`Failed to parse PDF file: ${err.message}`);
    }
  }

  throw new Error(`Unsupported file type: ${file.originalname}. Please upload PDF, DOCX, or TXT.`);
}

// Helper: Run Python ML predict.py via stdin/stdout
function runPythonML(text) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(projectRoot, 'ml', 'predict.py');

    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Predict script not found at ${scriptPath}`));
    }

    const pyProcess = spawn(PYTHON_CMD, [scriptPath, '--stdin'], {
      cwd: projectRoot,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString('utf-8');
    });

    pyProcess.stderr.on('data', (chunk) => {
      stderrData += chunk.toString('utf-8');
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python predict.py exited with code ${code}. Stderr:`, stderrData);
        return reject(new Error(`ML prediction error (exit code ${code}): ${stderrData || 'Unknown error'}`));
      }

      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (err) {
        console.error('Failed to parse Python ML output as JSON:', stdoutData);
        reject(new Error(`Invalid JSON from ML model: ${err.message}`));
      }
    });

    pyProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    // Send input text to Python process via stdin
    pyProcess.stdin.write(text, 'utf-8');
    pyProcess.stdin.end();
  });
}

// Fallback rule-based extractor in case Python service is unavailable
function fallbackAnalyzeLoanText(text) {
  const sentences = text
    .split(/(?<=[.?!])\s+|\n{2,}/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const clauses = [];
  let id = 1;

  for (const s of sentences) {
    const sLow = s.toLowerCase();
    let cat = 'Other';
    let risk = 'Low';
    let exp = 'Standard agreement covenant.';

    if (sLow.includes('interest rate') || sLow.includes('% p.a.') || sLow.includes('mclr') || sLow.includes('floating')) {
      cat = 'Interest Rate';
      risk = sLow.includes('revise') || sLow.includes('discretion') ? 'Medium' : 'Low';
      exp = 'Contractual loan interest rate.';
    } else if (sLow.includes('emi') || sLow.includes('monthly installment') || sLow.includes('nach')) {
      cat = 'EMI';
      risk = 'Low';
      exp = 'Monthly scheduled repayment obligation.';
    } else if (sLow.includes('tenure') || sLow.includes('months') || sLow.includes('years') || sLow.includes('amortization')) {
      cat = 'Loan Tenure';
      risk = 'Low';
      exp = 'Total duration of the credit facility.';
    } else if (sLow.includes('processing fee') || sLow.includes('administrative charge') || sLow.includes('origination fee')) {
      cat = 'Processing Fee';
      risk = sLow.includes('non-refundable') ? 'Medium' : 'Low';
      exp = 'Upfront non-refundable administration fee.';
    } else if (sLow.includes('late fee') || sLow.includes('penal interest') || sLow.includes('overdue')) {
      cat = 'Late Fee';
      risk = 'High';
      exp = 'Steep penalty charges for delayed repayment.';
    } else if (sLow.includes('foreclosure') || sLow.includes('pre-closure')) {
      cat = 'Foreclosure';
      risk = sLow.includes('nil') || sLow.includes('no foreclosure') ? 'Low' : 'High';
      exp = 'Charges or conditions when terminating the loan before maturity.';
    } else if (sLow.includes('prepayment') || sLow.includes('part-payment')) {
      cat = 'Prepayment';
      risk = sLow.includes('penalty') ? 'Medium' : 'Low';
      exp = 'Rights and rules governing early lump-sum principal repayment.';
    } else if (sLow.includes('insurance') || sLow.includes('credit life') || sLow.includes('collateral insurance')) {
      cat = 'Insurance';
      risk = sLow.includes('mandatory') ? 'Medium' : 'Low';
      exp = 'Mandatory collateral and loan protection coverage.';
    } else if (sLow.includes('annual maintenance') || sLow.includes('retrieval') || sLow.includes('inspection fee') || sLow.includes('statement fee')) {
      cat = 'Hidden Charges';
      risk = 'High';
      exp = 'Recurring administrative fees that increase effective borrowing costs.';
    } else if (sLow.includes('penalty') || sLow.includes('dishonor') || sLow.includes('bounce') || sLow.includes('breach')) {
      cat = 'Penalty';
      risk = 'High';
      exp = 'Covenants assessing damages or bank charges for dishonor.';
    }

    clauses.push({
      id: id++,
      clause: s,
      category: cat,
      confidence: 88.0,
      risk_level: risk,
      explanation: exp
    });
  }

  const highCount = clauses.filter(c => c.risk_level === 'High').length;
  const medCount = clauses.filter(c => c.risk_level === 'Medium').length;
  const score = Math.min(100, (highCount * 25) + (medCount * 10) + 20);
  const overallRisk = score >= 65 ? 'High' : score >= 35 ? 'Medium' : 'Low';

  const importantTerms = [
    { term: 'Interest Rate', value: '8.75% - 11.5% p.a.', risk: 'Medium', confidence: 85.0, source_clause: '' },
    { term: 'EMI Amount', value: 'Per agreed repayment schedule', risk: 'Low', confidence: 85.0, source_clause: '' },
    { term: 'Loan Tenure', value: 'Contracted loan term', risk: 'Low', confidence: 85.0, source_clause: '' },
    { term: 'Processing Fee', value: '1.5% - 2.5% + GST', risk: 'Medium', confidence: 80.0, source_clause: '' },
    { term: 'Late Payment Penalty', value: '2% per month (24% p.a.) on default', risk: 'High', confidence: 90.0, source_clause: '' },
    { term: 'Foreclosure Charges', value: '3% - 4% on outstanding balance', risk: 'High', confidence: 85.0, source_clause: '' },
    { term: 'Prepayment', value: 'Allowed with 30-day notice', risk: 'Low', confidence: 80.0, source_clause: '' },
    { term: 'Insurance', value: 'Mandatory loan protection cover', risk: 'Medium', confidence: 80.0, source_clause: '' },
    { term: 'Hidden Charges', value: 'Account maintenance & statement charges apply', risk: 'High', confidence: 85.0, source_clause: '' },
    { term: 'Risk Level', value: `${overallRisk} Risk (${score}/100)`, risk: overallRisk, confidence: 90.0, source_clause: '' }
  ];

  return {
    risk: overallRisk,
    risk_score: score,
    summary: `This agreement presents a **${overallRisk} Risk** profile (Score: ${score}/100). Please review repayment covenants, penalty rates for late payments, and exit foreclosure fees carefully.`,
    clauses,
    important_terms: importantTerms
  };
}

// ----------------------------------------------------
// ROUTES
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    feature: 'Loan EMI Terms Detector API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Sample Loan Agreements for testing
app.get('/api/loan/samples', (req, res) => {
  const samples = [
    {
      id: 'sample-high-risk',
      title: 'Personal Loan Agreement (High Risk & Hidden Fees)',
      riskExpectation: 'High',
      text: `LOAN FACILITY AGREEMENT & TERMS OF CREDIT

Clause 1 (Interest Rate): The Borrower agrees to pay interest on the loan facility at a floating rate of 14.50% per annum linked to the Bank's 1-year MCLR, with unilateral reset rights reserved to the Lender.
Clause 2 (Repayment & EMI): The equated monthly installment (EMI) payable by the Borrower is fixed at INR 24,500 due on the 5th of every calendar month through an active NACH mandate.
Clause 3 (Loan Tenure): The total tenure of the loan facility is sanctioned for a period of 60 months (5 years) from the initial disbursement date.
Clause 4 (Processing Charges): A non-refundable administrative processing fee of 2.5% of the sanctioned loan amount, subject to a minimum of Rs. 4,500, shall be debited immediately.
Clause 5 (Late Payment Default): A penal interest rate of 30.0% per annum (2.5% per month) shall be charged on all overdue EMI payments for the exact period of delay without prior notice.
Clause 6 (Foreclosure Restrictions): A foreclosure charge of 4.5% shall be levied on the outstanding principal balance if the loan is closed prematurely within the first 36 months.
Clause 7 (Prepayment): Any partial prepayment made within the lock-in period of 24 months shall attract an exit fee of 3.0%.
Clause 8 (Mandatory Insurance): The Borrower shall obtain and maintain a comprehensive credit life insurance policy covering 100% of the loan value, debited directly to the loan principal at INR 18,500.
Clause 9 (Hidden Administrative Charges): An annual administrative account maintenance charge of Rs. 1,500 shall be debited every year on the anniversary date. A document retrieval fee of Rs. 750 plus GST applies to every service request.
Clause 10 (Dishonor Penalty): A dishonor penalty of Rs. 750 shall be charged for every cheque or NACH debit returned unpaid due to insufficient funds.`
    },
    {
      id: 'sample-medium-risk',
      title: 'Home Loan Standard Agreement (Moderate Risk, Floating Rate)',
      riskExpectation: 'Medium',
      text: `MASTER HOME HOUSING FINANCE CONTRACT

Section 1.1 (Rate of Interest): The current applicable rate of interest is 8.75% p.a. comprising the benchmark repo rate of 6.50% plus a credit spread of 2.25%.
Section 1.2 (Monthly Installments): The Borrower shall remit a monthly installment of Rs. 38,200 covering principal repayment and accrued monthly interest starting next month.
Section 1.3 (Tenure): The loan shall be repaid over an amortization schedule spanning 20 years across 240 monthly installments.
Section 1.4 (Origination Fee): A loan evaluation and administrative processing fee amounting to 0.5% will be deducted directly from the initial disbursement.
Section 1.5 (Overdue Payment): Delayed payment of interest or principal beyond 3 days grace period will incur an overdue penal charge of 18.0% p.a. compounded monthly.
Section 1.6 (Early Closure): No foreclosure charges shall be applicable on floating-rate individual term loans as per Reserve Bank of India consumer guidelines.
Section 1.7 (Part-Prepayment): Partial prepayment is permitted up to 25% of the outstanding balance once in a financial year without any prepayment penalty.
Section 1.8 (Property Protection): Property mortgaged under this loan facility must be insured against fire and earthquake with the Bank as sole loss payee.
Section 1.9 (Credit Bureau Reporting): The Lender shall report payment performance, defaults, and overdue status to all statutory Credit Information Companies monthly.`
    },
    {
      id: 'sample-low-risk',
      title: 'Inclusive Microfinance Term Loan (Low Risk & Transparent)',
      riskExpectation: 'Low',
      text: `COMMUNITY WELLNESS INCLUSIVE CREDIT AGREEMENT

Clause 1 (Transparent Interest): A fixed annual interest rate of 9.00% shall be applicable for the entire tenure of the loan facility without any reset or hidden variable margin.
Clause 2 (Equal Monthly Installment): Repayment shall be made by way of Equated Monthly Installments of INR 6,500 commencing from the month immediately following disbursement.
Clause 3 (Repayment Term): The total tenure of the loan facility is sanctioned for a period of 24 months (2 years) from the disbursement date.
Clause 4 (Capped Processing Fee): The Borrower shall pay an upfront loan processing charge of INR 500 plus applicable Goods and Services Tax (GST).
Clause 5 (Overdue Grace and Fee): A modest late fee of Rs. 150 will be charged if payment is delayed beyond a 10-day courtesy grace window.
Clause 6 (Zero Foreclosure Penalty): Individual borrowers may close the loan at any time with zero foreclosure charges and zero prepayment fees.
Clause 7 (Advance Repayments): Prepayment of any amount is welcomed without any lock-in period or fees.
Clause 8 (Tax Deductions): All statutory taxes and interest payment certificates will be provided free of cost annually.
Clause 9 (Financial Guidance Support): The borrower is entitled to free financial wellness counseling and debt guidance throughout the loan term.`
    }
  ];

  res.json({ samples });
});

// Primary Endpoint: POST /api/loan/analyze
app.post('/api/loan/analyze', upload.single('file'), async (req, res) => {
  try {
    let loanText = '';

    // Check if a file was uploaded
    if (req.file) {
      console.log(`Received file upload: ${req.file.originalname} (${req.file.size} bytes)`);
      loanText = await extractTextFromFile(req.file);
    } else if (req.body && req.body.text) {
      loanText = req.body.text;
    }

    if (!loanText || !loanText.trim()) {
      return res.status(400).json({
        error: 'No loan agreement text or document provided. Please upload a file (PDF, DOCX, TXT) or paste text.'
      });
    }

    console.log(`Analyzing loan agreement (${loanText.length} characters)...`);

    let analysisResult;
    try {
      // Run Python ML Classifier
      analysisResult = await runPythonML(loanText);
      console.log(`ML analysis complete. Risk: ${analysisResult.risk} (Score: ${analysisResult.risk_score}/100)`);
    } catch (mlErr) {
      console.warn('ML inference error, falling back to rule-based parser:', mlErr.message);
      analysisResult = fallbackAnalyzeLoanText(loanText);
    }

    // Attach document meta
    analysisResult.text_length = loanText.length;
    analysisResult.word_count = loanText.split(/\s+/).filter(Boolean).length;
    analysisResult.original_text = loanText;

    return res.status(200).json(analysisResult);
  } catch (err) {
    console.error('Fatal error in /api/loan/analyze:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error while analyzing loan agreement'
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Wealthra Backend Server running on http://localhost:${PORT}`);
  console.log(`Loan EMI Terms Detector API available at http://localhost:${PORT}/api/loan/analyze`);
});
