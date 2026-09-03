import React, { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  Shield,
  Copy,
  Check,
  Download,
  Sparkles,
  ArrowRight,
  Info,
  Printer,
  HelpCircle,
  Clock,
  X
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';
import { analyzeLoanAgreementText } from '../services/loanAnalysisEngine';
import '../styles/loanDetector.css';

export const LoanTermsDetector = ({ onNavigate }) => {
  const { currentUser } = useFinancial();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  // Input states
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContentText, setFileContentText] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  // Analysis / Process states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); // 0, 1, 2, 3
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Filter & UI states
  const [clauseFilter, setClauseFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MED' | 'LOW'
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [selectedClauseForInspection, setSelectedClauseForInspection] = useState(null);

  // 3 Preset Samples
  const samplePresets = [
    {
      id: 'preset-1',
      title: 'High-Risk Personal Loan (Hidden Fees & Penalties)',
      riskExpectation: 'High',
      text: `LOAN FACILITY AGREEMENT & TERMS OF CREDIT

Clause 1 (Interest Rate): The Borrower agrees to pay interest on the loan facility at a floating rate of 15.50% per annum linked to the Bank's 1-year MCLR, with unilateral spread reset rights reserved to the Lender.

Clause 2 (Repayment & EMI): The equated monthly installment (EMI) payable by the Borrower is fixed at INR 24,500 due on the 5th of every calendar month through an active NACH mandate.

Clause 3 (Loan Tenure): The total tenure of the loan facility is sanctioned for a period of 60 months (5 years) from the initial disbursement date.

Clause 4 (Processing Charges): A non-refundable administrative processing fee of 2.5% of the sanctioned loan amount, subject to a minimum of Rs. 4,500, shall be debited immediately.

Clause 5 (Late Payment Default): A penal interest rate of 30.0% per annum (2.5% per month) shall be charged on all overdue EMI payments for the exact period of delay without prior notice.

Clause 6 (Foreclosure Restrictions): A foreclosure charge of 4.5% shall be levied on the outstanding principal balance if the loan is closed prematurely within the first 36 months.

Clause 7 (Prepayment): Any partial prepayment made within the lock-in period of 24 months shall attract an exit fee of 3.0%.

Clause 8 (Mandatory Insurance): The Borrower shall obtain and maintain a comprehensive credit life insurance policy covering 100% of the loan value, debited directly to the loan principal at INR 18,500.

Clause 9 (Hidden Administrative Charges): An annual administrative account maintenance charge of Rs. 1,500 shall be debited every year on the anniversary date. A document retrieval fee of Rs. 750 plus GST applies to every physical request.

Clause 10 (Dishonor Penalty): A dishonor penalty of Rs. 750 shall be charged for every cheque or NACH debit returned unpaid due to insufficient funds.`
    },
    {
      id: 'preset-2',
      title: 'Standard Home Loan (Moderate Risk, Floating Rate)',
      riskExpectation: 'Medium',
      text: `MASTER HOUSING FINANCE CONTRACT

Section 1.1 (Rate of Interest): The current applicable rate of interest is 8.75% p.a. comprising the benchmark repo rate of 6.50% plus a credit spread of 2.25%.

Section 1.2 (Monthly Installments): The Borrower shall remit a monthly installment of Rs. 38,200 covering principal repayment and accrued monthly interest.

Section 1.3 (Tenure): The loan shall be repaid over an amortization schedule spanning 20 years across 240 monthly installments.

Section 1.4 (Origination Fee): A loan evaluation and administrative processing fee amounting to 0.5% will be deducted directly from the initial disbursement.

Section 1.5 (Overdue Payment): Delayed payment of interest or principal beyond 3 days grace period will incur an overdue penal charge of 18.0% p.a. compounded monthly.

Section 1.6 (Early Closure): No foreclosure charges shall be applicable on floating-rate individual term loans as per Reserve Bank of India consumer guidelines.

Section 1.7 (Part-Prepayment): Partial prepayment is permitted up to 25% of the outstanding balance once in a financial year without any prepayment penalty.

Section 1.8 (Property Protection): Property mortgaged under this loan facility must be insured against fire and earthquake with the Bank as sole loss payee.

Section 1.9 (Credit Bureau Reporting): The Lender shall report payment performance, defaults, and overdue status to all statutory Credit Information Companies monthly.`
    },
    {
      id: 'preset-3',
      title: 'Transparent Community Loan (Low Risk, Zero Penalty)',
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

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    setSelectedFile(file);
    setErrorMessage('');

    // Read text from file
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || '';
      setFileContentText(content);
    };
    reader.onerror = () => {
      setErrorMessage('Could not read the file. Please paste the agreement text directly.');
    };

    if (file.name.endsWith('.txt')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      // For binary files (PDF, DOCX) read as text or prepare for backend
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleApplyPreset = (preset) => {
    setInputMode('paste');
    setPastedText(preset.text);
    setSelectedFile(null);
    setFileContentText('');
    setErrorMessage('');
  };

  // Run Analysis
  const handleAnalyze = async () => {
    const textToAnalyze = inputMode === 'upload' ? fileContentText : pastedText;

    if (inputMode === 'upload' && !selectedFile) {
      setErrorMessage('Please select or drop a loan agreement file (.txt, .pdf, .docx).');
      return;
    }
    if (inputMode === 'paste' && (!pastedText || !pastedText.trim())) {
      setErrorMessage('Please paste the loan agreement text to analyze.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAnalysisResult(null);
    setLoadingStep(1);

    setTimeout(() => setLoadingStep(2), 400);
    setTimeout(() => setLoadingStep(3), 800);

    try {
      // First attempt backend API if running
      let result = null;
      try {
        if (inputMode === 'upload' && selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          const res = await fetch('http://localhost:5001/api/loan/analyze', {
            method: 'POST',
            body: formData
          });
          if (res.ok) result = await res.json();
        } else if (pastedText) {
          const res = await fetch('http://localhost:5001/api/loan/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: pastedText })
          });
          if (res.ok) result = await res.json();
        }
      } catch (backendErr) {
        // Backend not running on 5001, fallback to client engine
      }

      if (!result) {
        // Run full client-side NLP analyzer
        result = analyzeLoanAgreementText(textToAnalyze || pastedText || (selectedFile ? `Sample loan for ${selectedFile.name}` : ''));
      }

      setAnalysisResult(result);
    } catch (err) {
      console.error('Loan terms analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze loan agreement.');
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleCopySummary = () => {
    if (!analysisResult?.summary) return;
    navigator.clipboard.writeText(analysisResult.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getRiskIcon = (risk) => {
    if (risk === 'High') return <ShieldAlert size={18} color="#DC2626" />;
    if (risk === 'Medium') return <AlertTriangle size={18} color="#D97706" />;
    return <ShieldCheck size={18} color="#16A34A" />;
  };

  const getRiskBadgeClass = (risk) => {
    if (risk === 'High') return 'badge-risk-high';
    if (risk === 'Medium') return 'badge-risk-med';
    return 'badge-risk-low';
  };

  const filteredClauses = analysisResult?.clauses?.filter((c) => {
    if (clauseFilter === 'ALL') return true;
    if (clauseFilter === 'HIGH') return c.risk_level === 'High';
    if (clauseFilter === 'MED') return c.risk_level === 'Medium';
    if (clauseFilter === 'LOW') return c.risk_level === 'Low';
    return true;
  }) || [];

  return (
    <div className="loan-detector-container page-container fade-in">
      {/* Header Banner */}
      <div className="detector-header">
        <div className="detector-header-top">
          <span className="detector-pill">
            <Sparkles size={13} />
            {t('loanTerms.aiLegalEngine', 'AI & Legal NLP Engine')}
          </span>
          <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
            {t('loanTerms.wealthraDefense', 'Wealthra Defense')}
          </span>
        </div>
        <h1>{t('loanTerms.title', 'Loan EMI Terms Detector & Simplifier')}</h1>
        <p>
          {t('loanTerms.subtitle', 'Upload your loan contract or paste clause text to extract hidden charges, penal interest rates, foreclosure traps, and mandatory insurance into plain, stress-free English.')}
        </p>
      </div>

      {/* Input Workspace Card */}
      <div className="detector-input-card">
        <div className="input-tabs-bar">
          <div className="input-tab-group">
            <button
              type="button"
              className={`input-tab-btn ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}
            >
              <Upload size={16} />
              <span>{t('loanTerms.uploadDocument', 'Upload Document')}</span>
            </button>
            <button
              type="button"
              className={`input-tab-btn ${inputMode === 'paste' ? 'active' : ''}`}
              onClick={() => setInputMode('paste')}
            >
              <FileText size={16} />
              <span>{t('loanTerms.pasteAgreement', 'Paste Agreement Text')}</span>
            </button>
          </div>

          {/* Preset Samples */}
          <div className="sample-presets">
            <span className="sample-presets-label">{t('loanTerms.quickSamples', 'Quick Samples')}:</span>
            {samplePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="sample-preset-btn"
                onClick={() => handleApplyPreset(preset)}
                title={preset.title}
              >
                {preset.riskExpectation === 'High' ? '🔴 High Risk' : preset.riskExpectation === 'Medium' ? '🟡 Standard Home' : '🟢 Transparent'}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Mode Dropzone */}
        {inputMode === 'upload' && (
          <div>
            <div
              className={`dropzone-container ${isDragActive ? 'is-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <div className="dropzone-icon-box">
                <Upload size={28} />
              </div>
              <div className="dropzone-title">
                {isDragActive ? 'Drop your agreement file here' : 'Click or Drag & Drop Loan Agreement'}
              </div>
              <div className="dropzone-subtitle">
                Supports loan sanction letters, EMI schedules, and banking contracts
              </div>
              <div className="dropzone-formats">
                <span className="format-pill">.TXT</span>
                <span className="format-pill">.PDF</span>
                <span className="format-pill">.DOCX</span>
                <span>(Up to 20MB)</span>
              </div>
            </div>

            {selectedFile && (
              <div className="selected-file-card fade-in">
                <div className="file-info-group">
                  <div className="file-icon-badge">
                    <FileText size={20} />
                  </div>
                  <div>
                    <strong className="file-meta-name">{selectedFile.name}</strong>
                    <div className="file-meta-size">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for deep analysis
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setFileContentText('');
                  }}
                >
                  <X size={14} />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paste Text Mode */}
        {inputMode === 'paste' && (
          <div className="text-input-wrapper">
            <textarea
              className="detector-textarea"
              placeholder="Paste your loan agreement clauses, EMI schedule text, or sanction letter here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <div className="text-meta-row">
              <span>{pastedText.length} characters • {pastedText.split(/\s+/).filter(Boolean).length} words</span>
              {pastedText && (
                <button
                  type="button"
                  className="btn btn-link btn-sm"
                  onClick={() => setPastedText('')}
                  style={{ color: '#DC2626' }}
                >
                  Clear Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem' }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="analyze-action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
            <Shield size={16} color="#16A34A" />
            <span>Confidential &amp; Local Verification • No Data Stored</span>
          </div>

          <button
            type="button"
            className="analyze-btn"
            disabled={isLoading}
            onClick={handleAnalyze}
          >
            {isLoading ? (
              <>
                <div className="spinner-mini" style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Scanning Agreement...</span>
              </>
            ) : (
              <>
                <FileSearch size={18} />
                <span>Analyze Loan Agreement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div className="processing-card fade-in">
          <div className="processing-spinner" />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
            Extracting Terms &amp; Evaluating Financial Risk
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Our model is segmenting covenants, detecting penal clauses, and standardizing loan metrics.
          </p>

          <div className="step-tracker">
            <div className={`step-item ${loadingStep >= 1 ? (loadingStep > 1 ? 'done' : 'active') : ''}`}>
              <span>1. Parsing Document</span>
            </div>
            <div className={`step-item ${loadingStep >= 2 ? (loadingStep > 2 ? 'done' : 'active') : ''}`}>
              <span>2. Classifying 15 Legal Categories</span>
            </div>
            <div className={`step-item ${loadingStep >= 3 ? 'active' : ''}`}>
              <span>3. Synthesizing Plain Summary</span>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="fade-in">
          {/* Overall Risk Banner */}
          <div className={`overall-risk-banner ${analysisResult.risk.toLowerCase()}`}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className={`badge ${getRiskBadgeClass(analysisResult.risk)}`} style={{ fontSize: '0.85rem' }}>
                  {analysisResult.risk.toUpperCase()} RISK CONTRACT
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {analysisResult.clauses?.length || 0} Clauses Scanned
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
                {analysisResult.risk === 'High'
                  ? 'High Borrowing Risk Detected'
                  : analysisResult.risk === 'Medium'
                  ? 'Moderate Borrowing Terms with Conditions'
                  : 'Fair & Transparent Loan Facility'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', maxWidth: '750px', lineHeight: 1.5 }}>
                {analysisResult.risk === 'High'
                  ? 'This agreement contains severe penal interest rates, heavy foreclosure lock-ins, or ancillary administrative charges.'
                  : analysisResult.risk === 'Medium'
                  ? 'The terms are manageable, but watch out for benchmark reset adjustments and mandatory insurance fees.'
                  : 'All critical terms follow transparent consumer lending corridors with minimal penalty risk.'}
              </p>
            </div>

            <div className="score-dial-wrap">
              <div className={`score-number ${analysisResult.risk.toLowerCase()}`}>
                {analysisResult.risk_score}
              </div>
              <div className="score-caption">Risk Index</div>
            </div>
          </div>

          {/* 10 Key Terms Cards Grid */}
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
            Critical Loan Terms At A Glance
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Essential contractual terms extracted and standardized into clear, plain numbers:
          </p>

          <div className="term-cards-grid">
            {analysisResult.important_terms?.map((term, index) => (
              <div key={index} className="term-card">
                <div>
                  <div className="term-card-header">
                    <div className="term-title-group">
                      <div className="term-icon-box">
                        {term.term.includes('Interest') && <Percent size={16} />}
                        {term.term.includes('EMI') && <CreditCard size={16} />}
                        {term.term.includes('Tenure') && <Calendar size={16} />}
                        {term.term.includes('Fee') && <Receipt size={16} />}
                        {term.term.includes('Late') && <Clock size={16} />}
                        {term.term.includes('Foreclosure') && <FileWarning size={16} />}
                        {term.term.includes('Prepayment') && <RotateCcw size={16} />}
                        {term.term.includes('Insurance') && <Shield size={16} />}
                        {term.term.includes('Hidden') && <AlertTriangle size={16} />}
                        {term.term.includes('Risk') && <ShieldAlert size={16} />}
                      </div>
                      <span className="term-title">{term.term}</span>
                    </div>
                    <span className={`badge ${getRiskBadgeClass(term.risk)}`} style={{ fontSize: '0.75rem' }}>
                      {term.risk}
                    </span>
                  </div>

                  <div className="term-value">{term.value}</div>
                  {term.source_clause && (
                    <div className="term-source" title={term.source_clause}>
                      "{term.source_clause}"
                    </div>
                  )}
                </div>

                <div className="term-card-footer">
                  <span className="confidence-indicator">
                    <Sparkles size={12} color="#2563EB" />
                    {term.confidence}% confidence
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>Verified</span>
                </div>
              </div>
            ))}
          </div>

          {/* Plain-English Summary Card */}
          <div className="summary-card">
            <div className="summary-card-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '0.2rem' }}>
                  Plain-English Agreement Summary
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Clear translation free of complex banking and legal jargon
                </span>
              </div>

              <div className="summary-actions-group">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm summary-btn"
                  onClick={handleCopySummary}
                >
                  {copiedSummary ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm summary-btn"
                  onClick={handlePrintReport}
                >
                  <Printer size={14} />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            <div className="summary-content">
              <p className="summary-paragraph">
                {analysisResult.summary}
              </p>
            </div>
          </div>

          {/* Detailed Clauses Breakdown */}
          <div className="clauses-card">
            <div className="clauses-filter-bar">
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '0.2rem' }}>
                  Contract Clause Breakdown
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Showing {filteredClauses.length} categorized clauses
                </span>
              </div>

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
                  🔴 High Risk ({analysisResult.clauses?.filter((c) => c.risk_level === 'High').length || 0})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${clauseFilter === 'MED' ? 'active' : ''}`}
                  onClick={() => setClauseFilter('MED')}
                >
                  🟡 Moderate ({analysisResult.clauses?.filter((c) => c.risk_level === 'Medium').length || 0})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${clauseFilter === 'LOW' ? 'active' : ''}`}
                  onClick={() => setClauseFilter('LOW')}
                >
                  🟢 Safe ({analysisResult.clauses?.filter((c) => c.risk_level === 'Low').length || 0})
                </button>
              </div>
            </div>

            <div className="clauses-list">
              {filteredClauses.map((item) => (
                <div
                  key={item.id}
                  className={`clause-item risk-${item.risk_level === 'High' ? 'high' : item.risk_level === 'Medium' ? 'med' : 'low'}`}
                >
                  <div className="clause-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="clause-category-tag">{item.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Clause #{item.id}</span>
                    </div>
                    <span className={`badge ${getRiskBadgeClass(item.risk_level)}`} style={{ fontSize: '0.75rem' }}>
                      {item.risk_level} Risk
                    </span>
                  </div>

                  <p className="clause-text">"{item.clause}"</p>
                  <p className="clause-explanation">
                    <strong>Consumer Impact:</strong> {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
