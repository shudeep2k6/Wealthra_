import React from 'react';
import { Cpu, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export const AiReportCard = ({
  riskScore = 24,
  confidence = 87,
  summaryText = 'Based on your current income, expenses, savings, and debt patterns, your financial crisis risk is currently LOW.',
  primaryRisk = 'High discretionary spending',
  protectiveFactor = 'Stable monthly income',
  recommendedAction = 'Increase emergency savings.',
  onActionClick
}) => {
  return (
    <div className="ai-report-card">
      <div className="ai-report-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="brand-icon-box" style={{ width: 28, height: 28 }}>
            <Cpu size={15} />
          </div>
          <h4 style={{ fontSize: '1rem', color: '#0B1220' }}>AI Financial Assessment</h4>
        </div>
        <span className="ai-badge">AUDIT COMPLETE</span>
      </div>

      <p className="ai-report-summary">{summaryText}</p>

      <div className="ai-meta-grid">
        <div className="ai-meta-item">
          <span className="ai-meta-label">Crisis Risk Score</span>
          <span className="ai-meta-val" style={{ color: riskScore <= 30 ? '#16A34A' : '#DC2626' }}>
            {riskScore}%
          </span>
        </div>

        <div className="ai-meta-item">
          <span className="ai-meta-label">Model Confidence</span>
          <span className="ai-meta-val">{confidence}%</span>
        </div>

        <div className="ai-meta-item">
          <span className="ai-meta-label">Primary Risk</span>
          <span className="ai-meta-val" style={{ color: '#B45309', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertCircle size={13} />
            {primaryRisk}
          </span>
        </div>

        <div className="ai-meta-item">
          <span className="ai-meta-label">Protective Factor</span>
          <span className="ai-meta-val" style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle size={13} />
            {protectiveFactor}
          </span>
        </div>

        <div className="ai-meta-item" style={{ gridColumn: '1 / -1' }}>
          <span className="ai-meta-label">Recommended Immediate Action</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span className="ai-meta-val" style={{ color: '#2563EB' }}>{recommendedAction}</span>
            {onActionClick && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={onActionClick}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                <span>Take Action</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
