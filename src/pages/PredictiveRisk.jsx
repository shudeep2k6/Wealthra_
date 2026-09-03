import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Clock, CheckCircle2, AlertTriangle, ArrowRight, Info } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';

export const PredictiveRisk = ({ onNavigate }) => {
  const { calculations } = useFinancial();
  const { t, tTier } = useLanguage();

  const chartData = calculations.predictiveTrajectory || [
    { period: t('predictive.current', 'Current'), risk: calculations.distressRiskScore, label: `Current: ${calculations.distressRiskScore}%` },
    { period: t('predictive.threeMonths', '3 Months'), risk: Math.round(calculations.distressRiskScore * 1.1), label: '3-Month' },
    { period: t('predictive.sixMonths', '6 Months'), risk: Math.round(calculations.distressRiskScore * 1.2), label: '6-Month' },
    { period: t('predictive.twelveMonths', '12 Months'), risk: Math.round(calculations.distressRiskScore * 1.35), label: '12-Month' }
  ];

  const getTierInfo = (score) => {
    if (score <= 30) return { label: t('distress.lowRisk', 'Low'), color: '#16A34A', badgeClass: 'badge-positive' };
    if (score <= 50) return { label: t('distress.moderateRisk', 'Moderate'), color: '#2563EB', badgeClass: 'badge-blue' };
    if (score <= 70) return { label: t('distress.highRisk', 'Elevated'), color: '#F59E0B', badgeClass: 'badge-warning' };
    return { label: t('distress.criticalRisk', 'Critical'), color: '#DC2626', badgeClass: 'badge-danger' };
  };

  const cTier = getTierInfo(chartData[0]?.risk ?? 24);
  const m3Tier = getTierInfo(chartData[1]?.risk ?? 28);
  const m6Tier = getTierInfo(chartData[2]?.risk ?? 34);
  const m12Tier = getTierInfo(chartData[3]?.risk ?? 39);

  const getIcon = (iconName, color) => {
    if (iconName === 'TrendingUp') return <TrendingUp size={20} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />;
    if (iconName === 'Clock') return <Clock size={20} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />;
    if (iconName === 'AlertTriangle') return <AlertTriangle size={20} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />;
    return <CheckCircle2 size={20} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />;
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>{t('predictive.title', 'What Could Happen Next?')}</h1>
          <p>
            {t('predictive.subtitle', 'We use your recent financial patterns to estimate potential future financial pressure so you can take easy preventative steps.')}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('interventions')}>
            <span>{t('interventions.title', 'Take Preventative Action')}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Cards Horizon Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{t('predictive.current', 'Current Risk')}</span>
          <strong style={{ fontSize: '2rem', color: cTier.color }}>{chartData[0]?.risk}%</strong>
          <span className={`badge ${cTier.badgeClass}`} style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>
            {cTier.label}
          </span>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{t('predictive.threeMonths', '3-Month Risk')}</span>
          <strong style={{ fontSize: '2rem', color: m3Tier.color }}>{chartData[1]?.risk}%</strong>
          <span className={`badge ${m3Tier.badgeClass}`} style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>
            {m3Tier.label}
          </span>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{t('predictive.sixMonths', '6-Month Risk')}</span>
          <strong style={{ fontSize: '2rem', color: m6Tier.color }}>{chartData[2]?.risk}%</strong>
          <span className={`badge ${m6Tier.badgeClass}`} style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>
            {m6Tier.label}
          </span>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>{t('predictive.twelveMonths', '12-Month Risk')}</span>
          <strong style={{ fontSize: '2rem', color: m12Tier.color }}>{chartData[3]?.risk}%</strong>
          <span className={`badge ${m12Tier.badgeClass}`} style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>
            {m12Tier.label}
          </span>
        </div>
      </div>

      {/* Clean Line Chart Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>
              Projected Risk Trajectory (Next 12 Months)
            </h3>
            <p style={{ fontSize: '0.85rem' }}>
              Shows projected stress percentage if current spending and savings habits continue unchanged.
            </p>
          </div>
          <span className={`badge ${chartData[3]?.risk > chartData[0]?.risk ? 'badge-warning' : 'badge-positive'}`}>
            {chartData[3]?.risk > chartData[0]?.risk ? 'Projected Drift' : 'Stable Outlook'}
          </span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="period" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1220',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem'
                }}
                formatter={(value) => [`${value}% Estimated Risk`, 'Risk Index']}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Why is the risk changing? Section */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>
          Why is the risk changing?
        </h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Primary drivers identified by our predictive machine learning model based on your latest assessment:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {calculations.riskDrivers.map((driver, index) => {
            const isPositive = driver.color === '#16A34A';
            const isDanger = driver.color === '#EF4444';
            const bg = isDanger ? '#FEF2F2' : (isPositive ? '#F0FDF4' : '#FFF7ED');
            const border = isDanger ? '#FECACA' : (isPositive ? '#BBF7D0' : '#FED7AA');
            const textColor = isDanger ? '#991B1B' : (isPositive ? '#166534' : '#9A3412');

            return (
              <div key={index} style={{ padding: '1rem', borderRadius: '8px', border: `1px solid ${border}`, backgroundColor: bg, display: 'flex', gap: '0.75rem' }}>
                {getIcon(driver.icon, driver.color)}
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: textColor, marginBottom: '0.2rem' }}>
                    {isDanger ? 'Critical Factor' : (isPositive ? 'Protective Buffer' : 'Watch Factor')}
                  </strong>
                  <span style={{ fontSize: '0.825rem', color: textColor, lineHeight: 1.4, display: 'block' }}>
                    {driver.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassurance Disclaimer */}
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
          <strong>Proactive prevention:</strong> {calculations.interventions[0]?.title ? `Implementing "${calculations.interventions[0].title}" mitigates projected risk drift and strengthens long-term resilience.` : 'Maintaining your regular savings buffer protects your budget against unexpected financial shocks.'}
        </span>
      </div>
    </div>
  );
};
