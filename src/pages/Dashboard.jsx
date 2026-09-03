import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Wallet,
  Receipt,
  PiggyBank,
  CreditCard,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { WellnessScore } from '../components/WellnessScore';
import { MetricCard } from '../components/MetricCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { StrategyModal } from '../components/StrategyModal';

export const Dashboard = ({ onNavigate }) => {
  const { currentUser, calculations, formatCurrency } = useFinancial();
  const { simpleLanguage } = useAccessibility();
  const [activeModal, setActiveModal] = useState(null);

  const topIntervention = calculations.interventions[0];

  return (
    <div className="page-container fade-in">
      {/* 3 Core Questions Top Answer Banner */}
      <div
        className="card"
        style={{
          padding: '1.5rem 1.75rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '5px solid #2563EB',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Daily Financial Wellness Snapshot
            </span>
            <h1 style={{ fontSize: '1.65rem', color: 'var(--color-navy)', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
              Good Morning, {currentUser.name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
              Answering your three most important questions immediately:
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigate('assessment')}>
              Update My Information
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('warnings')}>
              View Early Warnings (4)
            </button>
          </div>
        </div>

        {/* 3 Answers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          {/* Answer 1 */}
          <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              1. How am I doing?
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>74 / 100</strong>
              <span className="badge badge-positive">STABLE</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
              Your finances are balanced, though savings could provide deeper protection.
            </p>
          </div>

          {/* Answer 2 */}
          <div style={{ backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
              2. Is anything concerning?
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.05rem', color: '#B45309' }}>Rising Living Costs</strong>
              <span className="badge badge-warning">Worth Watching</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#92400E', marginTop: '0.35rem' }}>
              Essential expenses rose 12% over 3 months. Emergency savings stand at 3.2 months.
            </p>
          </div>

          {/* Answer 3 */}
          <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              3. What should I do?
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.05rem', color: '#166534' }}>Add ₹3,000/mo to Savings</strong>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#15803D', marginTop: '0.35rem' }}>
              A small automated monthly transfer strengthens your runway toward 6 months.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Key Financial Cards */}
      <div className="metrics-grid">
        <MetricCard
          label={simpleLanguage ? 'Money Coming In' : 'Monthly Income'}
          value={formatCurrency(calculations.totalIncome)}
          statusText="Stable"
          statusType="positive"
          icon={Wallet}
          subtitle="Salary &amp; routine inflows"
        />

        <MetricCard
          label={simpleLanguage ? 'Essential Needs' : 'Essential Expenses'}
          value={formatCurrency(calculations.essentialExpenses)}
          statusText="55% of income"
          statusType="warning"
          icon={Receipt}
          subtitle="Housing, food, utilities"
        />

        <MetricCard
          label={simpleLanguage ? 'Money in Savings' : 'Total Savings'}
          value={formatCurrency(calculations.totalSavings)}
          statusText="Growing"
          statusType="positive"
          icon={PiggyBank}
          subtitle="3.2 months emergency cover"
        />

        <MetricCard
          label={simpleLanguage ? 'Loan & Debt Payments' : 'Debt Payments'}
          value={`${formatCurrency(calculations.monthlyDebtPayments)}/mo`}
          statusText="Moderate"
          statusType="blue"
          icon={CreditCard}
          subtitle="19% Debt-to-Income (Manageable)"
        />
      </div>

      {/* Financial Wellness Score Breakdown Card */}
      <div style={{ marginBottom: '1.5rem' }}>
        <WellnessScore
          score={calculations.wellnessScore}
          maxScore={100}
          status={calculations.wellnessStatus}
          summary={calculations.wellnessSummary}
          factors={calculations.factorScores}
        />
      </div>

      {/* Recommended Action Priority Card (Top Priority Action) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>
            Recommended Action For You
          </h3>
          <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigate('interventions')}>
            View All Actions (3)
          </button>
        </div>

        <RecommendationCard
          priority={topIntervention.priority}
          priorityClass={topIntervention.priorityClass}
          title={topIntervention.title}
          description={topIntervention.description}
          actionButton={topIntervention.actionButton}
          onActionClick={() => setActiveModal(topIntervention)}
        />
      </div>

      {/* Early Warning Alert Highlight Banner */}
      <div
        className="card"
        style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem', color: '#92400E' }}>
              Early Warning Center: 4 Observations Detected
            </strong>
            <span style={{ fontSize: '0.825rem', color: '#B45309' }}>
              We spotted small changes in savings runway and essential expenses before they cause stress.
            </span>
          </div>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('warnings')}>
          <span>Explore Early Warnings</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Action Plan Modal */}
      {activeModal && (
        <StrategyModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={activeModal.title}
          priority={activeModal.priority}
          description={activeModal.description}
          steps={activeModal.steps}
          onApply={() => alert('Action plan initiated for your account. An automated reminder has been scheduled.')}
        />
      )}
    </div>
  );
};
