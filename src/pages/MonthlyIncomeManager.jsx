// src/pages/MonthlyIncomeManager.jsx
import React, { useState, useEffect } from 'react';
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
  Clock,
  Briefcase
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_INCOME_PRESETS, analyzeIncomeDataLocally, analyzeIncomeData } from '../services/incomeManagerService';
import '../styles/incomeManager.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PIE_COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export const MonthlyIncomeManager = ({ onNavigate }) => {
  const { formatCurrency } = useFinancial();
  const { t } = useLanguage();

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
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [presets] = useState(DEFAULT_INCOME_PRESETS);

  // Initial automatic run
  useEffect(() => {
    handleRunAnalysis();
  }, []);

  const handleMonthFieldChange = (index, field, value) => {
    setMonthsData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'month' ? value : Math.max(0, Number(value) || 0)
      };
      return updated;
    });
  };

  const handleAddMonth = () => {
    if (monthsData.length >= 12) return;
    const nextIdx = monthsData.length % 12;
    setMonthsData(prev => [
      ...prev,
      {
        month: MONTH_NAMES[nextIdx],
        income: 15000,
        essential_expenses: 6500,
        other_expenses: 2500
      }
    ]);
  };

  const handleRemoveMonth = (index) => {
    if (monthsData.length <= 2) return;
    setMonthsData(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoadPreset = (preset) => {
    setMonthsData(preset.monthly_income);
    setSavings(preset.savings);
    setInvestments(preset.investments);
    setLoanEmi(preset.loan_emi);
    setFinancialGoal(preset.goal || 'Emergency Fund');
    setGoalAmount(preset.goalAmount || 60000);
    setGoalMonths(preset.goalMonths || 12);

    const res = analyzeIncomeDataLocally({
      monthly_income: preset.monthly_income,
      savings: preset.savings,
      investments: preset.investments,
      loan_emi: preset.loan_emi,
      financialGoal: preset.goal,
      goalAmount: preset.goalAmount,
      goalMonths: preset.goalMonths
    });
    setAnalysisResult(res);
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    const payload = {
      monthly_income: monthsData,
      savings: Number(savings),
      investments: Number(investments),
      loan_emi: Number(loanEmi),
      financialGoal,
      goalAmount: Number(goalAmount),
      goalMonths: Number(goalMonths)
    };

    try {
      const result = await analyzeIncomeData(payload);
      setAnalysisResult(result);
    } catch {
      const localResult = analyzeIncomeDataLocally(payload);
      setAnalysisResult(localResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!analysisResult) return;
    const text = `Wealthra Monthly Income & Smoothing Report
Profile: ${analysisResult.profileCategory} (Health Score: ${analysisResult.healthScore}/100)
Average Monthly Income: ₹${analysisResult.averageIncome.toLocaleString('en-IN')}
Income Volatility (CV): ${analysisResult.coefficientOfVariation}%
Essential Living Expenses: ₹${analysisResult.averageEssentialExpenses.toLocaleString('en-IN')}/mo
Emergency Runway Buffer: ${analysisResult.emergencyRunwayMonths} months
Target Goal: ${analysisResult.goalAnalysis?.goalName} (₹${analysisResult.goalAnalysis?.targetAmount?.toLocaleString('en-IN')}) - ${analysisResult.goalAnalysis?.feasibility}
Recommendations:
${analysisResult.actionableAdvice?.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Pie chart data transformation
  const budgetSplitData = analysisResult ? [
    { name: 'Essential Needs', value: analysisResult.recommendedBudgetSplit.essential_needs_pct },
    { name: 'Emergency Buffer', value: analysisResult.recommendedBudgetSplit.emergency_buffer_pct },
    { name: 'Savings Reserve', value: analysisResult.recommendedBudgetSplit.savings_pct },
    { name: 'Investments', value: analysisResult.recommendedBudgetSplit.investment_pct },
    { name: 'Flexible Lifestyle', value: analysisResult.recommendedBudgetSplit.flexible_discretionary_pct }
  ] : [];

  return (
    <div className="page-container fade-in income-manager-container">
      {/* Header Banner */}
      <div className="income-header">
        <div className="income-header-badge-row">
          <span className="income-pill">
            <Coins size={14} />
            <span>AI Income Smoothing & Cash Flow Guard</span>
          </span>
          <span className="badge badge-blue">Adaptive Banking</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.35rem 0' }}>
          Monthly Income Manager & Buffer Engine
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#94A3B8', maxWidth: '820px', lineHeight: 1.5 }}>
          Built for freelancers, small business owners, gig workers, and individuals with fluctuating monthly earnings.
          Track variable months, calculate your safe baseline spending, and avoid cash crunches during low-income phases.
        </p>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} color="var(--color-blue)" />
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>
              Quick Preset Scenarios
            </strong>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
            Select a financial archetype to test irregular income handling:
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
          {presets.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleLoadPreset(p)}
              className="btn btn-secondary"
              style={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                padding: '0.75rem 1rem',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)'
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-navy)' }}>{p.title}</strong>
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{p.description}</small>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Configuration Grid: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Column 1: Month-by-Month Income & Expense Ledger */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--color-blue)" />
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-navy)' }}>
                Multi-Month Cash Inflows &amp; Outflows
              </strong>
            </div>
            <button
              type="button"
              onClick={handleAddMonth}
              disabled={monthsData.length >= 12}
              className="btn btn-outline-primary btn-sm"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              <span>Add Month</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {monthsData.map((row, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 1fr auto',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Month</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-navy)' }}>{row.month}</strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', display: 'block' }}>Income (₹)</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                    value={row.income}
                    onChange={(e) => handleMonthFieldChange(idx, 'income', e.target.value)}
                    min="0"
                  />
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', display: 'block' }}>Essential (₹)</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                    value={row.essential_expenses}
                    onChange={(e) => handleMonthFieldChange(idx, 'essential_expenses', e.target.value)}
                    min="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMonth(idx)}
                  disabled={monthsData.length <= 2}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: monthsData.length <= 2 ? '#CBD5E1' : '#EF4444',
                    cursor: monthsData.length <= 2 ? 'not-allowed' : 'pointer',
                    padding: '0.35rem'
                  }}
                  title="Remove this month"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Baseline Savings, Fixed Debt & Target Goals */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Layers size={18} color="var(--color-blue)" />
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-navy)' }}>
                Baseline Assets, Debt &amp; Goal Target
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Current Liquid Savings</label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    value={savings}
                    onChange={(e) => setSavings(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Investments / FDs</label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    value={investments}
                    onChange={(e) => setInvestments(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Fixed Monthly Debt (Loans &amp; EMIs)</label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  className="form-input"
                  value={loanEmi}
                  onChange={(e) => setLoanEmi(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0', marginBottom: '1.25rem' }}>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>
                Primary Financial Goal
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#166534', display: 'block' }}>Target Amount (₹)</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ backgroundColor: '#FFF', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(Math.max(1000, Number(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#166534', display: 'block' }}>Timeframe (Months)</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ backgroundColor: '#FFF', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                    value={goalMonths}
                    onChange={(e) => setGoalMonths(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          >
            {isLoading ? <RefreshCw className="spin" size={18} /> : <Sparkles size={18} />}
            <span>{isLoading ? 'Running ML Modeling...' : 'Analyze Income Flow & Risks'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="fade-in">
          {/* Top Score & Summary Banner */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              borderLeft: `5px solid ${analysisResult.healthScore >= 70 ? '#16A34A' : analysisResult.healthScore >= 45 ? '#2563EB' : '#EF4444'}`,
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Financial Category Assessment
                </span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', margin: '0.2rem 0' }}>
                  {analysisResult.profileCategory}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span className={`badge ${analysisResult.healthScore >= 70 ? 'badge-positive' : analysisResult.healthScore >= 45 ? 'badge-blue' : 'badge-danger'}`}>
                    Health Score: {analysisResult.healthScore} / 100
                  </span>
                  <span className="badge badge-warning">
                    Volatility CV: {analysisResult.coefficientOfVariation}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={handleCopySummary} className="btn btn-secondary btn-sm">
                  {copiedSummary ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button type="button" onClick={handlePrintReport} className="btn btn-outline-primary btn-sm">
                  <Download size={14} />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* 4 Quick Stat Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Average Monthly Income</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>{formatCurrency(analysisResult.averageIncome)}</strong>
                <small style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                  Range: {formatCurrency(analysisResult.lowestIncome)} - {formatCurrency(analysisResult.highestIncome)}
                </small>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Avg Essential Expenses</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>{formatCurrency(analysisResult.averageEssentialExpenses)}</strong>
                <small style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                  {Math.round((analysisResult.averageEssentialExpenses / Math.max(1, analysisResult.averageIncome)) * 100)}% of average income
                </small>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Emergency Runway</span>
                <strong style={{ fontSize: '1.25rem', color: analysisResult.emergencyRunwayMonths >= 3 ? '#16A34A' : '#EF4444' }}>
                  {analysisResult.emergencyRunwayMonths} months
                </strong>
                <small style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                  {analysisResult.emergencyRunwayMonths >= 6 ? 'Solid buffer' : 'Target: 6 months'}
                </small>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '0.85rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Debt-to-Income (DTI)</span>
                <strong style={{ fontSize: '1.25rem', color: analysisResult.debtToIncomeRatio > 35 ? '#EF4444' : 'var(--color-navy)' }}>
                  {analysisResult.debtToIncomeRatio}%
                </strong>
                <small style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                  EMI: {formatCurrency(analysisResult.monthlyLoanEmi)}/mo
                </small>
              </div>
            </div>
          </div>

          {/* Visualization Section: Bar Chart & Donut Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Chart 1: Cash Flow Comparison Bar Chart */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={18} color="var(--color-blue)" />
                <strong style={{ fontSize: '1rem', color: 'var(--color-navy)' }}>
                  Monthly Cash Flow Trend (Inflow vs Outflow)
                </strong>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult.records}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val) => formatCurrency(val)}
                      contentStyle={{ backgroundColor: '#0B1220', color: '#FFF', borderRadius: '8px', border: 'none' }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="essential_expenses" name="Essential Needs" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Recommended Safe Budget Split Donut */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <PieChart size={18} color="var(--color-blue)" />
                <strong style={{ fontSize: '1rem', color: 'var(--color-navy)' }}>
                  Recommended Adaptive Budget Split
                </strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ width: 180, height: 200, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={budgetSplitData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {budgetSplitData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => `${val}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {budgetSplitData.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
                      </div>
                      <strong style={{ color: 'var(--color-navy)' }}>{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Advice & Goal Feasibility */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                Personalized Cash Flow Action Steps
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analysisResult.actionableAdvice?.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)' }}>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                Goal Feasibility Assessment
              </strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Target Goal:</span>
                  <strong style={{ color: 'var(--color-navy)' }}>{analysisResult.goalAnalysis?.goalName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Target Amount:</span>
                  <strong style={{ color: 'var(--color-navy)' }}>{formatCurrency(analysisResult.goalAnalysis?.targetAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Required Monthly Savings:</span>
                  <strong style={{ color: '#2563EB' }}>{formatCurrency(analysisResult.goalAnalysis?.monthlyTarget)}/mo</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Feasibility Status:</span>
                  <span className={`badge ${analysisResult.goalAnalysis?.feasibility === 'Easily Feasible' ? 'badge-positive' : 'badge-warning'}`}>
                    {analysisResult.goalAnalysis?.feasibility}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
