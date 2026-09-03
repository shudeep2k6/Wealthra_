import React from 'react';

export const MetricCard = ({
  label,
  value,
  unit,
  statusText,
  statusType = 'positive', // 'positive', 'warning', 'danger', 'blue'
  icon: Icon,
  subtitle
}) => {
  const getBadgeClass = () => {
    switch (statusType) {
      case 'positive': return 'badge-positive';
      case 'warning': return 'badge-warning';
      case 'danger': return 'badge-danger';
      case 'blue': return 'badge-blue';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <span className="metric-label">{label}</span>
        {Icon && (
          <div className="metric-icon-box">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="metric-value-row">
        <span className="metric-value">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>

      <div className="metric-footer">
        {statusText && <span className={`badge ${getBadgeClass()}`}>{statusText}</span>}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </div>
  );
};
