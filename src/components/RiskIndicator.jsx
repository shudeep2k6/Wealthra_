import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const RiskIndicator = ({ currentRiskTier = 'LOW', score = 24 }) => {
  const tiers = [
    { id: 'LOW', label: 'LOW', range: '0–30%', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
    { id: 'MODERATE', label: 'MODERATE', range: '31–60%', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
    { id: 'HIGH', label: 'HIGH', range: '61–80%', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
    { id: 'CRITICAL', label: 'CRITICAL', range: '81–100%', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }
  ];

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
        {tiers.map((t) => {
          const isCurrent = t.id === currentRiskTier;
          return (
            <div
              key={t.id}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: isCurrent ? `2px solid ${t.color}` : '1px solid var(--color-border)',
                backgroundColor: isCurrent ? t.bg : 'var(--color-surface-subtle)',
                color: isCurrent ? t.color : 'var(--color-text-secondary)',
                position: 'relative',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              {isCurrent && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: t.color,
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '99px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  YOU ARE HERE ({score}%)
                </span>
              )}
              <strong style={{ display: 'block', fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                {t.label}
              </strong>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{t.range}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
        <Info size={15} color="#2563EB" />
        <span>A supportive guide designed to detect stress factors before they affect your financial peace of mind.</span>
      </div>
    </div>
  );
};
