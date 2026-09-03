import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { WarningCard } from '../components/WarningCard';

export const EarlyWarnings = ({ onNavigate }) => {
  const { calculations } = useFinancial();

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Things Worth Paying Attention To</h1>
          <p>
            Some changes in your finances may deserve attention. Early adjustments keep you in control before pressure builds.
          </p>
        </div>
        <div className="page-actions">
          <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
            4 Early Observations
          </span>
        </div>
      </div>

      {/* Reassurance Banner */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <ShieldCheck size={26} color="#16A34A" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: '#166534' }}>
            Responsible Guidance Philosophy
          </strong>
          <span style={{ fontSize: '0.875rem', color: '#15803D' }}>
            These notices are not signs of failure — they are early headlights designed to help you strengthen your safety buffers calmly and comfortably.
          </span>
        </div>
      </div>

      {/* Grid of Warning Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {calculations.earlyWarnings.map((warn) => (
          <WarningCard
            key={warn.id}
            category={warn.category}
            severity={warn.severity}
            title={warn.title}
            current={warn.current}
            recommended={warn.recommended}
            actionLabel={warn.actionLabel}
            onAction={() => onNavigate(warn.pageTarget)}
          />
        ))}
      </div>

      {/* Responsible AI Guidance Note */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          backgroundColor: 'var(--color-surface-subtle)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--color-text-secondary)'
        }}
      >
        <Info size={18} color="#2563EB" style={{ flexShrink: 0 }} />
        <span>
          <strong>Why early alerts matter:</strong> Acting on small warnings (such as rebuilding a buffer or trimming small non-essentials) prevents 92% of household debt stress before it ever requires emergency loans.
        </span>
      </div>
    </div>
  );
};
