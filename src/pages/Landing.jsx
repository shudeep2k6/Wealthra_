import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  TrendingDown,
  Sparkles,
  Users,
  Wallet,
  PieChart,
  PiggyBank,
  CreditCard,
  Lock,
  Activity,
  Search
} from 'lucide-react';
export const Landing = ({ onNavigate }) => {

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <nav className="landing-nav">
        <div className="landing-brand-capsule" onClick={() => onNavigate('landing')}>
          <img
            src="/wealthra_logo.png"
            alt="Wealthra - Predict . Empower . Protect"
          />
        </div>

        <div className="landing-nav-links">
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('auth')} style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            Sign In
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dashboard')}>
            <span>Launch Platform</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Header Part with Continuous Dynamic Video Background & Glassmorphic Card */}
      <header className="landing-hero-video-section">
        {/* Continuous Dynamic Background Video */}
        <div className="hero-video-bg-wrapper">
          <video
            className="hero-video-element"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/A_premium_cinematic_fintech_AI.mp4" type="video/mp4" />
          </video>
          {/* Frosted Dark Glass Overlay */}
          <div className="hero-video-glass-overlay" />
        </div>

        {/* Hero Glassmorphic Card Container */}
        <div className="hero-glass-container">
          <div className="hero-glass-card">
            <div className="hero-glass-pill-badge">
              <span className="dot"></span>
              <span>Preventing Financial Distress Through Inclusive Digital Banking</span>
            </div>

            <h1 className="hero-glass-title">Your Financial Health, Made Simple.</h1>

            <p className="hero-glass-subtitle">
              Understand your financial situation, identify early warning signs, and get personalized guidance before financial stress becomes a crisis.
            </p>

            <div className="hero-glass-cta-group">
              <button className="btn btn-primary btn-lg hero-glass-btn-primary" onClick={() => onNavigate('assessment')}>
                <span>Check My Financial Health</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary btn-lg hero-glass-btn-secondary" onClick={() => onNavigate('dashboard')}>
                <span>How It Works</span>
              </button>
            </div>

            {/* Trust Statement inside glass */}
            <div className="hero-glass-trust">
              <HeartHandshake size={18} color="#60A5FA" />
              <span>
                <strong>Designed for everyone</strong> — including elderly users and people with different accessibility needs.
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Landing Page Body (3 Steps, Cockpit Preview, Capabilities) */}
      <main className="landing-body-section">
        {/* 3 Simple Steps */}
        <section className="landing-steps-container">
          <div className="landing-steps-header">
            <span className="landing-steps-badge">
              <Sparkles size={13} />
              <span>The Wealthra Methodology</span>
            </span>
            <h2 className="landing-steps-title">Three Simple Steps to Financial Peace of Mind</h2>
            <p className="landing-steps-subtitle">
              Proactive banking intelligence designed to keep you ahead of financial stress with total clarity and zero jargon.
            </p>
          </div>

          <div className="steps-cards-grid">
            {/* Step 1: Understand */}
            <div className="modern-step-card">
              <span className="step-card-watermark">01</span>
              <div>
                <div className="step-icon-badge step-icon-blue">
                  <Search size={22} />
                </div>
                <h3 className="step-card-title">Understand</h3>
                <p className="step-card-desc">
                  Connect or enter your financial information in short, simple steps with large readable text and zero jargon.
                </p>
              </div>
              <div className="step-card-chip">
                <CheckCircle2 size={14} color="#2563EB" />
                <span>Large Readable Text &amp; Zero Jargon</span>
              </div>
            </div>

            {/* Step 2: Detect */}
            <div className="modern-step-card">
              <span className="step-card-watermark">02</span>
              <div>
                <div className="step-icon-badge step-icon-amber">
                  <Activity size={22} />
                </div>
                <h3 className="step-card-title">Detect</h3>
                <p className="step-card-desc">
                  Identify early signs of financial stress before debt piles up or payments become difficult to manage.
                </p>
              </div>
              <div className="step-card-chip">
                <CheckCircle2 size={14} color="#D97706" />
                <span>Proactive Stress &amp; Debt Alerts</span>
              </div>
            </div>

            {/* Step 3: Prevent */}
            <div className="modern-step-card">
              <span className="step-card-watermark">03</span>
              <div>
                <div className="step-icon-badge step-icon-emerald">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="step-card-title">Prevent</h3>
                <p className="step-card-desc">
                  Receive personalized and accessible guidance with step-by-step action plans designed to keep your money safe.
                </p>
              </div>
              <div className="step-card-chip">
                <CheckCircle2 size={14} color="#059669" />
                <span>Tailored Action Roadmaps</span>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Dashboard Preview Card */}
        <section className="cockpit-preview-window">
          {/* macOS Browser Topbar */}
          <div className="cockpit-window-topbar">
            <div className="mac-window-controls">
              <span className="mac-dot mac-dot-close"></span>
              <span className="mac-dot mac-dot-min"></span>
              <span className="mac-dot mac-dot-max"></span>
            </div>

            <div className="cockpit-url-pill">
              <Lock size={12} color="#10B981" />
              <span>wealthra.app/live-cockpit</span>
            </div>

            <div className="cockpit-status-badge">
              <span className="pulse-dot-emerald"></span>
              <span>Wellness Score: 74 Stable</span>
            </div>
          </div>

          {/* Cockpit Window Content */}
          <div className="cockpit-window-body">
            <div className="cockpit-body-subheading">
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: 'var(--color-navy)', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} color="#2563EB" />
                <span>Wealthra Banking Wellness Cockpit — Live Demonstration</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Real-Time Household Intelligence</span>
            </div>

            {/* 4 Metric Cards */}
            <div className="cockpit-metrics-grid">
              {/* Monthly Income */}
              <div className="cockpit-metric-card">
                <div>
                  <div className="metric-card-header">
                    <div className="metric-mini-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                      <Wallet size={15} />
                    </div>
                    <span className="metric-card-label">Monthly Income</span>
                  </div>
                  <div className="metric-card-value">₹50,000</div>
                </div>
                <div className="metric-card-footer">
                  <span className="badge badge-positive" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Stable</span>
                  <span>Net inflow</span>
                </div>
              </div>

              {/* Essential Expenses */}
              <div className="cockpit-metric-card">
                <div>
                  <div className="metric-card-header">
                    <div className="metric-mini-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
                      <PieChart size={15} />
                    </div>
                    <span className="metric-card-label">Essential Expenses</span>
                  </div>
                  <div className="metric-card-value">₹27,500</div>
                </div>
                <div className="metric-card-footer">
                  <span style={{ fontWeight: 600, color: '#D97706' }}>55% of income</span>
                  <span>Safe ceiling</span>
                </div>
              </div>

              {/* Total Savings */}
              <div className="cockpit-metric-card">
                <div>
                  <div className="metric-card-header">
                    <div className="metric-mini-icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                      <PiggyBank size={15} />
                    </div>
                    <span className="metric-card-label">Total Savings</span>
                  </div>
                  <div className="metric-card-value">₹1,20,000</div>
                </div>
                <div className="metric-card-footer">
                  <span className="badge badge-positive" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Growing</span>
                  <span>4.3 mos buffer</span>
                </div>
              </div>

              {/* Debt Payments */}
              <div className="cockpit-metric-card">
                <div>
                  <div className="metric-card-header">
                    <div className="metric-mini-icon" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
                      <CreditCard size={15} />
                    </div>
                    <span className="metric-card-label">Debt Payments</span>
                  </div>
                  <div className="metric-card-value">₹9,500<span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748B' }}>/mo</span></div>
                </div>
                <div className="metric-card-footer">
                  <span className="badge badge-blue" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>Moderate</span>
                  <span>19% DTI ratio</span>
                </div>
              </div>
            </div>

            {/* AI Status Cockpit Banner */}
            <div className="cockpit-ai-status-banner">
              <div className="ai-status-left">
                <div className="ai-status-shield-circle">
                  <ShieldCheck size={26} color="#16A34A" />
                </div>
                <div>
                  <div className="ai-status-title">
                    <span>Current Status: Financial Distress Risk is LOW (24%)</span>
                  </div>
                  <p className="ai-status-quote">
                    “Your income and expenses are currently balanced. However, your savings could provide more protection against unexpected expenses.”
                  </p>
                </div>
              </div>

              <button
                className="cockpit-launch-btn"
                onClick={() => onNavigate('dashboard')}
              >
                <span>View Full Cockpit</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Wealthra — Preventing Financial Distress Through Inclusive Digital Banking. Built to WCAG AAA accessibility standards.</p>
      </footer>
    </div>
  );
};
