import React, { useState } from 'react';
import { BookOpen, HelpCircle, ShieldCheck, HeartHandshake, PhoneCall, Volume2 } from 'lucide-react';
import { HelpButton } from '../components/HelpButton';

export const FinancialGuide = ({ onNavigate }) => {
  const [readingAloud, setReadingAloud] = useState(null);

  const guides = [
    {
      id: 'emergency-fund',
      question: 'What is an Emergency Fund?',
      answer:
        'Money kept aside specifically for unexpected expenses such as medical emergencies, house repairs, or temporary loss of income. It should not be used for daily shopping or vacations.',
      tip: 'Keep this money in a separate, easily accessible savings account.'
    },
    {
      id: 'how-much-save',
      question: 'How much should I save?',
      answer:
        'A common and reassuring goal is to gradually build enough savings to cover several months of essential living expenses. For most households, 3 to 6 months provides solid peace of mind.',
      tip: 'Start small. Even setting aside ₹500 or ₹1,000 every month adds up over time.'
    },
    {
      id: 'loan-repayment-trouble',
      question: 'What should I do if I cannot repay a loan?',
      answer:
        'Contact your bank or lender early to discuss available support options rather than waiting until payments are missed. Banks often have hardship programs, EMI restructuring, or tenure extensions designed to help you through rough patches.',
      tip: 'Never borrow from unregulated, predatory apps to pay off an existing bank loan.'
    },
    {
      id: 'understanding-dti',
      question: 'What does "Debt-to-Income" mean?',
      answer:
        'Debt-to-Income (DTI) simply measures how much of your monthly income goes toward paying back loans. If your income is ₹50,000 and your loan EMI is ₹9,500, your ratio is 19% — which is very safe and manageable.',
      tip: 'Keeping debt repayments under 35% of your income leaves plenty of buffer for food and health.'
    },
    {
      id: 'scam-protection',
      question: 'How do I protect my digital banking from scams?',
      answer:
        'Never share your bank OTP, PIN, or passwords with anyone over the phone — even if they claim to be calling from your bank branch. Wealthra or your bank will never ask for your secret password.',
      tip: 'When in doubt, hang up and call the official bank toll-free number.'
    }
  ];

  const handleReadAloud = (guideId, text) => {
    setReadingAloud(guideId);
    setTimeout(() => {
      setReadingAloud(null);
    }, 2500);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Your Financial Guide</h1>
          <p>
            Simple, calming explanations of key banking concepts designed for beginners, elderly users, and anyone wanting clarity.
          </p>
        </div>
        <div className="page-actions">
          <HelpButton />
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {guides.map((g) => (
          <div
            key={g.id}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                  {g.question}
                </h3>
                <button
                  type="button"
                  onClick={() => handleReadAloud(g.id, g.answer)}
                  className="btn btn-secondary btn-sm"
                  aria-label="Read this card aloud"
                  style={{ padding: '0.3rem 0.5rem' }}
                >
                  <Volume2 size={15} color={readingAloud === g.id ? '#16A34A' : '#2563EB'} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                {g.answer}
              </p>

              <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '6px', borderLeft: '3px solid #2563EB', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                <strong>Helpful Tip:</strong> {g.tip}
              </div>
            </div>

            {readingAloud === g.id && (
              <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                🔊 Reading aloud to you...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Senior Citizens & In-Person Support Card */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <HeartHandshake size={28} color="#16A34A" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '1rem', color: '#166534' }}>
              Prefer to talk to a human financial counselor?
            </strong>
            <span style={{ fontSize: '0.85rem', color: '#15803D' }}>
              We provide free, patient telephone guidance and local branch appointments for anyone needing friendly support.
            </span>
          </div>
        </div>

        <HelpButton />
      </div>
    </div>
  );
};
