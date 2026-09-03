import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { useAccessibility } from '../context/AccessibilityContext';

export const WellnessScore = ({
  score = 74,
  maxScore = 100,
  status = 'STABLE',
  summary = 'Your finances are currently stable, but there are a few areas worth watching.',
  factors = {
    incomeStability: 82,
    savingsSafety: 68,
    debtHealth: 64,
    expenseControl: 76,
    emergencyPreparedness: 71
  }
}) => {
  const { simpleLanguage } = useAccessibility();

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div className="card-header-flex" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>
            {simpleLanguage ? 'How Safe Are Your Finances?' : 'Financial Wellness Score'}
          </h3>
          <p style={{ fontSize: '0.85rem' }}>
            {simpleLanguage
              ? 'An easy-to-understand score that measures your overall money health.'
              : 'Holistic stability index across income, debt, and cash reserves.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="badge badge-positive" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            <ShieldCheck size={14} />
            {status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        {/* Left: Large Accessible Score */}
        <div style={{ textAlign: 'center', padding: '1.25rem', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '3.75rem', fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {score}
          </div>
          <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>/ {maxScore}</span>

          <div style={{ marginTop: '0.75rem' }}>
            <span className="badge badge-positive" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {status}
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginTop: '0.85rem', lineHeight: '1.5' }}>
            “{summary}”
          </p>
        </div>

        {/* Right: Factor Progress Breakdown */}
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            Score Factors Breakdown
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ProgressBar
              label={simpleLanguage ? 'Steady Income Coming In' : 'Income Stability'}
              percentage={factors.incomeStability}
              benchmark="Stable at ₹50,000"
            />
            <ProgressBar
              label={simpleLanguage ? 'Savings Safety Net' : 'Savings Safety'}
              percentage={factors.savingsSafety}
              benchmark="Current: 3.2 months"
            />
            <ProgressBar
              label={simpleLanguage ? 'Debt & Loan Burden' : 'Debt Health'}
              percentage={factors.debtHealth}
              benchmark="Manageable at 19%"
            />
            <ProgressBar
              label={simpleLanguage ? 'Spending Under Control' : 'Expense Control'}
              percentage={factors.expenseControl}
              benchmark="Essentials at 55%"
            />
            <ProgressBar
              label={simpleLanguage ? 'Emergency Readiness' : 'Emergency Preparedness'}
              percentage={factors.emergencyPreparedness}
              benchmark="Buffer: ₹88,000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
