import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Coins,
  TrendingUp,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Download,
  Copy,
  Check,
  RefreshCw,
  Wallet,
  Calendar,
  Layers,
  PiggyBank,
  CheckCircle2,
  Info,
  HelpCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useFinancial } from '../context/FinancialContext';
import '../styles/incomeManager.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PIE_COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export const MonthlyIncomeManager = ({ onNavigate }) => {
  const { simpleLanguage } = useAccessibility();
  const { currentUser, formatCurrency } = useFinancial();

  // Initial Monthly Records (Preloaded with User Prompt Scenario)
  const [monthsData, setMonthsData] = useState([
    { month: 'January', income: 5000, essential_expenses: 6000, other_expenses: 2000 },
    { month: 'February', income: 30000, essential_expenses: 6000, other_expenses: 2000 },
    { month: 'March', income: 5000, essential_expenses: 6000, other_expenses: 2000 },
    { month: 'April', income: 18000, essential_expenses: 6000, other_expenses: 2000 },
    { month: 'May', income: 7500, essential_expenses: 6000, other_expenses: 2000 }
  ]);

  // Baseline Financial Parameters
  const [savings, setSavings] = useState(20000);
  const [investments, setInvestments] = useState(5000);
  const [loanEmi, setLoanEmi] = useState(2000);
  const [financialGoal, setFinancialGoal] = useState('Emergency Fund');
  const [goalAmount, setGoalAmount] = useState(60000);
  const [goalMonths, setGoalMonths] = useState(12);

  // Analysis & UI States
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Available Presets
  const [presets, setPresets] = useState([]);

  useEffect(() => {
    axios.get('/api/income/presets')
      .then(res => {
        if (res.data?.presets) {
          setPresets(res.data.presets);
        }
      })
      .catch(() => {
        // Fallback default presets
        setPresets([
          {
            id: 'preset-freelancer',
            title: 'Irregular Freelancer (Prompt Test Scenario)',
            monthly_income: [
              { month: 'January', income: 5000, essential_expenses: 6000, other_expenses: 2000 },
              { month: 'February', income: 30000, essential_expenses: 6000, other_expenses: 2000 },
              { month: 'March', income: 5000, essential_expenses: 6000, other_expenses: 2000 },
              { month: 'April', income: 18000, essential_expenses: 6000, other_expenses: 2000 },
              { month: 'May', income: 7500, essential_expenses: 6000, other_expenses: 2000 }
            ],
            expenses: 8000,
            savings: 20000,
            investments: 5000,
            loan_emi: 2000,
            financial_goal: 'Emergency Fund',
            goal_amount: 60000,
            goal_months: 12
          }
        ]);
      });
  }, []);

  // Handlers for Month Table
  const handleAddMonth = () => {
    const nextIdx = monthsData.length;
    const nextName = MONTH_NAMES[nextIdx % 12] || `Month ${nextIdx + 1}`;
    const lastRec = monthsData[monthsData.length - 1] || { essential_expenses: 6000, other_expenses: 2000 };
    setMonthsData([
      ...monthsData,
      {
        month: nextName,
        income: 15000,
        essential_expenses: lastRec.essential_expenses,
        other_expenses: lastRec.other_expenses
      }
    ]);
  };

  const handleRemoveMonth = (index) => {
    if (monthsData.length <= 1) {
      setErrorMessage('Please keep at least one month of data for analysis.');
      return;
    }
    const updated = monthsData.filter((_, idx) => idx !== index);
    setMonthsData(updated);
  };

  const handleMonthChange = (index, field, value) => {
    const updated = [...monthsData];
    updated[index][field] = field === 'month' ? value : Number(value) || 0;
    setMonthsData(updated);
  };

  const handleApplyPreset = (preset) => {
    setMonthsData(preset.monthly_income);
    setSavings(preset.savings || 20000);
    setInvestments(preset.investments || 5000);
    setLoanEmi(preset.loan_emi || 2000);
    setFinancialGoal(preset.financial_goal || 'Emergency Fund');
    setGoalAmount(preset.goal_amount || 60000);
    setGoalMonths(preset.goal_months || 12);
    setErrorMessage('');
    setAnalysisResult(null);
  };

  // Run Income Analysis
  const handleAnalyzeIncome = async () => {
    if (!monthsData || monthsData.length === 0) {
      setErrorMessage('Please enter at least one month of income data.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        monthly_income: monthsData,
        savings: Number(savings) || 0,
        investments: Number(investments) || 0,
        loan_emi: Number(loanEmi) || 0,
        financial_goal: financialGoal,
        goal_amount: Number(goalAmount) || 60000,
        goal_months: Number(goalMonths) || 12
      };

      const response = await axios.post('/api/income/analyze', payload);
      setAnalysisResult(response.data);
    } catch (err) {
      console.error('Income Analysis Error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to analyze income pattern.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy Summary Handler
  const handleCopyRecommendation = () => {
    if (!analysisResult) return;
    const textToCopy = `Wealthra Monthly Income Analysis:
Profile: ${analysisResult.mlProfile?.category} (Variability: ${analysisResult.incomeVariability}%)
Average Monthly Income: ₹${analysisResult.averageIncome.toLocaleString('en-IN')}
Income Buffer: ${analysisResult.incomeBuffer} months of essential expenses
Financial Health Score: ${analysisResult.financialHealthScore}/100 (${analysisResult.riskLevel})

Recommended Monthly Allocation:
- Essential Expenses: ${analysisResult.allocation.essential_expenses.percentage}% (₹${analysisResult.allocation.essential_expenses.amount.toLocaleString('en-IN')})
- Emergency Buffer Reserve: ${analysisResult.allocation.emergency_reserve.percentage}% (₹${analysisResult.allocation.emergency_reserve.amount.toLocaleString('en-IN')})
- Income Smoothing Fund: ${analysisResult.allocation.savings.percentage}% (₹${analysisResult.allocation.savings.amount.toLocaleString('en-IN')})
- Future Wealth Investments: ${analysisResult.allocation.investment.percentage}% (₹${analysisResult.allocation.investment.amount.toLocaleString('en-IN')})
- Flexible Spending: ${analysisResult.allocation.flexible_spending.percentage}% (₹${analysisResult.allocation.flexible_spending.amount.toLocaleString('en-IN')})`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // PDF Export
  const handleDownloadPDF = () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Header
    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text('Wealthra - Monthly Income & Buffer Plan', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`User: ${currentUser.name} | Date: ${new Date().toLocaleDateString()} | ML Profile: ${analysisResult.mlProfile?.category}`, 14, 27);

    // Section 1: Overview
    let y = 46;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(11, 18, 32);
    doc.text('1. Income Volatility & Financial Health Overview', 14, y);

    y += 8;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`• Average Monthly Income: Rs. ${analysisResult.averageIncome.toLocaleString('en-IN')}`, 14, y);
    doc.text(`• Income Variability: ${analysisResult.incomeVariability}%`, 110, y);
    y += 6;
    doc.text(`• Peak Income Month: Rs. ${analysisResult.highestIncome.toLocaleString('en-IN')}`, 14, y);
    doc.text(`• Trough Income Month: Rs. ${analysisResult.lowestIncome.toLocaleString('en-IN')}`, 110, y);
    y += 6;
    doc.text(`• Income Buffer Runway: ${analysisResult.incomeBuffer} Months`, 14, y);
    doc.text(`• Financial Health Score: ${analysisResult.financialHealthScore}/100 (${analysisResult.riskLevel})`, 110, y);
    y += 6;
    doc.text(`• Forecast Next Month: Rs. ${analysisResult.predictedIncome.toLocaleString('en-IN')} (${analysisResult.predictedIncomeStatus})`, 14, y);

    // Section 2: Recommended Allocation
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(11, 18, 32);
    doc.text('2. Recommended Smart Money Allocation', 14, y);

    y += 8;
    const alloc = analysisResult.allocation;
    Object.values(alloc).forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(37, 99, 235);
      doc.text(`• ${item.label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`${item.percentage}% (Rs. ${item.amount.toLocaleString('en-IN')})`, 75, y);
      y += 5.5;
    });

    // Section 3: AI Insights
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(11, 18, 32);
    doc.text('3. AI Guidance & Windfall Cautions', 14, y);

    y += 8;
    analysisResult.insights.forEach((ins) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`[${ins.title}]`, 14, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(ins.message, pageWidth - 28);
      doc.text(lines, 14, y);
      y += (lines.length * 4) + 4;
    });

    // Section 4: Projections
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(11, 18, 32);
    doc.text('4. Future Wealth Plan Projections', 14, y);

    y += 8;
    const proj = analysisResult.wealthPlan?.projections || [];
    proj.forEach((p) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${p.month}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Buffer: Rs. ${p.projected_buffer.toLocaleString('en-IN')} | Net Wealth: Rs. ${p.total_wealth.toLocaleString('en-IN')} | Goal Progress: ${p.goal_progress_pct}%`, 35, y);
      y += 5.5;
    });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Wealthra Safe Banking & Income Management Engine', 14, 288);

    doc.save('Wealthra_Monthly_Income_Manager_Plan.pdf');
  };

  // Prepare Allocation Pie Data
  const allocationPieData = analysisResult ? Object.values(analysisResult.allocation).map(item => ({
    name: item.label,
    value: item.amount,
    percentage: item.percentage
  })) : [];

  return (
    <div className="page-container fade-in income-manager-container">
      {/* Header Banner */}
      <div className="income-header">
        <div className="income-header-badge-row">
          <span className="income-pill">
            <Coins size={14} />
            Irregular Income Stabilizer
          </span>
          <span className="brand-badge" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
            Machine Learning Powered
          </span>
        </div>
        <h1>Monthly Income Manager</h1>
        <p>
          {simpleLanguage
            ? 'Smooth out your money when some months have big pay and other months have small pay. Avoid running out of money.'
            : 'Designed for freelancers, entrepreneurs, and small business owners with fluctuating earnings. Analyze month-to-month volatility, establish income buffers, and prevent overspending during high-income windfall cycles.'}
        </p>
      </div>

      {/* Input Workspace */}
      <div className="income-card">
        <div className="income-card-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '0.2rem' }}>
              Historical Income &amp; Expense Data
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Enter recent monthly earnings to train the volatility model and calibrate your reserve requirements
            </span>
          </div>

          {/* Quick Presets */}
          <div className="presets-group">
            <span className="presets-label">Quick Presets:</span>
            {presets.map(p => (
              <button
                key={p.id}
                type="button"
                className="preset-chip-btn"
                onClick={() => handleApplyPreset(p)}
              >
                {p.title.includes('Freelancer') ? '🔴 Irregular Freelancer' : p.title.includes('Shop') ? '🟡 Seasonal Business' : '🟢 Stable Consultant'}
              </button>
            ))}
          </div>
        </div>

        {/* Months Input Table */}
        <div className="months-table-container">
          <table className="months-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Month</th>
                <th style={{ width: '25%' }}>Monthly Income (₹)</th>
                <th style={{ width: '25%' }}>Essential Expenses (₹)</th>
                <th style={{ width: '20%' }}>Other Expenses (₹)</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {monthsData.map((row, idx) => {
                const totalExp = (Number(row.essential_expenses) || 0) + (Number(row.other_expenses) || 0);
                const surplus = (Number(row.income) || 0) - totalExp;

                return (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        className="month-input-field"
                        value={row.month}
                        onChange={(e) => handleMonthChange(idx, 'month', e.target.value)}
                        placeholder="Month name"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="month-input-field"
                        value={row.income}
                        onChange={(e) => handleMonthChange(idx, 'income', e.target.value)}
                        placeholder="Income in ₹"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="month-input-field"
                        value={row.essential_expenses}
                        onChange={(e) => handleMonthChange(idx, 'essential_expenses', e.target.value)}
                        placeholder="Rent, food, bills"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="month-input-field"
                        value={row.other_expenses}
                        onChange={(e) => handleMonthChange(idx, 'other_expenses', e.target.value)}
                        placeholder="Discretionary"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
                        onClick={() => handleRemoveMonth(idx)}
                        title="Remove Month"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Month button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddMonth}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Add Month</span>
        </button>

        {/* Global Financial Parameters */}
        <div className="params-grid">
          <div className="param-group">
            <label className="param-label">Existing Savings (₹)</label>
            <input
              type="number"
              className="month-input-field"
              value={savings}
              onChange={(e) => setSavings(Number(e.target.value) || 0)}
            />
          </div>

          <div className="param-group">
            <label className="param-label">Current Investments (₹)</label>
            <input
              type="number"
              className="month-input-field"
              value={investments}
              onChange={(e) => setInvestments(Number(e.target.value) || 0)}
            />
          </div>

          <div className="param-group">
            <label className="param-label">Monthly Loan / EMI Payments (₹)</label>
            <input
              type="number"
              className="month-input-field"
              value={loanEmi}
              onChange={(e) => setLoanEmi(Number(e.target.value) || 0)}
            />
          </div>

          <div className="param-group">
            <label className="param-label">Primary Financial Goal</label>
            <input
              type="text"
              className="month-input-field"
              value={financialGoal}
              onChange={(e) => setFinancialGoal(e.target.value)}
            />
          </div>

          <div className="param-group">
            <label className="param-label">Goal Target Amount (₹)</label>
            <input
              type="number"
              className="month-input-field"
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value) || 0)}
            />
          </div>

          <div className="param-group">
            <label className="param-label">Goal Timeframe (Months)</label>
            <input
              type="number"
              className="month-input-field"
              value={goalMonths}
              onChange={(e) => setGoalMonths(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Trigger Action */}
        <div className="action-submit-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#16A34A" />
            <span>Real statistical variance modeling + Scikit-Learn profile classification.</span>
          </div>

          <button
            type="button"
            className="analyze-income-btn"
            onClick={handleAnalyzeIncome}
            disabled={isLoading}
            id="btn-analyze-income"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="spin-animation" />
                <span>Running Volatility Model...</span>
              </>
            ) : (
              <>
                <TrendingUp size={18} />
                <span>Analyze Income Pattern</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="results-container fade-in">
          {/* 5 Income Overview Cards */}
          <div className="income-overview-grid">
            <div className="overview-metric-card">
              <div className="metric-top-row">
                <span className="metric-tag-label">Average Monthly Income</span>
                <Coins size={18} color="#2563EB" />
              </div>
              <div className="metric-stat-value">₹{analysisResult.averageIncome.toLocaleString('en-IN')}</div>
              <span className="metric-stat-sub">Based on {monthsData.length} recorded months</span>
            </div>

            <div className="overview-metric-card">
              <div className="metric-top-row">
                <span className="metric-tag-label">Highest Month (Peak)</span>
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                  {analysisResult.highIncomeMonths[0] || 'Peak'}
                </span>
              </div>
              <div className="metric-stat-value" style={{ color: '#D97706' }}>
                ₹{analysisResult.highestIncome.toLocaleString('en-IN')}
              </div>
              <span className="metric-stat-sub">Avoid treating peak as regular income</span>
            </div>

            <div className="overview-metric-card">
              <div className="metric-top-row">
                <span className="metric-tag-label">Lowest Month (Trough)</span>
                <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                  {analysisResult.lowIncomeMonths[0] || 'Trough'}
                </span>
              </div>
              <div className="metric-stat-value" style={{ color: '#DC2626' }}>
                ₹{analysisResult.lowestIncome.toLocaleString('en-IN')}
              </div>
              <span className="metric-stat-sub">Stable floor: ₹{analysisResult.stableIncomeLevel.toLocaleString('en-IN')}</span>
            </div>

            <div className="overview-metric-card">
              <div className="metric-top-row">
                <span className="metric-tag-label">Income Variability</span>
                <span className={`badge ${analysisResult.incomeVariability > 45 ? 'badge-danger' : analysisResult.incomeVariability > 25 ? 'badge-warning' : 'badge-positive'}`} style={{ fontSize: '0.7rem' }}>
                  {analysisResult.incomeVariability > 45 ? 'High Volatility' : analysisResult.incomeVariability > 25 ? 'Moderate' : 'Stable'}
                </span>
              </div>
              <div className="metric-stat-value">{analysisResult.incomeVariability}%</div>
              <span className="metric-stat-sub">Coefficient of Variation (CV)</span>
            </div>

            <div className="overview-metric-card">
              <div className="metric-top-row">
                <span className="metric-tag-label">Expected Next Month</span>
                <span className={`badge ${analysisResult.predictedIncomeStatus === 'High' ? 'badge-positive' : analysisResult.predictedIncomeStatus === 'Low' ? 'badge-danger' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
                  {analysisResult.predictedIncomeStatus} Estimate
                </span>
              </div>
              <div className="metric-stat-value" style={{ color: '#2563EB' }}>
                ₹{analysisResult.predictedIncome.toLocaleString('en-IN')}
              </div>
              <span className="metric-stat-sub">
                {analysisResult.isDataLimited ? '⚠️ Based on limited data' : 'Statistical trend estimate'}
              </span>
            </div>
          </div>

          {/* Financial Health Score & ML Classification Banner */}
          <div className={`health-score-banner ${analysisResult.riskLevel.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className={`score-badge-circle ${analysisResult.riskLevel.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className={`score-number-big ${analysisResult.riskLevel.toLowerCase().replace(/\s+/g, '-')}`}>
                {analysisResult.financialHealthScore}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                / 100
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span className="badge" style={{ backgroundColor: '#FFFFFF', color: 'var(--color-navy)', fontWeight: 800, fontSize: '0.8rem' }}>
                  {analysisResult.riskLevel.toUpperCase()}
                </span>
                <span className="badge" style={{ backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', fontWeight: 700, fontSize: '0.8rem' }}>
                  ML Profile: {analysisResult.mlProfile?.category} ({analysisResult.mlProfile?.confidence}% confidence)
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
                {analysisResult.riskLevel === 'High Risk'
                  ? 'Financial Fragility Warning: High Volatility & Low Cushion'
                  : analysisResult.riskLevel === 'Needs Improvement'
                  ? 'Income Smoothing Required: Guard Against Peak-Month Illusion'
                  : 'Stable Cash Flow Management Profile'}
              </h3>

              <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {analysisResult.scoreReasons.map((reason, rIdx) => (
                  <li key={rIdx}>{reason}</li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyRecommendation}
              >
                {copiedSummary ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                <span>{copiedSummary ? 'Copied!' : 'Copy Plan'}</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDownloadPDF}
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Income Buffer Spotlight */}
          <div className="buffer-spotlight-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={20} color="#38BDF8" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                  Core Safety Metric: Income Buffer
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Your savings support approximately {analysisResult.incomeBuffer} months of essential expenses.
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', maxWidth: '650px', margin: 0 }}>
                For an irregular earner ({analysisResult.incomeVariability}% variability), Wealthra recommends maintaining at least <strong>{analysisResult.recommendedBufferTarget} months</strong> of emergency runway (₹{analysisResult.emergencyReserveRequirement.toLocaleString('en-IN')}) to absorb lean months without debt distress.
              </p>
            </div>

            <div className="buffer-gauge-wrap">
              <div className="buffer-months-val">{analysisResult.incomeBuffer}</div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, marginTop: '0.2rem' }}>
                Months Runway
              </div>
              <span style={{ fontSize: '0.7rem', color: analysisResult.incomeBuffer >= analysisResult.recommendedBufferTarget ? '#4ADE80' : '#F87171' }}>
                {analysisResult.incomeBuffer >= analysisResult.recommendedBufferTarget ? '✓ Target Achieved' : `Needs ${(analysisResult.recommendedBufferTarget - analysisResult.incomeBuffer).toFixed(1)} more months`}
              </span>
            </div>
          </div>

          {/* Smart Money Allocation Card */}
          <div className="income-card">
            <div className="income-card-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                  Recommended Monthly Money Allocation
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Dynamic formula adapting to your volatility to ensure surplus months fill upcoming lean-month gaps
                </span>
              </div>
              <span className="badge badge-blue" style={{ fontSize: '0.8rem' }}>
                Calibrated to Volatility Profile
              </span>
            </div>

            <div className="allocation-grid">
              {Object.entries(analysisResult.allocation).map(([key, item], idx) => {
                const typeClass = key === 'essential_expenses'
                  ? 'essential'
                  : key === 'emergency_reserve'
                  ? 'emergency'
                  : key === 'savings'
                  ? 'smoothing'
                  : key === 'investment'
                  ? 'invest'
                  : 'flex';

                return (
                  <div key={idx} className={`alloc-item-card ${typeClass}`}>
                    <div>
                      <span className="alloc-title">{item.label}</span>
                      <div className="alloc-amount">₹{item.amount.toLocaleString('en-IN')}</div>
                      <span className="alloc-pct-pill">{item.percentage}% of month</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.65rem', marginBottom: 0 }}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Charts Section (recharts) */}
          <div className="charts-grid-2col">
            {/* Chart 1: Historical Income & Expense Trend */}
            <div className="income-card" style={{ marginBottom: 0 }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: '1rem' }}>
                Monthly Income &amp; Expense Trajectory
              </h4>
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisResult.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="income" name="Income" stroke="#2563EB" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="total_expenses" name="Expenses" stroke="#DC2626" strokeWidth={2} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Smart Allocation Breakdown */}
            <div className="income-card" style={{ marginBottom: 0 }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: '1rem' }}>
                Recommended Allocation Breakdown
              </h4>
              <div style={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={50}
                      paddingAngle={3}
                      label={({ name, percentage }) => `${percentage}%`}
                    >
                      {allocationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '0.75rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights & Guidance */}
          <div className="income-card">
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#2563EB" />
              <span>AI Irregular Income Insights</span>
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Tailored rules to protect your lifestyle from sudden cash flow dry spells
            </span>

            <div className="insights-list">
              {analysisResult.insights.map((ins, iIdx) => (
                <div key={iIdx} className={`insight-card ${ins.type}`}>
                  <div style={{ marginTop: '0.1rem' }}>
                    {ins.type === 'warning' && <AlertTriangle size={18} color="#D97706" />}
                    {ins.type === 'info' && <Info size={18} color="#2563EB" />}
                    {ins.type === 'action' && <Briefcase size={18} color="#A855F7" />}
                    {ins.type === 'positive' && <CheckCircle2 size={18} color="#16A34A" />}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.2rem' }}>
                      {ins.title}
                    </strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {ins.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Future Wealth Plan Table */}
          <div className="income-card">
            <div className="income-card-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                  Future Wealth Plan (Projected Savings Growth)
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Projected timeline towards goal: <strong>{analysisResult.wealthPlan?.goal}</strong> (Target: ₹{analysisResult.wealthPlan?.goal_amount.toLocaleString('en-IN')})
                </span>
              </div>
              <span className="badge badge-positive" style={{ fontSize: '0.8rem' }}>
                Smoothed Compounding Trajectory
              </span>
            </div>

            <table className="wealth-table">
              <thead>
                <tr>
                  <th>Milestone Horizon</th>
                  <th>Projected Buffer Reserve</th>
                  <th>Projected Long-Term Investments</th>
                  <th>Total Accumulated Wealth</th>
                  <th>Goal Achievement</th>
                </tr>
              </thead>
              <tbody>
                {(analysisResult.wealthPlan?.projections || []).map((proj, pIdx) => (
                  <tr key={pIdx}>
                    <td>
                      <strong style={{ color: 'var(--color-navy)' }}>{proj.month}</strong>
                    </td>
                    <td>₹{proj.projected_buffer.toLocaleString('en-IN')}</td>
                    <td>₹{proj.projected_investments.toLocaleString('en-IN')}</td>
                    <td>
                      <strong style={{ color: '#2563EB' }}>₹{proj.total_wealth.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${proj.goal_progress_pct}%`, height: '100%', backgroundColor: proj.goal_progress_pct >= 100 ? '#16A34A' : '#2563EB' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-navy)', minWidth: '42px' }}>
                          {proj.goal_progress_pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Footer Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAnalysisResult(null);
              }}
            >
              <RefreshCw size={16} />
              <span>Modify Historical Data</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => onNavigate('expenses')}
              >
                <span>View Monthly Flow &amp; Expenses</span>
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
