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

export const PredictiveRisk = ({ onNavigate }) => {
  const { calculations } = useFinancial();

  const chartData = [
    { period: 'Current', risk: 24, label: 'Current: 24%' },
    { period: '3 Months', risk: 28, label: '3-Month: 28%' },
    { period: '6 Months', risk: 34, label: '6-Month: 34%' },
    { period: '12 Months', risk: 39, label: '12-Month: 39%' }
  ];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>What Could Happen Next?</h1>
          <p>
            We use your recent financial patterns to estimate potential future financial pressure so you can take easy preventative steps.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('interventions')}>
            <span>Take Preventative Action</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 4 Cards Horizon Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Current Risk</span>
          <strong style={{ fontSize: '2rem', color: '#16A34A' }}>24%</strong>
          <span className="badge badge-positive" style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>Low</span>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>3-Month Risk</span>
          <strong style={{ fontSize: '2rem', color: '#2563EB' }}>28%</strong>
          <span className="badge badge-blue" style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>Low-Moderate</span>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>6-Month Risk</span>
          <strong style={{ fontSize: '2rem', color: '#F59E0B' }}>34%</strong>
          <span className="badge badge-warning" style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>Moderate</span>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>12-Month Risk</span>
          <strong style={{ fontSize: '2rem', color: '#B45309' }}>39%</strong>
          <span className="badge badge-warning" style={{ display: 'block', margin: '0.35rem auto 0', width: 'fit-content' }}>Moderate</span>
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
          <span className="badge badge-warning">Rising Slightly</span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="period" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 60]} stroke="#64748B" fontSize={12} tickLine={false} unit="%" />
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
          Here are the primary drivers identified by our predictive model:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #FED7AA', backgroundColor: '#FFF7ED', display: 'flex', gap: '0.75rem' }}>
            <TrendingUp size={20} color="#C2410C" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#9A3412' }}>
                Expenses are increasing
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#7C2D12' }}>
                Essential living costs climbed 12% over 3 months, absorbing more of your free cash flow.
              </span>
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #FED7AA', backgroundColor: '#FFF7ED', display: 'flex', gap: '0.75rem' }}>
            <Clock size={20} color="#C2410C" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#9A3412' }}>
                Savings growth is slowing
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#7C2D12' }}>
                At ₹3,500/month, emergency buffer accumulation has slowed relative to rising utility costs.
              </span>
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4', display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#166534' }}>
                Debt payments remain stable
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#15803D' }}>
                Monthly EMI obligation is steady at ₹9,500 with zero missed payments.
              </span>
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4', display: 'flex', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#166534' }}>
                Income remains stable
              </strong>
              <span style={{ fontSize: '0.8rem', color: '#15803D' }}>
                Steady monthly inflow of ₹50,000 provides a reliable baseline foundation.
              </span>
            </div>
          </div>
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
          <strong>Good news:</strong> Implementing the recommended action today (saving ₹3,000/month) pushes your 12-month projected risk back down to 18% (Low Risk).
        </span>
      </div>
    </div>
  );
};
