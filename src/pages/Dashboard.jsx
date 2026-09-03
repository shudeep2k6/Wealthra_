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
import { useLanguage } from '../context/LanguageContext';
import { WellnessScore } from '../components/WellnessScore';
import { MetricCard } from '../components/MetricCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { StrategyModal } from '../components/StrategyModal';

export const Dashboard = ({ onNavigate }) => {
  const { currentUser, calculations, formatCurrency } = useFinancial();
  const { simpleLanguage } = useAccessibility();
  const { t, tTier } = useLanguage();
  const [activeModal, setActiveModal] = useState(null);

  const topIntervention = calculations.interventions[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('topbar.goodMorning', 'Good Morning');
    if (hour < 17) return t('topbar.goodAfternoon', 'Good Afternoon');
    return t('topbar.goodEvening', 'Good Evening');
  };

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
              {t('dashboard.threeAnswersTitle', 'Your Daily Financial Wellness Snapshot')}
            </span>
            <h1 style={{ fontSize: '1.65rem', color: 'var(--color-navy)', marginTop: '0.2rem', marginBottom: '0.25rem' }}>
              {getGreeting()}, {currentUser.name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
              {t('dashboard.subtitle', 'Answering your three most important questions immediately:')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigate('assessment')}>
              {t('dashboard.updateInfo', 'Update My Information')}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('warnings')}>
              {t('warnings.title', 'View Early Warnings')} (4)
            </button>
          </div>
        </div>

        {/* 3 Answers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          {/* Answer 1 */}
          <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              1. {t('dashboard.howAmIDoing', 'How am I doing?')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-navy)' }}>{calculations.wellnessScore} / 100</strong>
              <span className={`badge ${calculations.wellnessScore >= 65 ? 'badge-positive' : (calculations.wellnessScore >= 50 ? 'badge-warning' : 'badge-danger')}`}>
                {calculations.wellnessStatus}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
              {calculations.wellnessSummary}
            </p>
          </div>

          {/* Answer 2 */}
          <div style={{ backgroundColor: '#FFFBEB', padding: '1rem', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
              2. {t('dashboard.anythingConcerning', 'Is anything concerning?')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.05rem', color: '#B45309' }}>
                {calculations.earlyWarnings[0]?.category || 'Buffer Monitoring'}
              </strong>
              <span className={`badge ${calculations.earlyWarnings[0]?.severity === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                {calculations.earlyWarnings[0]?.severity === 'high' ? 'High Risk' : 'Worth Watching'}
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#92400E', marginTop: '0.35rem' }}>
              {calculations.earlyWarnings[0]?.title || `Emergency buffer is at ${calculations.emergencyRunwayMonths} months.`}
            </p>
          </div>

          {/* Answer 3 */}
          <div style={{ backgroundColor: '#F0FDF4', padding: '1rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              3. {t('dashboard.whatShouldIDo', 'What should I do?')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <strong style={{ fontSize: '1.05rem', color: '#166534' }}>
                {topIntervention?.title || 'Maintain Regular Savings'}
              </strong>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#15803D', marginTop: '0.35rem' }}>
              {topIntervention?.steps?.[0]?.title || topIntervention?.description || 'Automate small monthly contributions to stay financially resilient.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Key Financial Cards */}
      <div className="metrics-grid">
        <MetricCard
          label={t('dashboard.monthlyIncome', 'Monthly Income')}
          value={formatCurrency(calculations.totalIncome)}
          statusText="Stable"
          statusType="positive"
          icon={Wallet}
          subtitle="Salary &amp; routine inflows"
        />

        <MetricCard
          label={t('dashboard.totalExpenses', 'Essential Expenses')}
          value={formatCurrency(calculations.essentialExpenses)}
          statusText={`${calculations.essentialPct}% of income`}
          statusType={calculations.essentialPct > 65 ? 'warning' : 'positive'}
          icon={Receipt}
          subtitle="Housing, food, utilities"
        />

        <MetricCard
          label={t('dashboard.emergencyBuffer', 'Total Savings')}
          value={formatCurrency(calculations.totalSavings)}
          statusText={`${calculations.emergencyRunwayMonths} mo runway`}
          statusType={calculations.emergencyRunwayMonths < 3 ? 'warning' : 'positive'}
          icon={PiggyBank}
          subtitle={`${calculations.emergencyRunwayMonths} months emergency cover`}
        />

        <MetricCard
          label={t('debt.monthlyEMI', 'Debt Payments')}
          value={`${formatCurrency(calculations.monthlyDebtPayments)}/mo`}
          statusText={calculations.debtToIncomeRatio > 35 ? 'Elevated' : 'Moderate'}
          statusType={calculations.debtToIncomeRatio > 35 ? 'warning' : 'blue'}
          icon={CreditCard}
          subtitle={`${calculations.debtToIncomeRatio}% Debt-to-Income (${calculations.debtToIncomeRatio > 35 ? 'Watch closely' : 'Manageable'})`}
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
