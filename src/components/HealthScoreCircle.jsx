import React from 'react';

export const HealthScoreCircle = ({ score = 78, maxScore = 100, status = 'Healthy' }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), maxScore);
  const strokeDashoffset = circumference - (progress / maxScore) * circumference;

  // Determine color based on score
  let strokeColor = '#16A34A'; // Healthy green
  let statusBadgeClass = 'badge-positive';

  if (score < 50) {
    strokeColor = '#DC2626'; // Red
    statusBadgeClass = 'badge-danger';
  } else if (score < 70) {
    strokeColor = '#F59E0B'; // Amber
    statusBadgeClass = 'badge-warning';
  }

  return (
    <div className="health-score-widget">
      <div className="circle-svg-wrap">
        <svg className="circle-svg" viewBox="0 0 120 120">
          <circle
            className="circle-bg"
            cx="60"
            cy="60"
            r={radius}
          />
          <circle
            className="circle-progress"
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="circle-center-text">
          <span className="circle-value">{score}</span>
          <span className="circle-total">/ {maxScore}</span>
        </div>
      </div>

      <div style={{ marginTop: '0.65rem' }}>
        <span className={`badge ${statusBadgeClass}`}>{status}</span>
      </div>
    </div>
  );
};
