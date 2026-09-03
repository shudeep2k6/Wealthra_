import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const RecommendationCard = ({
  priority = 'HIGH',
  priorityClass = 'badge-danger',
  title,
  description,
  actionButton,
  onActionClick
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '1.4rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ flex: 1, minWidth: '260px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span className={`badge ${priorityClass}`} style={{ fontWeight: 700, letterSpacing: '0.04em' }}>
            {priority} PRIORITY
          </span>
        </div>

        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', fontWeight: 600, marginBottom: '0.35rem' }}>
          {title}
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
          {description}
        </p>
      </div>

      <div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onActionClick}
          style={{ whiteSpace: 'nowrap' }}
        >
          <span>{actionButton}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
