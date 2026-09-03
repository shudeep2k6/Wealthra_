import React, { useState } from 'react';
import { CreditCard, ShieldCheck, AlertCircle, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';

export const DebtHealth = ({ onNavigate }) => {
  const { calculations, formatCurrency } = useFinancial();
  const { simpleLanguage } = useAccessibility();
  const { t } = useLanguage();

  // What-if simulator slider for debt stress
  const [extraDebtEMI, setExtraDebtEMI] = useState(0);

  const totalEMI = calculations.monthlyDebtPayments + extraDebtEMI;
  const currentDTI = Math.round((totalEMI / calculations.totalIncome) * 100);

  const isManageable = currentDTI < 35;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>{t('debt.title', 'Debt & Loan Health')}</h1>
          <p>
            {t('debt.subtitle', 'Understand your loans and repayments without confusion so you can stay comfortably ahead of monthly EMIs.')}
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('loan-detector')}>
            <span>{t('debt.scanAgreement', 'Scan Loan Agreement')}</span>
            <ArrowRight size={14} />
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigate('guidance')}>
            {t('debt.whatIfCannotRepay', 'What if I cannot repay a loan?')}
          </button>
        </div>
      </div>

      {/* 4 Cards Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{t('debt.totalOutstanding', 'Total Debt Outstanding')}</span>
          <strong style={{ fontSize: '1.75rem', color: 'var(--color-navy)' }}>{formatCurrency(380000)}</strong>
          <small style={{ display: 'block', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Home, personal &amp; credit card</small>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{t('debt.monthlyEMI', 'Monthly Loan Payments')}</span>
          <strong style={{ fontSize: '1.75rem', color: 'var(--color-navy)' }}>{formatCurrency(totalEMI)}</strong>
          <small style={{ display: 'block', color: '#16A34A', marginTop: '0.2rem', fontWeight: 600 }}>Active Auto-Debit</small>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{t('debt.dtiProportion', 'Debt-to-Income Proportion')}</span>
          <strong style={{ fontSize: '1.75rem', color: isManageable ? 'var(--color-navy)' : '#DC2626' }}>{currentDTI}%</strong>
          <small style={{ display: 'block', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Safe guideline: &lt; 35%</small>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Overall Debt Status</span>
          <div style={{ marginTop: '0.35rem' }}>
            <span className={`badge ${isManageable ? 'badge-positive' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
              {isManageable ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
              {isManageable ? 'Manageable' : 'Under Pressure'}
            </span>
          </div>
        </div>
      </div>

      {/* Simple Explanation Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '0.4rem' }}>
          {simpleLanguage ? 'What This Means For Your Budget' : 'Plain Language Assessment'}
        </h3>

        <div style={{ backgroundColor: isManageable ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${isManageable ? '#BBF7D0' : '#FECACA'}`, borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.95rem', color: isManageable ? '#166534' : '#991B1B', lineHeight: 1.6 }}>
            {isManageable
              ? '“Your current debt payments are within a manageable range based on your income. Approximately 19% of your monthly earnings go toward repaying loans, leaving healthy room for living essentials.”'
              : '“Your debt payments are becoming a larger part of your income. Consider reviewing your repayment plan before upcoming due dates.”'}
          </p>
        </div>

        {/* Breakdown of Current Loans */}
        <h4 style={{ fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
          Your Active Loan Accounts
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-subtle)' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)' }}>Home Loan</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Interest Rate: 8.5% | Remaining: ₹2,50,000</span>
            </div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>₹5,200/month</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-subtle)' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)' }}>Personal Loan</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Interest Rate: 12.0% | Remaining: ₹80,000</span>
            </div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>₹2,800/month</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-subtle)' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)' }}>Credit Card Balance</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Interest Rate: 36.0% (High Interest) | Remaining: ₹50,000</span>
            </div>
            <strong style={{ fontSize: '0.95rem', color: '#B45309' }}>₹1,500/month</strong>
          </div>
        </div>

        {/* Stress Simulator */}
        <div style={{ padding: '1.25rem', border: '1px dashed #CBD5E1', borderRadius: '8px', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-navy)' }}>
              Interactive Test: What if your monthly EMI obligations increase?
            </strong>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-blue)' }}>
              +{formatCurrency(extraDebtEMI)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="12000"
            step="1000"
            value={extraDebtEMI}
            onChange={(e) => setExtraDebtEMI(Number(e.target.value))}
            className="stress-slider"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
            <span>No Change (₹9,500)</span>
            <span>+₹6,000</span>
            <span>+₹12,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
