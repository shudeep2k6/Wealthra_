import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';
import { RecommendationCard } from '../components/RecommendationCard';
import { StrategyModal } from '../components/StrategyModal';

export const Interventions = ({ onNavigate }) => {
  const { calculations } = useFinancial();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>{t('interventionsPage.title', 'What You Can Do Today')}</h1>
          <p>
            {t('interventionsPage.subtitle', 'Responsible, prioritized steps to strengthen your household finances before small concerns turn into stress.')}
          </p>
        </div>
        <div className="page-actions">
          <span className="badge badge-positive" style={{ fontSize: '0.85rem' }}>
            {t('interventionsPage.activePaths', '3 Active Action Paths')}
          </span>
        </div>
      </div>

      {/* Philosophy Callout Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <Sparkles size={24} color="#2563EB" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1E40AF' }}>
            {t('interventionsPage.philosophyTitle', 'Action-Oriented Prevention')}
          </strong>
          <span style={{ fontSize: '0.875rem', color: '#1E3A8A' }}>
            {t('interventionsPage.philosophyDesc', 'Prediction without action leaves you vulnerable. Following these three personalized interventions insulates your budget against unforeseen shocks.')}
          </span>
        </div>
      </div>

      {/* Prioritized Recommendation Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        {calculations.interventions.map((item) => (
          <RecommendationCard
            key={item.id}
            priority={item.priority}
            priorityClass={item.priorityClass}
            title={item.title}
            description={item.description}
            actionButton={item.actionButton}
            onActionClick={() => setSelectedPlan(item)}
          />
        ))}
      </div>

      {/* Interactive Guidance Modal */}
      {selectedPlan && (
        <StrategyModal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          title={selectedPlan.title}
          priority={selectedPlan.priority}
          description={selectedPlan.description}
          steps={selectedPlan.steps}
          onApply={() => alert(`Action Plan "${selectedPlan.title}" has been added to your banking routine!`)}
        />
      )}
    </div>
  );
};
