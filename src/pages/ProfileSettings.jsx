import React, { useState } from 'react';
import { User, Eye, Bell, Shield, LogOut, Check, Sparkles, Volume2, Type } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useAccessibility } from '../context/AccessibilityContext';

export const ProfileSettings = ({ onNavigate }) => {
  const { currentUser, setCurrentUser, setIsAuthenticated } = useFinancial();
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
    setVoiceEnabled
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState('accessibility');
  const [profileForm, setProfileForm] = useState({ ...currentUser });
  const [isSaved, setIsSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    financialAlerts: true,
    paymentReminders: true,
    positiveUpdates: true,
    smsAlerts: true
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setCurrentUser(profileForm);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    onNavigate('auth');
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Profile &amp; Accessibility Settings</h1>
          <p>Manage your personal banking preferences, accessibility options, and security settings.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Settings Left Navigation */}
        <div className="settings-nav">
          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'accessibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessibility')}
          >
            <Eye size={16} />
            <span>Accessibility &amp; Comfort</span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={16} />
            <span>Personal Information</span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            <span>Alert Preferences</span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={16} />
            <span>Security &amp; Account</span>
          </button>
        </div>

        {/* Settings Content Pane */}
        <div className="settings-pane">
          {/* TAB 1: Accessibility & Comfort */}
          {activeTab === 'accessibility' && (
            <div className="fade-in">
              <h2 className="settings-section-title">Accessibility &amp; Viewing Preferences</h2>
              <p className="settings-section-sub">
                Configure typography scale, contrast, and guidance assistance. All changes apply instantly.
              </p>

              {/* Text Size */}
              <div style={{ marginBottom: '1.75rem' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '0.6rem' }}>
                  Text Size Scaling
                </strong>
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

              {/* Contrast Mode */}
              <div style={{ marginBottom: '1.75rem' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '0.6rem' }}>
                  Contrast &amp; Colors (WCAG AAA)
                </strong>
                <div className="toggle-group-row">
                  <button
                    type="button"
                    className={`toggle-pill ${contrastMode === 'standard' ? 'active' : ''}`}
                    onClick={() => setContrastMode('standard')}
                  >
                    Standard Banking Palette
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

              {/* Reading Mode */}
              <div style={{ marginBottom: '1.75rem' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)', marginBottom: '0.6rem' }}>
                  Simple Language Mode
                </strong>
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
                    Simple Everyday Language (Active)
                  </button>
                </div>
              </div>

              {/* Motion and Voice Toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-subtle)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                    Screen Motion
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.65rem' }}>
                    Removes all screen slide and fade effects
                  </span>
                  <button
                    type="button"
                    className={`btn btn-sm ${reduceMotion ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setReduceMotion(!reduceMotion)}
                    style={{ width: '100%' }}
                  >
                    {reduceMotion ? 'Reduced Motion: ON' : 'Normal Motion'}
                  </button>
                </div>

                <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-surface-subtle)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)', marginBottom: '0.25rem' }}>
                    Voice Assistance
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.65rem' }}>
                    Enables voice recognition &amp; spoken prompts
                  </span>
                  <button
                    type="button"
                    className={`btn btn-sm ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    style={{ width: '100%' }}
                  >
                    <Volume2 size={14} />
                    <span>{voiceEnabled ? 'Voice Guidance: ON' : 'Enable Voice'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Personal Information */}
          {activeTab === 'personal' && (
            <form onSubmit={handleProfileSubmit} className="fade-in">
              <h2 className="settings-section-title">Personal Information</h2>
              <p className="settings-section-sub">
                Update your primary contact details and demographic settings.
              </p>

              <div className="fields-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-name">Full Name</label>
                  <input
                    id="prof-name"
                    type="text"
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-email">Email Address</label>
                  <input
                    id="prof-email"
                    type="email"
                    className="form-input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-mobile">Mobile Number (SMS Alerts)</label>
                  <input
                    id="prof-mobile"
                    type="text"
                    className="form-input"
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-age">Age (Senior Citizen Support Enabled if 60+)</label>
                  <input
                    id="prof-age"
                    type="number"
                    className="form-input"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                <Check size={16} />
                <span>{isSaved ? 'Saved Successfully!' : 'Save Personal Details'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className="fade-in">
              <h2 className="settings-section-title">Alert &amp; Early Notification Preferences</h2>
              <p className="settings-section-sub">
                Control how and when Wealthra alerts you about financial pattern shifts.
              </p>

              <div className="habits-list">
                <div className="habit-item">
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      Early Financial Stress Alerts
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Receive gentle notifications when essential spending increases or emergency runway dips.
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.financialAlerts}
                      onChange={() => setNotifications({ ...notifications, financialAlerts: !notifications.financialAlerts })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="habit-item">
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      Upcoming Payment Reminders
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Friendly reminders 5 days before scheduled loan EMIs and utility bills.
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.paymentReminders}
                      onChange={() => setNotifications({ ...notifications, paymentReminders: !notifications.paymentReminders })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="habit-item">
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                      Positive Milestone Updates
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Celebrate when your emergency buffer reaches target months.
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notifications.positiveUpdates}
                      onChange={() => setNotifications({ ...notifications, positiveUpdates: !notifications.positiveUpdates })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Security */}
          {activeTab === 'security' && (
            <div className="fade-in">
              <h2 className="settings-section-title">Security &amp; Account Data</h2>
              <p className="settings-section-sub">
                Manage your credentials and export your financial wellness report.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                      Two-Factor Authentication (SMS OTP)
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>Active &amp; Verified</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert('Two-factor security is already enabled for your phone.')}>
                    Manage 2FA
                  </button>
                </div>

                <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                      Download Financial Wellness Report (PDF)
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      A readable, printable summary suitable for your records or bank meeting.
                    </span>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                    Export Report
                  </button>
                </div>

                <div style={{ padding: '1rem', border: '1px solid #FECACA', backgroundColor: '#FEF2F2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#DC2626' }}>
                      Sign Out of Digital Banking
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#991B1B' }}>
                      Securely end this banking session on your device.
                    </span>
                  </div>
                  <button className="btn btn-sm" onClick={handleLogout} style={{ backgroundColor: '#DC2626', color: 'white', border: 'none' }}>
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
