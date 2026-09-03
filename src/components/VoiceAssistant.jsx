import React, { useState } from 'react';
import { Mic, X, Volume2, Sparkles, ArrowRight, MessageSquare } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const VoiceAssistant = ({ onNavigate }) => {
  const { voiceEnabled, setVoiceEnabled } = useAccessibility();
  const [responseMessage, setResponseMessage] = useState(
    'Hello! I can guide you through your banking health. Click any spoken question below or select a topic.'
  );
  const [isListening, setIsListening] = useState(false);

  if (!voiceEnabled) return null;

  const commands = [
    {
      query: 'Show my financial health',
      action: () => {
        onNavigate('dashboard');
        setResponseMessage('Navigating to your Financial Wellness Dashboard. Your score is 74/100 and currently stable.');
      }
    },
    {
      query: 'Why is my risk increasing?',
      action: () => {
        onNavigate('predictive');
        setResponseMessage('Opening Predictive Risk analysis. Your 12-month trajectory reflects rising essential expenses and slower savings accumulation.');
      }
    },
    {
      query: 'Show my expenses',
      action: () => {
        onNavigate('expenses');
        setResponseMessage('Here is your monthly money flow. You spend 55% on essentials, 19% on discretionary, and retain 26% in savings.');
      }
    },
    {
      query: 'How much should I save?',
      action: () => {
        onNavigate('guidance');
        setResponseMessage('Opening your Financial Guide. Recommended guideline is building 6 months of essential living expenses (around ₹1,65,000).');
      }
    },
    {
      query: 'Explain my debt',
      action: () => {
        onNavigate('debt');
        setResponseMessage('Navigating to Debt & Loan Health. Your total debt is ₹3,80,000 with ₹9,500 monthly EMI, which is a manageable 19% of your income.');
      }
    }
  ];

  const handleCommandClick = (cmd) => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      cmd.action();
    }, 400);
  };

  return (
    <div className="voice-assistant-modal fade-in">
      {/* Header */}
      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Volume2 size={18} color="#60A5FA" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Banking Voice Guidance</span>
        </div>
        <button
          onClick={() => setVoiceEnabled(false)}
          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          aria-label="Close voice guidance"
        >
          <X size={18} />
        </button>
      </div>

      {/* Center Mic Graphic */}
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <div className="voice-mic-wave" style={{ borderColor: isListening ? '#16A34A' : '#2563EB' }}>
          <Mic size={26} color={isListening ? '#16A34A' : '#2563EB'} />
        </div>
        <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
          {isListening ? 'Processing speech...' : '“How can I help you today?”'}
        </strong>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', padding: '0 0.5rem', marginBottom: '0.75rem' }}>
          {responseMessage}
        </p>

        {/* Command Quick Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Try Saying Or Clicking:
          </span>
          {commands.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleCommandClick(c)}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            >
              <span>🎙 “{c.query}”</span>
              <ArrowRight size={13} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
