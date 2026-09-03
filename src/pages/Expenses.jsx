import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Wallet, Receipt, PiggyBank, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';

export const Expenses = ({ onNavigate }) => {
  const { calculations, formatCurrency } = useFinancial();
  const { t } = useLanguage();

  const flowData = [
    { name: t('expensesPage.essentialHeading', 'Essential Living Spending'), value: 27500, pct: 55, color: '#2563EB', desc: t('assessment.step2Title', 'Housing, food, utilities, healthcare') },
    { name: t('expensesPage.discretionaryHeading', 'Discretionary Lifestyle Spending'), value: 9500, pct: 19, color: '#F59E0B', desc: t('assessment.discretionaryLabel', 'Shopping, dining, entertainment') },
    { name: t('expensesPage.savingsHeading', 'Protected Savings Reserve'), value: 13000, pct: 26, color: '#16A34A', desc: t('assessment.step3Title', 'Protected liquid cash and debt service') }
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>{t('expensesPage.title', 'Understand Your Monthly Money Flow')}</h1>
          <p>
            {t('expensesPage.subtitle', 'A simple, transparent look at where your money goes each month without confusing accounting terms.')}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigate('assessment')}>
            {t('expensesPage.updateBtn', 'Update Monthly Expenses')}
          </button>
        </div>
      </div>

      {/* 3 Core Numbers Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Wallet size={18} color="#2563EB" />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('expensesPage.monthlyInflows', 'Total Monthly Income')}</span>
          </div>
          <strong style={{ fontSize: '1.75rem', color: 'var(--color-navy)' }}>{formatCurrency(50000)}</strong>
          <small style={{ display: 'block', color: '#16A34A', marginTop: '0.2rem', fontWeight: 600 }}>{t('expensesPage.allInflows', '100% of inflows')}</small>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Receipt size={18} color="#F59E0B" />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('expensesPage.monthlyOutflows', 'Total Monthly Expenses')}</span>
          </div>
          <strong style={{ fontSize: '1.75rem', color: 'var(--color-navy)' }}>{formatCurrency(37000)}</strong>
          <small style={{ display: 'block', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>{t('expensesPage.incomeShare', '{pct}% of income').replace('{pct}', '74')}</small>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16A34A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <PiggyBank size={18} color="#16A34A" />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{t('expensesPage.freeCash', 'Remaining / Free Cash')}</span>
          </div>
          <strong style={{ fontSize: '1.75rem', color: '#16A34A' }}>{formatCurrency(13000)}</strong>
          <small style={{ display: 'block', color: '#16A34A', marginTop: '0.2rem', fontWeight: 600 }}>{t('expensesPage.cashSurplus', 'Monthly cash surplus')}</small>
        </div>
      </div>

      {/* Cash Flow Proportions & Chart */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
          Monthly Spending Distribution
        </h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Comparing your current spending against healthy digital banking benchmarks:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          {/* Donut Chart */}
          <div style={{ width: '100%', height: 240, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={flowData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {flowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${formatCurrency(val)} (${Math.round((val / 50000) * 100)}%)`, name]}
                  contentStyle={{ backgroundColor: '#0B1220', color: '#FFF', borderRadius: '8px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Income</span>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--color-navy)' }}>₹50k</strong>
            </div>
          </div>

          {/* 3 Categories Breakdown Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {flowData.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: item.color }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      {item.name}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {item.desc}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: item.color }}>
                    {item.pct}%
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Recommendation */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#F8FAFC',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)' }}>
            Take Action: Trim Non-Essential Spending
          </strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Reducing discretionary shopping from 19% down to 14% frees up an extra ₹2,500/month for your emergency safety fund.
          </span>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('interventions')}>
          <span>View Spending Strategy</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
