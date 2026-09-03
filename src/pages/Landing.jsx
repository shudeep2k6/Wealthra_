import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Eye,
  CheckCircle2,
  HeartHandshake,
  TrendingDown,
  Sparkles,
  Users
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const Landing = ({ onNavigate }) => {
  const { setIsPanelOpen } = useAccessibility();

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <nav className="landing-nav">
        <div className="brand-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <ShieldAlert size={18} />
          </div>
          <span className="brand-name">Wealthra</span>
          <span className="brand-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>INCLUSIVE</span>
        </div>

        <div className="landing-nav-links">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsPanelOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Eye size={15} />
            <span>Accessibility Mode</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('auth')}>
            Sign In
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dashboard')}>
            <span>Launch Platform</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill-badge">
          <span className="dot"></span>
          <span>Preventing Financial Distress Through Inclusive Digital Banking</span>
        </div>

        <h1>Your Financial Health, Made Simple.</h1>

        <p className="hero-subtitle">
          Understand your financial situation, identify early warning signs, and get personalized guidance before financial stress becomes a crisis.
        </p>

        <div className="hero-cta-group">
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('assessment')}>
            <span>Check My Financial Health</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('dashboard')}>
            <span>How It Works</span>
          </button>
        </div>

        {/* Trust Statement */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.6rem 1.25rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: '99px',
            fontSize: '0.85rem',
            color: 'var(--color-navy)',
            marginBottom: '3rem',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <HeartHandshake size={18} color="#2563EB" />
          <span>
            <strong>Designed for everyone</strong> — including elderly users and people with different accessibility needs.
          </span>
        </div>

        {/* 3 Simple Steps */}
        <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto 3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
            <div className="card" style={{ borderTop: '4px solid #2563EB' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB', marginBottom: '0.35rem' }}>01</div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>Understand</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Connect or enter your financial information in short, simple steps with large readable text and zero jargon.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B', marginBottom: '0.35rem' }}>02</div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>Detect</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Identify early signs of financial stress before debt piles up or payments become difficult to manage.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #16A34A' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16A34A', marginBottom: '0.35rem' }}>03</div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '0.35rem' }}>Prevent</h3>
              <p style={{ fontSize: '0.875rem' }}>
                Receive personalized and accessible guidance with step-by-step action plans designed to keep your money safe.
              </p>
            </div>
          </div>
        </div>

        {/* Clean Dashboard Preview Card */}
        <div className="hero-visual-wrapper">
          <div className="hero-preview-topbar">
            <div className="hero-preview-dots">
              <span className="preview-dot"></span>
              <span className="preview-dot"></span>
              <span className="preview-dot"></span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Wealthra Banking Wellness Cockpit — Live Demonstration
            </span>
            <span className="badge badge-positive">
              <span className="user-status-dot"></span>
              Wellness Score: 74 Stable
            </span>
          </div>

          <div className="hero-preview-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>Monthly Income</span>
                <strong style={{ fontSize: '1.35rem', color: '#0B1220' }}>₹50,000</strong>
                <span className="badge badge-positive" style={{ display: 'block', width: 'fit-content', marginTop: '0.35rem' }}>Stable</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>Essential Expenses</span>
                <strong style={{ fontSize: '1.35rem', color: '#0B1220' }}>₹27,500</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.35rem' }}>55% of income</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>Total Savings</span>
                <strong style={{ fontSize: '1.35rem', color: '#0B1220' }}>₹1,20,000</strong>
                <span className="badge badge-positive" style={{ display: 'block', width: 'fit-content', marginTop: '0.35rem' }}>Growing</span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '0.25rem' }}>Debt Payments</span>
                <strong style={{ fontSize: '1.35rem', color: '#0B1220' }}>₹9,500/mo</strong>
                <span className="badge badge-blue" style={{ display: 'block', width: 'fit-content', marginTop: '0.35rem' }}>Moderate</span>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#166534', display: 'block' }}>
                  Current Status: Financial Distress Risk is LOW (24%)
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#15803D' }}>
                  “Your income and expenses are currently balanced. However, your savings could provide more protection against unexpected expenses.”
                </span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dashboard')}>
                View Full Cockpit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Wealthra — Preventing Financial Distress Through Inclusive Digital Banking. Built to WCAG AAA accessibility standards.</p>
      </footer>
    </div>
  );
};
