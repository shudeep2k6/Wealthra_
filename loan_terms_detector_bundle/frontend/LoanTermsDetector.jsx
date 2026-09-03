import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import {
  FileSearch,
  Upload,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Calendar,
  CreditCard,
  Receipt,
  FileWarning,
  Lock,
  RotateCcw,
  Shield,
  EyeOff,
  Copy,
  Check,
  Download,
  Sparkles,
  ArrowRight,
  Info,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useFinancial } from '../context/FinancialContext';
import '../styles/loanDetector.css';

export const LoanTermsDetector = ({ onNavigate }) => {
  const { simpleLanguage } = useAccessibility();
  const { currentUser } = useFinancial();

  // Input states
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Analysis / Process states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0, 1, 2, 3
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Clauses filter & UI states
  const [clauseFilter, setClauseFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MED' | 'LOW'
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [selectedClauseForInspection, setSelectedClauseForInspection] = useState(null);

  // Sample presets for instant testing
  const [samplePresets, setSamplePresets] = useState([]);

  useEffect(() => {
    // Fetch presets from API or use local defaults
    axios.get('/api/loan/samples')
      .then(res => {
        if (res.data && res.data.samples) {
          setSamplePresets(res.data.samples);
        }
      })
      .catch(() => {
        // Local fallback presets
        setSamplePresets([
          {
            id: 'preset-1',
            title: 'High-Risk Personal Loan (Hidden Fees & Penalties)',
            riskExpectation: 'High',
            text: `LOAN FACILITY AGREEMENT & TERMS OF CREDIT\n\nClause 1 (Interest Rate): The Borrower agrees to pay interest on the loan facility at a floating rate of 15.50% per annum linked to the Bank's 1-year MCLR, with unilateral spread reset rights reserved to the Lender.\n\nClause 2 (Repayment & EMI): The equated monthly installment (EMI) payable by the Borrower is fixed at INR 24,500 due on the 5th of every calendar month through an active NACH mandate.\n\nClause 3 (Loan Tenure): The total tenure of the loan facility is sanctioned for a period of 60 months (5 years) from the initial disbursement date.\n\nClause 4 (Processing Charges): A non-refundable administrative processing fee of 2.5% of the sanctioned loan amount, subject to a minimum of Rs. 4,500, shall be debited immediately.\n\nClause 5 (Late Payment Default): A penal interest rate of 30.0% per annum (2.5% per month) shall be charged on all overdue EMI payments for the exact period of delay without prior notice.\n\nClause 6 (Foreclosure Restrictions): A foreclosure charge of 4.5% shall be levied on the outstanding principal balance if the loan is closed prematurely within the first 36 months.\n\nClause 7 (Prepayment): Any partial prepayment made within the lock-in period of 24 months shall attract an exit fee of 3.0%.\n\nClause 8 (Mandatory Insurance): The Borrower shall obtain and maintain a comprehensive credit life insurance policy covering 100% of the loan value, debited directly to the loan principal at INR 18,500.\n\nClause 9 (Hidden Administrative Charges): An annual administrative account maintenance charge of Rs. 1,500 shall be debited every year on the anniversary date. A document retrieval fee of Rs. 750 plus GST applies to every physical request.\n\nClause 10 (Dishonor Penalty): A dishonor penalty of Rs. 750 shall be charged for every cheque or NACH debit returned unpaid due to insufficient funds.`
          },
          {
            id: 'preset-2',
            title: 'Standard Home Loan (Moderate Risk, Floating Rate)',
            riskExpectation: 'Medium',
            text: `MASTER HOUSING FINANCE CONTRACT\n\nSection 1.1 (Rate of Interest): The current applicable rate of interest is 8.75% p.a. comprising the benchmark repo rate of 6.50% plus a credit spread of 2.25%.\n\nSection 1.2 (Monthly Installments): The Borrower shall remit a monthly installment of Rs. 38,200 covering principal repayment and accrued monthly interest.\n\nSection 1.3 (Tenure): The loan shall be repaid over an amortization schedule spanning 20 years across 240 monthly installments.\n\nSection 1.4 (Origination Fee): A loan evaluation and administrative processing fee amounting to 0.5% will be deducted directly from the initial disbursement.\n\nSection 1.5 (Overdue Payment): Delayed payment of interest or principal beyond 3 days grace period will incur an overdue penal charge of 18.0% p.a. compounded monthly.\n\nSection 1.6 (Early Closure): No foreclosure charges shall be applicable on floating-rate individual term loans as per Reserve Bank of India consumer guidelines.\n\nSection 1.7 (Part-Prepayment): Partial prepayment is permitted up to 25% of the outstanding balance once in a financial year without any prepayment penalty.\n\nSection 1.8 (Property Protection): Property mortgaged under this loan facility must be insured against fire and earthquake with the Bank as sole loss payee.\n\nSection 1.9 (Credit Bureau Reporting): The Lender shall report payment performance, defaults, and overdue status to all statutory Credit Information Companies monthly.`
          }
        ]);
      });
  }, []);

  // Dropzone Setup
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setErrorMessage('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024
  });

  const handleApplyPreset = (preset) => {
    setInputMode('paste');
    setPastedText(preset.text);
    setSelectedFile(null);
    setErrorMessage('');
  };

  // Run Analysis via Backend
  const handleAnalyze = async () => {
    if (inputMode === 'upload' && !selectedFile) {
      setErrorMessage('Please select a PDF, DOCX, or TXT file to upload.');
      return;
    }
    if (inputMode === 'paste' && (!pastedText || !pastedText.trim())) {
      setErrorMessage('Please paste your loan agreement text to analyze.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAnalysisResult(null);
    setLoadingStep(1);

    // Simulate progressive status updates
    const t1 = setTimeout(() => setLoadingStep(2), 500);
    const t2 = setTimeout(() => setLoadingStep(3), 1200);

    try {
      let response;
      if (inputMode === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        response = await axios.post('/api/loan/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('/api/loan/analyze', {
          text: pastedText
        });
      }

      setAnalysisResult(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to analyze loan agreement';
      setErrorMessage(msg);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  // Copy Summary Handler
  const handleCopySummary = () => {
    if (!analysisResult?.summary) return;
    navigator.clipboard.writeText(analysisResult.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Download PDF Summary Handler
  const handleDownloadPDF = () => {
    if (!analysisResult) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Primary Header
    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Wealthra - Loan Terms & EMI Health Report', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | User: ${currentUser.name} | AI/ML Verification`, 14, 27);

    // Risk Level Section
    let y = 46;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 18, 32);
    doc.text('1. Overall Agreement Risk Assessment', 14, y);

    y += 8;
    doc.setFontSize(11);
    const riskColor = analysisResult.risk === 'High' ? [220, 38, 38] : analysisResult.risk === 'Medium' ? [217, 119, 6] : [22, 163, 74];
    doc.setTextColor(...riskColor);
    doc.text(`Risk Status: ${analysisResult.risk.toUpperCase()} RISK (Wellness Score: ${analysisResult.risk_score || 50}/100)`, 14, y);

    // Summary Section
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 18, 32);
    doc.text('2. Plain English Simple Summary', 14, y);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const cleanSummary = analysisResult.summary.replace(/\*\*/g, '');
    const splitSummary = doc.splitTextToSize(cleanSummary, pageWidth - 28);
    doc.text(splitSummary, 14, y);

    y += (splitSummary.length * 5) + 8;

    // Key Terms Table
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 18, 32);
    doc.text('3. Key Financial Terms Detected', 14, y);

    y += 8;
    const terms = analysisResult.important_terms || [];
    terms.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(11, 18, 32);
      doc.text(`• ${item.term}:`, 14, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(`${item.value} (${item.risk} Risk, ${item.confidence}% conf)`, 60, y);
      y += 6;
    });

    // Important Clauses
    y += 8;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 18, 32);
    doc.text('4. Important Extracted Clauses', 14, y);

    y += 8;
    const clauses = (analysisResult.clauses || []).slice(0, 8);
    clauses.forEach((c) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`[${c.category.toUpperCase()}] - ${c.risk_level.toUpperCase()} RISK:`, 14, y);

      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const splitClause = doc.splitTextToSize(c.clause, pageWidth - 28);
      doc.text(splitClause, 14, y);
      y += (splitClause.length * 4) + 3;
    });

    // Footer note
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Wealthra Safe Banking & Wellness Advisor | Page ${i} of ${pageCount}`, 14, 288);
    }

    doc.save('Wealthra_Loan_EMI_Terms_Summary.pdf');
  };

  // Helper for rendering Term Card icon
  const getTermIcon = (termName) => {
    switch (termName) {
      case 'Interest Rate': return <Percent size={18} />;
      case 'EMI Amount': return <CreditCard size={18} />;
      case 'Loan Tenure': return <Calendar size={18} />;
      case 'Processing Fee': return <Receipt size={18} />;
      case 'Late Payment Penalty': return <FileWarning size={18} />;
      case 'Foreclosure Charges': return <Lock size={18} />;
      case 'Prepayment': return <RotateCcw size={18} />;
      case 'Insurance': return <Shield size={18} />;
      case 'Hidden Charges': return <EyeOff size={18} />;
      case 'Risk Level': return <ShieldAlert size={18} />;
      default: return <Info size={18} />;
    }
  };

  // Filter clauses
  const filteredClauses = (analysisResult?.clauses || []).filter(c => {
    if (clauseFilter === 'ALL') return true;
    if (clauseFilter === 'HIGH') return c.risk_level === 'High';
    if (clauseFilter === 'MED') return c.risk_level === 'Medium';
    if (clauseFilter === 'LOW') return c.risk_level === 'Low';
    return true;
  });

  return (
    <div className="page-container fade-in loan-detector-container">
      {/* Top Header Banner */}
      <div className="detector-header">
        <div className="detector-header-top">
          <span className="detector-pill">
            <Sparkles size={13} />
            AI &amp; Machine Learning Engine
          </span>
          <span className="brand-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
            TF-IDF + Logistic Regression
          </span>
        </div>
        <h1>Loan EMI Terms Detector</h1>
        <p>
          {simpleLanguage
            ? 'Easily check the secret fees, late charges, and real interest rate in any loan paper before you sign.'
            : 'Uncover hidden charges, aggressive late penalties, and restrictive exit covenants from lengthy loan agreements in seconds with verified Machine Learning.'}
        </p>
      </div>

      {/* Input Workspace */}
      <div className="detector-input-card">
        {/* Tab switcher & Presets */}
        <div className="input-tabs-bar">
          <div className="input-tab-group">
            <button
              type="button"
              className={`input-tab-btn ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}
            >
              <Upload size={16} />
              <span>Upload Agreement Document</span>
            </button>
            <button
              type="button"
              className={`input-tab-btn ${inputMode === 'paste' ? 'active' : ''}`}
              onClick={() => setInputMode('paste')}
            >
              <FileText size={16} />
              <span>Paste Agreement Text</span>
            </button>
          </div>

          {/* Quick Preset loader */}
          <div className="sample-presets">
            <span className="sample-presets-label">Load Sample Agreement:</span>
            {samplePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="sample-preset-btn"
                onClick={() => handleApplyPreset(preset)}
                title={preset.title}
              >
                {preset.riskExpectation === 'High' ? '🔴 High Risk Sample' : '🟡 Home Loan Sample'}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Mode Dropzone */}
        {inputMode === 'upload' && (
          <div>
            <div
              {...getRootProps()}
              className={`dropzone-container ${isDragActive ? 'is-active' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="dropzone-icon-box">
                <Upload size={28} />
              </div>
              <h3 className="dropzone-title">
                {isDragActive ? 'Drop your loan agreement file here...' : 'Upload Loan Agreement Document'}
              </h3>
              <p className="dropzone-subtitle">
                Drag and drop your contract or click to browse from your device
              </p>
              <div className="dropzone-formats">
                <span className="format-pill">PDF (.pdf)</span>
                <span className="format-pill">Word (.docx)</span>
                <span className="format-pill">Text (.txt)</span>
                <span>• Max size 20MB</span>
              </div>
            </div>

            {selectedFile && (
              <div className="selected-file-card">
                <div className="file-info-group">
                  <div className="file-icon-badge">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="file-meta-name">{selectedFile.name}</div>
                    <div className="file-meta-size">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI Analysis
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  Change File
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paste Mode Textarea */}
        {inputMode === 'paste' && (
          <div className="text-input-wrapper">
            <textarea
              className="detector-textarea"
              placeholder="Paste loan agreement clauses, sanction letters, or promissory notes here (e.g. Interest Rate clauses, EMI amount, Late fee stipulations, Foreclosure conditions)..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={10}
            />
            <div className="text-meta-row">
              <span>{pastedText.length} characters • ~{pastedText.split(/\s+/).filter(Boolean).length} words</span>
              {pastedText && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.8rem' }}
                  onClick={() => setPastedText('')}
                >
                  Clear Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Trigger Button */}
        <div className="analyze-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#16A34A" />
            <span>Encrypted in-memory document parsing. Zero document retention.</span>
          </div>

          <button
            type="button"
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={isLoading}
            id="btn-analyze-terms"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="spin-animation" />
                <span>Processing Agreement...</span>
              </>
            ) : (
              <>
                <FileSearch size={18} />
                <span>Analyze Terms with AI</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="processing-card fade-in">
          <div className="processing-spinner"></div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
            Analyzing Loan Terms with Scikit-Learn Model
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', maxWidth: '550px', margin: '0 auto' }}>
            Parsing document text, vectorizing legal clauses with TF-IDF, classifying clauses into 15 categories, and evaluating risk levels...
          </p>

          <div className="step-tracker">
            <div className={`step-item ${loadingStep >= 1 ? (loadingStep > 1 ? 'done' : 'active') : ''}`}>
              <Check size={16} />
              <span>1. Ingesting Document</span>
            </div>
            <div className={`step-item ${loadingStep >= 2 ? (loadingStep > 2 ? 'done' : 'active') : ''}`}>
              <Check size={16} />
              <span>2. Running ML Classifier</span>
            </div>
            <div className={`step-item ${loadingStep >= 3 ? 'active' : ''}`}>
              <Check size={16} />
              <span>3. Extracting Terms &amp; Summary</span>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysisResult && !isLoading && (
        <div className="results-container fade-in">
          {/* Overall Risk Banner */}
          <div className={`overall-risk-banner ${analysisResult.risk.toLowerCase()}`}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: analysisResult.risk === 'High' ? '#DC2626' : analysisResult.risk === 'Medium' ? '#D97706' : '#16A34A' }}>
                Overall Agreement Rating
              </span>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', marginTop: '0.2rem', marginBottom: '0.35rem' }}>
                {analysisResult.risk} Risk Agreement Detected
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', maxWidth: '650px' }}>
                {analysisResult.risk === 'High'
                  ? 'Warning: This agreement contains aggressive late payment surcharges, strict foreclosure penalties, or bundled hidden administrative fees.'
                  : analysisResult.risk === 'Medium'
                  ? 'Caution: Standard commercial covenants with variable interest rates and moderate prepayment restrictions. Review carefully before signing.'
                  : 'Positive: Transparent terms with standard consumer protections, reasonable grace periods, and zero abusive penalty covenants.'}
              </p>
            </div>

            <div className="score-dial-wrap">
              <div className={`score-number ${analysisResult.risk.toLowerCase()}`}>
                {analysisResult.risk_score || 55}
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>/100</span>
              </div>
              <div className="score-caption">Risk Score</div>
            </div>
          </div>

          {/* 10 Term Cards Grid */}
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} color="#2563EB" />
              <span>Key Financial Terms (AI Extracted)</span>
            </h3>

            <div className="term-cards-grid">
              {(analysisResult.important_terms || []).map((termItem, idx) => {
                const badgeClass = termItem.risk === 'High'
                  ? 'badge-risk-high'
                  : termItem.risk === 'Medium'
                  ? 'badge-risk-med'
                  : 'badge-risk-low';

                return (
                  <div key={idx} className="term-card">
                    <div>
                      <div className="term-card-header">
                        <div className="term-title-group">
                          <div className="term-icon-box">
                            {getTermIcon(termItem.term)}
                          </div>
                          <span className="term-title">{termItem.term}</span>
                        </div>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                          {termItem.risk}
                        </span>
                      </div>

                      <div className="term-value">{termItem.value}</div>

                      {termItem.source_clause && (
                        <div className="term-source" title={termItem.source_clause}>
                          "{termItem.source_clause}"
                        </div>
                      )}
                    </div>

                    <div className="term-card-footer">
                      <div className="confidence-indicator">
                        <Sparkles size={13} color="#2563EB" />
                        <span>{termItem.confidence}% confidence</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ML Verified</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple Summary Card */}
          <div className="summary-card">
            <div className="summary-card-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                  {simpleLanguage ? 'Simple Summary (Plain English)' : 'Plain-Language Agreement Assessment'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Clear breakdown of what you are signing up for without confusing banking legalese
                </span>
              </div>

              <div className="summary-actions-group">
                <button
                  type="button"
                  className="summary-btn btn-secondary"
                  onClick={handleCopySummary}
                  id="btn-copy-summary"
                >
                  {copiedSummary ? (
                    <>
                      <Check size={15} color="#16A34A" />
                      <span style={{ color: '#16A34A' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="summary-btn btn-primary"
                  onClick={handleDownloadPDF}
                  id="btn-download-pdf"
                >
                  <Download size={15} />
                  <span>Download Summary (PDF)</span>
                </button>
              </div>
            </div>

            <div className="summary-content">
              {analysisResult.summary.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="summary-paragraph">
                  {paragraph.split('**').map((part, i) => (
                    i % 2 === 1 ? <strong key={i} style={{ color: 'var(--color-navy)' }}>{part}</strong> : part
                  ))}
                </p>
              ))}
            </div>
          </div>

          {/* Important Clauses Section */}
          <div className="clauses-card">
            <div className="clauses-filter-bar">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                  Important Clauses Extracted
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Classified by Machine Learning across 15 banking risk categories
                </span>
              </div>

              {/* Filter Chips */}
              <div className="filter-btn-group">
                <button
                  type="button"
                  className={`filter-chip ${clauseFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setClauseFilter('ALL')}
                >
                  All ({analysisResult.clauses?.length || 0})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${clauseFilter === 'HIGH' ? 'active' : ''}`}
                  onClick={() => setClauseFilter('HIGH')}
                >
                  🔴 High Risk ({(analysisResult.clauses || []).filter(c => c.risk_level === 'High').length})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${clauseFilter === 'MED' ? 'active' : ''}`}
                  onClick={() => setClauseFilter('MED')}
                >
                  🟡 Medium ({(analysisResult.clauses || []).filter(c => c.risk_level === 'Medium').length})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${clauseFilter === 'LOW' ? 'active' : ''}`}
                  onClick={() => setClauseFilter('LOW')}
                >
                  🟢 Safe ({(analysisResult.clauses || []).filter(c => c.risk_level === 'Low').length})
                </button>
              </div>
            </div>

            {/* Clauses List */}
            <div className="clauses-list">
              {filteredClauses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No clauses match the selected filter.
                </div>
              ) : (
                filteredClauses.map((c) => {
                  const riskClass = c.risk_level === 'High'
                    ? 'risk-high'
                    : c.risk_level === 'Medium'
                    ? 'risk-med'
                    : 'risk-low';

                  const badgeClass = c.risk_level === 'High'
                    ? 'badge-risk-high'
                    : c.risk_level === 'Medium'
                    ? 'badge-risk-med'
                    : 'badge-risk-low';

                  return (
                    <div key={c.id} className={`clause-item ${riskClass}`}>
                      <div className="clause-header-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="clause-category-tag">{c.category}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Clause #{c.id}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.75rem' }}>
                            {c.risk_level} Risk
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                            {c.confidence}% Match
                          </span>
                        </div>
                      </div>

                      <div className="clause-text">"{c.clause}"</div>
                      <div className="clause-explanation">
                        <strong>Why it matters:</strong> {c.explanation}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Original Document Inspector with Highlighting */}
          {analysisResult.original_text && (
            <div className="inspector-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                    Document Inspector &amp; Clause Highlighting
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Original contract text color-coded by detected clause risk level
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: 10, height: 10, backgroundColor: '#DC2626', borderRadius: '50%' }}></span>
                    Red: High Risk
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: 10, height: 10, backgroundColor: '#F59E0B', borderRadius: '50%' }}></span>
                    Orange: Medium Risk
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: 10, height: 10, backgroundColor: '#16A34A', borderRadius: '50%' }}></span>
                    Green: Safe / Standard
                  </span>
                </div>
              </div>

              <div className="inspector-text-box">
                {(analysisResult.clauses || []).map((c, i) => {
                  const hlClass = c.risk_level === 'High'
                    ? 'highlight-clause-high'
                    : c.risk_level === 'Medium'
                    ? 'highlight-clause-med'
                    : 'highlight-clause-low';

                  return (
                    <span
                      key={i}
                      className={hlClass}
                      title={`[${c.category}] - ${c.risk_level} Risk (${c.confidence}% confidence): ${c.explanation}`}
                      onClick={() => setSelectedClauseForInspection(c)}
                    >
                      {c.clause}{' '}
                    </span>
                  );
                })}
              </div>

              {selectedClauseForInspection && (
                <div style={{ marginTop: '1rem', padding: '0.85rem 1.25rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                      Selected Clause: [{selectedClauseForInspection.category}] ({selectedClauseForInspection.risk_level} Risk)
                    </strong>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => setSelectedClauseForInspection(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#1E3A8A', margin: 0 }}>
                    {selectedClauseForInspection.explanation} (Confidence: {selectedClauseForInspection.confidence}%)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions Footer */}
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAnalysisResult(null);
                setSelectedFile(null);
                setPastedText('');
              }}
            >
              <RotateCcw size={16} />
              <span>Analyze Another Agreement</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => onNavigate('debt')}
              >
                <span>View Debt &amp; EMI Health</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate('guidance')}
              >
                <span>Financial Guidance Center</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
