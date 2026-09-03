import React from 'react';

export const RiskMeter = ({ riskScore = 24 }) => {
  // Tiers: Low: 0-30%, Moderate: 31-60%, High: 61-80%, Critical: 81-100%
  const isLow = riskScore <= 30;
  const isModerate = riskScore > 30 && riskScore <= 60;
  const isHigh = riskScore > 60 && riskScore <= 80;
  const isCritical = riskScore > 80;

  return (
    <div className="risk-meter-container">
      <div className="risk-meter-track">
        <div
          className="risk-meter-segment risk-segment-low"
          style={{ opacity: isLow ? 1 : 0.25, transform: isLow ? 'scaleY(1.3)' : 'scaleY(1)' }}
          title="Low Risk: 0-30%"
        />
        <div
          className="risk-meter-segment risk-segment-mod"
          style={{ opacity: isModerate ? 1 : 0.25, transform: isModerate ? 'scaleY(1.3)' : 'scaleY(1)' }}
          title="Moderate Risk: 31-60%"
        />
        <div
          className="risk-meter-segment risk-segment-high"
          style={{ opacity: isHigh ? 1 : 0.25, transform: isHigh ? 'scaleY(1.3)' : 'scaleY(1)' }}
          title="High Risk: 61-80%"
        />
        <div
          className="risk-meter-segment risk-segment-crit"
          style={{ opacity: isCritical ? 1 : 0.25, transform: isCritical ? 'scaleY(1.3)' : 'scaleY(1)' }}
          title="Critical Risk: 81-100%"
        />
      </div>

      <div className="risk-meter-labels">
        <span className={isLow ? 'active' : ''} style={{ color: isLow ? '#16A34A' : undefined }}>
          Low
        </span>
        <span className={isModerate ? 'active' : ''} style={{ color: isModerate ? '#B45309' : undefined }}>
          Moderate
        </span>
        <span className={isHigh ? 'active' : ''} style={{ color: isHigh ? '#C2410C' : undefined }}>
          High
        </span>
        <span className={isCritical ? 'active' : ''} style={{ color: isCritical ? '#DC2626' : undefined }}>
          Critical
        </span>
      </div>
    </div>
  );
};
