import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Lock, Mail, User, Phone, KeyRound, Sparkles, HelpCircle } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { HelpButton } from '../components/HelpButton';

export const Auth = ({ onNavigate }) => {
  const { setIsAuthenticated, setCurrentUser } = useFinancial();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // Email or Mobile
    password: '',
    mobile: '',
    rememberMe: true
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'signup') {
      if (!formData.name || !formData.identifier || !formData.password) {
        setError('Please fill in your name, contact details, and password.');
        return;
      }
      setCurrentUser((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.identifier.includes('@') ? formData.identifier : prev.email,
        mobile: !formData.identifier.includes('@') ? formData.identifier : prev.mobile,
        avatarInitials: formData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }));
      setIsAuthenticated(true);
      // Direct new users to Accessibility Setup as specified in the prompt!
      onNavigate('accessibility-setup');
      return;
    }

    setIsAuthenticated(true);
    onNavigate('dashboard');
  };

  const handleDemoLogin = () => {
    setIsAuthenticated(true);
    onNavigate('dashboard');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card fade-in" style={{ maxWidth: '480px' }}>
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="brand-logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-box" style={{ width: 38, height: 38 }}>
              <ShieldAlert size={22} />
            </div>
            <span className="brand-name" style={{ fontSize: '1.4rem' }}>Wealthra</span>
          </div>
          <p style={{ fontSize: '0.875rem' }}>Inclusive Digital Banking &amp; Wellness Platform</p>
        </div>

        {/* Instant 1-Click Demo Evaluation Banner */}
        <div className="auth-demo-banner">
          <div>
            <p><strong>Evaluation &amp; Presentation Mode</strong></p>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Instant access to pre-populated financial data</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleDemoLogin} type="button">
            <span>Instant Demo</span>
            <Sparkles size={14} />
          </button>
        </div>

        {/* Login / Signup Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthMode('login'); setError(''); }}
            style={{ fontSize: '0.95rem' }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => { setAuthMode('signup'); setError(''); }}
            style={{ fontSize: '0.95rem' }}
          >
            New Account
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {authMode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <div className="input-prefix-wrapper">
                <span className="input-prefix"><User size={16} /></span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Shudeep Roy"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Email / Mobile Number</label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix"><Phone size={16} /></span>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Mobile (+91) or Email address"
                value={formData.identifier}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="password">Password</label>
              {authMode === 'login' && (
                <a href="#forgot" style={{ fontSize: '0.8rem' }} onClick={(e) => { e.preventDefault(); alert('A reset link has been sent to your registered mobile/email.'); }}>
                  Forgot password?
                </a>
              )}
            </div>
            <div className="input-prefix-wrapper">
              <span className="input-prefix"><KeyRound size={16} /></span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {authMode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Remember me on this device
              </label>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}>
            <span>{authMode === 'login' ? 'Sign In to Banking' : 'Create Account & Customize Comfort'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer with Need Help Button */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => onNavigate('landing')}
            style={{ border: 'none' }}
          >
            ← Back to Home
          </button>

          <HelpButton />
        </div>
      </div>
    </div>
  );
};
