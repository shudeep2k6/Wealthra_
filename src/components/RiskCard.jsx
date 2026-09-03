import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { RiskMeter } from './RiskMeter';

export const RiskCard = ({
  riskScore = 24,
  riskTier = 'LOW RISK',
  riskStatusClass = 'badge-positive',
  description = 'Your current financial position appears stable. However, increasing discretionary spending may reduce your financial safety margin.'
}) => {
  return (
    <div className="card">
      <div className="card-header-flex">
        <div className="card-title-wrap">
          <h3>Crisis Risk Indicator</h3>
          <p>Real-time vulnerability index</p>
        </div>
        <span className={`badge ${riskStatusClass}`}>
          {riskScore <= 30 ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
          {riskTier}
        </span>
      </div>

      <div className="crisis-risk-display">
        <div className="crisis-risk-pct">{riskScore}%</div>
        <div className={`crisis-risk-status-pill ${riskStatusClass}`}>
          {riskTier}
        </div>
        <p className="crisis-risk-desc">{description}</p>
        <RiskMeter riskScore={riskScore} />
      </div>
    </div>
  );
};
