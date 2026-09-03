import React from 'react';
import { ShieldCheck, Info, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';
import { RiskIndicator } from '../components/RiskIndicator';

export const DistressDetection = ({ onNavigate }) => {
  const { calculations } = useFinancial();
  const { t, tTier } = useLanguage();

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>{t('distress.title', 'Financial Distress Detection')}</h1>
          <p>{t('distress.subtitle', 'We look for changes that may indicate financial stress — so you can act early.')}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('predictive')}>
            <span>{t('predictive.futureOutlook', 'View 12-Month Outlook')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Large Current Status Card */}
      {(() => {
        const isLow = calculations.distressRiskTier === 'LOW';
        const isMod = calculations.distressRiskTier === 'MODERATE';
        const isHigh = calculations.distressRiskTier === 'HIGH';
        const borderColor = isLow ? '#16A34A' : (isMod ? '#2563EB' : (isHigh ? '#F59E0B' : '#DC2626'));
        const badgeClass = isLow ? 'badge-positive' : (isMod ? 'badge-blue' : (isHigh ? 'badge-warning' : 'badge-danger'));

        return (
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', borderLeft: `5px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('distress.riskIndex', 'Current Distress Risk Assessment')}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1 }}>
                    {calculations.distressRiskScore}%
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className={`badge ${badgeClass}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
                      {isLow || isMod ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                      {tTier(calculations.distressRiskTier)}
                    </span>
                    <small style={{ marginTop: '0.2rem', color: borderColor, fontWeight: 600 }}>
                      {calculations.distressStatus}
                    </small>
                  </div>
                </div>
              </div>

              <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigate('interventions')}>
                {t('interventions.title', 'View Recommended Actions')}
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--color-border)', marginBottom: '1.75rem' }}>
              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
                Summary Explanation:
              </strong>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                “{calculations.distressExplanation}”
              </p>
            </div>

            {/* Supportive Risk Scale */}
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
              Distress Severity Spectrum
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              A calm, non-judgmental meter showing where your current patterns place your household buffer.
            </p>
            <RiskIndicator currentRiskTier={calculations.distressRiskTier} score={calculations.distressRiskScore} />
          </div>
        );
      })()}

      {/* Early Signs Monitored Section */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
          {t('distress.monitoredPillars', 'Key Factors Continually Monitored')}
        </h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {t('distress.subtitle', 'Our early warning system scans four critical pillars to protect against surprise shortages:')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
              1. {t('distress.cashRunway', 'Cash Runway Depth')}
            </strong>
            <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
              Current {calculations.emergencyRunwayMonths} months buffer. {calculations.emergencyRunwayMonths < 3 ? 'Reserves are below 3 months of basic living needs.' : 'Maintains solid emergency reserve.'}
            </span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
              2. {t('distress.dtiRatio', 'Debt-to-Income Proportion')}
            </strong>
            <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
              Currently {calculations.debtToIncomeRatio}%. Safe corridor is below 35%. {calculations.debtToIncomeRatio > 35 ? 'Elevated debt obligations require monitoring.' : 'Debt is in a safe, manageable corridor.'}
            </span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
              3. {t('distress.costDrift', 'Monthly Cost Drift')}
            </strong>
            <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
              {calculations.essentialPct}% of income allocated to essential needs ({calculations.essentialPct > 65 ? 'elevated cost burden' : 'well balanced'}).
            </span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
              4. {t('distress.cashFlow', 'Cash Flow Margin')}
            </strong>
            <span style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
              {calculations.remainingCashFlow >= 0 ? `Net surplus of ₹${calculations.remainingCashFlow.toLocaleString('en-IN')}/month supports stability.` : `Net monthly deficit of ₹${Math.abs(calculations.remainingCashFlow).toLocaleString('en-IN')} needs attention.`}
            </span>
          </div>
        </div>
      </div>

      {/* Responsible AI Disclaimer Banner */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          backgroundColor: '#F1F5F9',
          border: '1px solid #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: '#475569'
        }}
      >
        <Info size={20} color="#2563EB" style={{ flexShrink: 0 }} />
        <span>
          <strong>Responsible AI Transparency:</strong> These insights are estimates based on your financial patterns and are not guarantees about your future financial situation. They are designed to help you prepare calmly and avoid distress.
        </span>
      </div>
    </div>
  );
};
