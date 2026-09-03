import React from 'react';
import { X, Eye, Type, Volume2, Sparkles, Check, RefreshCw } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const AccessibilityPanel = () => {
  const {
    textSize,
    setTextSize,
    contrastMode,
    setContrastMode,
    reduceMotion,
    setReduceMotion,
    simpleLanguage,
    setSimpleLanguage,
    voiceEnabled,
    setVoiceEnabled,
    isPanelOpen,
    setIsPanelOpen
  } = useAccessibility();

  if (!isPanelOpen) return null;

  const resetDefaults = () => {
    setTextSize('normal');
    setContrastMode('standard');
    setReduceMotion(false);
    setSimpleLanguage(false);
    setVoiceEnabled(false);
  };

  return (
    <div className="accessibility-panel-overlay" onClick={() => setIsPanelOpen(false)}>
      <div className="accessibility-panel-dialog fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Eye size={20} color="#2563EB" />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)' }}>Accessibility &amp; Comfort Mode</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setIsPanelOpen(false)}
            aria-label="Close accessibility panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Text Size */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="panel-section-title">
              <Type size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Text Size
            </div>
            <div className="toggle-group-row">
              <button
                type="button"
                className={`toggle-pill ${textSize === 'normal' ? 'active' : ''}`}
                onClick={() => setTextSize('normal')}
              >
                <span>A</span> Standard (16px)
              </button>
              <button
                type="button"
                className={`toggle-pill ${textSize === 'large' ? 'active' : ''}`}
                onClick={() => setTextSize('large')}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>A+</span> Large (19px)
              </button>
              <button
                type="button"
                className={`toggle-pill ${textSize === 'xlarge' ? 'active' : ''}`}
                onClick={() => setTextSize('xlarge')}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>A++</span> Extra Large (22px)
              </button>
            </div>
          </div>

          {/* High Contrast */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="panel-section-title">Contrast Mode (WCAG AAA)</div>
            <div className="toggle-group-row">
              <button
                type="button"
                className={`toggle-pill ${contrastMode === 'standard' ? 'active' : ''}`}
                onClick={() => setContrastMode('standard')}
              >
                Standard Banking
              </button>
              <button
                type="button"
                className={`toggle-pill ${contrastMode === 'high-contrast' ? 'active' : ''}`}
                onClick={() => setContrastMode('high-contrast')}
              >
                High Contrast (Dark &amp; Sharp)
              </button>
            </div>
          </div>

          {/* Reading Assistance: Simple Language */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="panel-section-title">Reading Assistance</div>
            <div className="toggle-group-row">
              <button
                type="button"
                className={`toggle-pill ${!simpleLanguage ? 'active' : ''}`}
                onClick={() => setSimpleLanguage(false)}
              >
                Standard Terminology
              </button>
              <button
                type="button"
                className={`toggle-pill ${simpleLanguage ? 'active' : ''}`}
                onClick={() => setSimpleLanguage(true)}
              >
                <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Simple Everyday Language
              </button>
            </div>
            <small style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: '-0.5rem' }}>
              Translates banking terms (DTI, Runway, EMI) into plain-English conversational explanations.
            </small>
          </div>

          {/* Motion & Voice */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.85rem' }}>
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', color: 'var(--color-navy)' }}>
                Screen Motion
              </strong>
              <button
                type="button"
                className={`btn btn-sm ${reduceMotion ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setReduceMotion(!reduceMotion)}
                style={{ width: '100%' }}
              >
                {reduceMotion ? 'Reduced Motion: ON' : 'Normal Motion'}
              </button>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.85rem' }}>
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem', color: 'var(--color-navy)' }}>
                Voice Assistance
              </strong>
              <button
                type="button"
                className={`btn btn-sm ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                style={{ width: '100%' }}
              >
                <Volume2 size={14} />
                <span>{voiceEnabled ? 'Voice Bar: ON' : 'Enable Voice'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={resetDefaults} type="button">
            <RefreshCw size={14} />
            <span>Reset to Defaults</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsPanelOpen(false)} type="button">
            <Check size={14} />
            <span>Done &amp; Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
