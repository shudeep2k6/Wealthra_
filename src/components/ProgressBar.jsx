import React from 'react';

export const ProgressBar = ({ label, percentage = 0, benchmark = 'Target: >70%' }) => {
  const pct = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  let fillClass = 'fill-positive';
  if (pct < 50) {
    fillClass = 'fill-danger';
  } else if (pct < 70) {
    fillClass = 'fill-warning';
  }

  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-label-row">
        <span className="progress-bar-title">{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {benchmark && <small style={{ fontSize: '0.725rem', color: '#94A3B8' }}>{benchmark}</small>}
          <span className="progress-bar-pct">{pct}%</span>
        </div>
      </div>
      <div className="progress-bar-track">
        <div className={`progress-bar-fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
