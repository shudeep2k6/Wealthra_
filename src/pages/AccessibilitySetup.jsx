import React, { useState } from 'react';
import { Eye, Type, Volume2, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const AccessibilitySetup = ({ onNavigate }) => {
  const {
    textSize,
    setTextSize,
    contrastMode,
    setContrastMode,
    simpleLanguage,
    setSimpleLanguage,
    voiceEnabled,
    setVoiceEnabled
  } = useAccessibility();

  // Local multi-select options state
  const [selectedOptions, setSelectedOptions] = useState({
    largeText: textSize === 'large' || textSize === 'xlarge',
    highContrast: contrastMode === 'high-contrast',
    voiceFriendly: voiceEnabled,
    simpleLanguage: simpleLanguage
  });

  const toggleOption = (key) => {
    setSelectedOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Live apply
      if (key === 'largeText') setTextSize(next[key] ? 'large' : 'normal');
      if (key === 'highContrast') setContrastMode(next[key] ? 'high-contrast' : 'standard');
      if (key === 'voiceFriendly') setVoiceEnabled(next[key]);
      if (key === 'simpleLanguage') setSimpleLanguage(next[key]);
      return next;
    });
  };

  const handleApply = () => {
    onNavigate('dashboard');
  };

  const handleSkip = () => {
    onNavigate('dashboard');
  };

  const options = [
    {
      id: 'largeText',
      title: 'Large Text',
      desc: 'Increase typography size across all cards, charts, and buttons for effortless reading.',
      icon: Type,
      active: selectedOptions.largeText
    },
    {
      id: 'highContrast',
      title: 'High Contrast',
      desc: 'Bold dark backgrounds and crisp high-contrast outlines (meets strict WCAG AAA guidelines).',
      icon: Eye,
      active: selectedOptions.highContrast
    },
    {
      id: 'voiceFriendly',
      title: 'Voice-Friendly Guidance',
      desc: 'Enable spoken explanations and an accessible microphone assistant for voice commands.',
      icon: Volume2,
      active: selectedOptions.voiceFriendly
    },
    {
      id: 'simpleLanguage',
      title: 'Simple Everyday Language',
      desc: 'Replace complex financial jargon with plain everyday explanations.',
      icon: Sparkles,
      active: selectedOptions.simpleLanguage
    }
  ];

  return (
    <div className="auth-page-wrapper">
      <div className="card fade-in" style={{ maxWidth: '640px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--color-blue-subtle)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShieldCheck size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
            Let’s make your banking experience comfortable.
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            How would you like to use the app? You can select any combination that suits your vision, hearing, or reading preference.
          </p>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                onClick={() => toggleOption(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.15rem 1.25rem',
                  borderRadius: '12px',
                  border: opt.active ? '2px solid var(--color-blue)' : '1px solid var(--color-border)',
                  backgroundColor: opt.active ? 'var(--color-blue-subtle)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: opt.active ? 'var(--color-blue)' : 'var(--color-surface-subtle)', color: opt.active ? 'white' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--color-navy)' }}>
                      {opt.title}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {opt.desc}
                    </span>
                  </div>
                </div>

                <div style={{ width: 26, height: 26, borderRadius: '50%', border: opt.active ? '2px solid var(--color-blue)' : '2px solid var(--color-border)', backgroundColor: opt.active ? 'var(--color-blue)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  {opt.active && <Check size={16} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSkip}
            style={{ fontSize: '0.95rem' }}
          >
            Skip for now
          </button>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleApply}
            style={{ fontSize: '1rem' }}
          >
            <span>Save Preferences &amp; Open Banking</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1.25rem' }}>
          You can change these anytime by clicking the <strong>Accessibility</strong> button in the top navigation bar.
        </p>
      </div>
    </div>
  );
};
