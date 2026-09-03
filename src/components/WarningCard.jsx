import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';

export const WarningCard = ({
  category = 'Savings Warning',
  severity = 'medium',
  title,
  current,
  recommended,
  actionLabel = 'Review Action',
  onAction
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'Savings Warning': return Clock;
      case 'Spending Warning': return TrendingUp;
      case 'Debt Warning': return AlertTriangle;
      default: return AlertCircle;
    }
  };

  const Icon = getCategoryIcon();

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.85rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              backgroundColor: severity === 'high' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
              color: severity === 'high' ? 'var(--color-danger)' : 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${severity === 'high' ? 'var(--color-danger-border)' : 'var(--color-warning-border)'}`
            }}
          >
            <Icon size={16} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {category}
          </span>
        </div>

        <span className={severity === 'high' ? 'badge badge-danger' : 'badge badge-warning'}>
          Needs Attention
        </span>
      </div>

      <div>
        <h4 style={{ fontSize: '1rem', color: 'var(--color-navy)', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.45rem' }}>
          {title}
        </h4>

        {(current || recommended) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', backgroundColor: 'var(--color-surface-subtle)', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
            {current && (
              <span>Current: <strong style={{ color: 'var(--color-text-primary)' }}>{current}</strong></span>
            )}
            {recommended && (
              <span>Recommended: <strong style={{ color: '#16A34A' }}>{recommended}</strong></span>
            )}
          </div>
        )}
      </div>

      <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onAction}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <span>{actionLabel}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
