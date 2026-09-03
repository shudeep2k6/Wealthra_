import React, { useState } from 'react';
import {
  Wallet,
  Receipt,
  PiggyBank,
  CreditCard,
  ShieldCheck,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const Assessment = ({ onNavigate }) => {
  const { financialData, updateAssessment, formatCurrency } = useFinancial();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ ...financialData });
  const [isSaved, setIsSaved] = useState(false);

  const steps = [
    { number: 1, title: 'Income', question: 'What money comes into your account each month?' },
    { number: 2, title: 'Essential Expenses', question: 'How much do you usually spend on essential needs?' },
    { number: 3, title: 'Savings', question: 'How much money could you use if something unexpected happened?' },
    { number: 4, title: 'Debt & Loans', question: 'Do you currently have loans or other debt?' },
    { number: 5, title: 'Stability Check', question: 'A few simple questions about your regular money routine.' },
    { number: 6, title: 'Financial Goals', question: 'What are your primary financial priorities right now?' }
  ];

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: Number(value) || 0
      }
    }));
  };

  const handleStabilityToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      stability: {
        ...prev.stability,
        [field]: !prev.stability[field]
      }
    }));
  };

  const toggleGoal = (goal) => {
    setFormData((prev) => {
      const exists = prev.goals.includes(goal);
      const nextGoals = exists ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal];
      return { ...prev, goals: nextGoals };
    });
  };

  const handleComplete = (e) => {
    e.preventDefault();
    updateAssessment(formData);
    setIsSaved(true);
    setTimeout(() => {
      onNavigate('dashboard');
    }, 600);
  };

  const goalsList = [
    'Build Emergency Fund',
    'Reduce Debt',
    'Save for Retirement',
    'Manage Monthly Expenses',
    'Improve Financial Stability'
  ];

  return (
    <div className="page-container fade-in" style={{ maxWidth: '820px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <span className="badge badge-blue" style={{ fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            Step {currentStep} of 6
          </span>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-navy)' }}>
            {steps[currentStep - 1].title}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)' }}>
            {steps[currentStep - 1].question}
          </p>
        </div>
      </div>

      {/* Progress pipeline */}
      <div className="assessment-steps-bar" style={{ marginBottom: '2rem' }}>
        {steps.map((s, idx) => {
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;
          return (
            <React.Fragment key={s.number}>
              <div
                className={`step-indicator-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => setCurrentStep(s.number)}
              >
                <div className="step-circle" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>
                  {isDone ? <CheckCircle2 size={18} /> : s.number}
                </div>
                <span className="step-label" style={{ fontSize: '0.85rem' }}>{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`step-connector ${isDone ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Form Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleComplete}>
          {/* Step 1: Income */}
          {currentStep === 1 && (
            <div className="fade-in">
              <div className="fields-2col">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.95rem' }}>Monthly Income (Salary / Pension)</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.income.monthlyIncome}
                      onChange={(e) => handleNestedChange('income', 'monthlyIncome', e.target.value)}
                      placeholder="50000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.95rem' }}>Other Income (Family, Rent, Support)</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.income.otherIncome}
                      onChange={(e) => handleNestedChange('income', 'otherIncome', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1.25rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#166534' }}>Total Money Coming In</span>
                <strong style={{ fontSize: '1.4rem', color: '#166534' }}>
                  {formatCurrency((Number(formData.income.monthlyIncome) || 0) + (Number(formData.income.otherIncome) || 0))}
                </strong>
              </div>
            </div>
          )}

          {/* Step 2: Essential Expenses */}
          {currentStep === 2 && (
            <div className="fade-in">
              <div className="fields-2col">
                <div className="form-group">
                  <label className="form-label">Housing (Rent / Maintenance)</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.expenses.housing}
                      onChange={(e) => handleNestedChange('expenses', 'housing', e.target.value)}
                      placeholder="12000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Food &amp; Groceries</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.expenses.food}
                      onChange={(e) => handleNestedChange('expenses', 'food', e.target.value)}
                      placeholder="7500"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Utilities (Electricity, Water, LPG, Wi-Fi)</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.expenses.utilities}
                      onChange={(e) => handleNestedChange('expenses', 'utilities', e.target.value)}
                      placeholder="3000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Transport (Bus, Metro, Fuel)</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.expenses.transport}
                      onChange={(e) => handleNestedChange('expenses', 'transport', e.target.value)}
                      placeholder="2500"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Healthcare &amp; Medicines</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.expenses.healthcare}
                      onChange={(e) => handleNestedChange('expenses', 'healthcare', e.target.value)}
                      placeholder="2500"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Non-Essential &amp; Discretionary</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.expenses.discretionary}
                      onChange={(e) => handleNestedChange('expenses', 'discretionary', e.target.value)}
                      placeholder="9500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Savings */}
          {currentStep === 3 && (
            <div className="fade-in">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.95rem' }}>Current Bank Savings Balance</label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.savings.currentSavings}
                    onChange={(e) => handleNestedChange('savings', 'currentSavings', e.target.value)}
                    placeholder="120000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.95rem' }}>Dedicated Emergency Savings (Protected money)</label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.savings.emergencyFund}
                    onChange={(e) => handleNestedChange('savings', 'emergencyFund', e.target.value)}
                    placeholder="88000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.95rem' }}>Monthly Savings (What you set aside each month)</label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.savings.monthlySavings}
                    onChange={(e) => handleNestedChange('savings', 'monthlySavings', e.target.value)}
                    placeholder="3500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Debt */}
          {currentStep === 4 && (
            <div className="fade-in">
              <div className="fields-2col">
                <div className="form-group">
                  <label className="form-label">Total Debt Balance (All loans combined)</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.debt.totalDebt}
                      onChange={(e) => handleNestedChange('debt', 'totalDebt', e.target.value)}
                      placeholder="380000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly EMI / Loan Payments</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.debt.monthlyEMI}
                      onChange={(e) => handleNestedChange('debt', 'monthlyEMI', e.target.value)}
                      placeholder="9500"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Home Loan Principal</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.debt.homeLoan}
                      onChange={(e) => handleNestedChange('debt', 'homeLoan', e.target.value)}
                      placeholder="250000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Card Outstanding Balance</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.debt.creditCard}
                      onChange={(e) => handleNestedChange('debt', 'creditCard', e.target.value)}
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Financial Stability */}
          {currentStep === 5 && (
            <div className="fade-in">
              <div className="habits-list">
                <div className="habit-item">
                  <span className="habit-question" style={{ fontSize: '0.95rem' }}>
                    Do you have enough savings to cover unexpected expenses?
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.stability.hasEmergencyCover === 'good' || formData.stability.hasEmergencyCover === 'moderate'}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          stability: {
                            ...prev.stability,
                            hasEmergencyCover: prev.stability.hasEmergencyCover === 'good' ? 'low' : 'good'
                          }
                        }))
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="habit-item">
                  <span className="habit-question" style={{ fontSize: '0.95rem' }}>
                    Have your essential expenses increased noticeably recently?
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.stability.expensesIncreasedRecently}
                      onChange={() => handleStabilityToggle('expensesIncreasedRecently')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="habit-item">
                  <span className="habit-question" style={{ fontSize: '0.95rem' }}>
                    Have you missed or delayed any loan or utility bill payments?
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.stability.missedPayments}
                      onChange={() => handleStabilityToggle('missedPayments')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="habit-item">
                  <span className="habit-question" style={{ fontSize: '0.95rem' }}>
                    Do you frequently depend on credit to pay for essential needs?
                  </span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.stability.frequentlyUseCredit}
                      onChange={() => handleStabilityToggle('frequentlyUseCredit')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Financial Goals */}
          {currentStep === 6 && (
            <div className="fade-in">
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
                Select all goals you would like our early warning and support engine to guide you toward:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {goalsList.map((g) => {
                  const selected = formData.goals.includes(g);
                  return (
                    <div
                      key={g}
                      onClick={() => toggleGoal(g)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: selected ? '2px solid var(--color-blue)' : '1px solid var(--color-border)',
                        backgroundColor: selected ? 'var(--color-blue-subtle)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>{g}</strong>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', border: selected ? '2px solid var(--color-blue)' : '2px solid var(--color-border)', backgroundColor: selected ? 'var(--color-blue)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        {selected && <CheckCircle2 size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="form-wizard-nav">
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft size={16} />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary btn-lg" disabled={isSaved}>
                <Sparkles size={18} />
                <span>{isSaved ? 'Updating Wellness...' : 'Generate My Financial Wellness Profile'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
