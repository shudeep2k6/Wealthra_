import React, { useState } from 'react';
import { User, Bell, Shield, LogOut, Check, Globe } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useLanguage } from '../context/LanguageContext';

export const ProfileSettings = ({ onNavigate }) => {
  const { currentUser, setCurrentUser, setIsAuthenticated } = useFinancial();
  const { currentLanguage, setLanguage, languages, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('personal');
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
          <h1>{t('profile.title', 'Profile & Settings')}</h1>
          <p>{t('profile.subtitle', 'Manage your personal banking preferences, notification alerts, and security settings.')}</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Settings Left Navigation */}
        <div className="settings-nav">
          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={16} />
            <span>{t('profile.personalInfo', 'Personal Information')}</span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            <span>{t('profile.alerts', 'Alert Preferences')}</span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={16} />
            <span>{t('profile.security', 'Security & Account')}</span>
          </button>
        </div>

        {/* Settings Content Pane */}
        <div className="settings-pane">
          {/* TAB 1: Personal Information */}
          {activeTab === 'personal' && (
            <form onSubmit={handleProfileSubmit} className="fade-in">
              <h2 className="settings-section-title">{t('profile.personalInfo', 'Personal Information')}</h2>
              <p className="settings-section-sub">
                Update your primary contact details and demographic settings.
              </p>

              {/* 5-Language Selection Grid */}
              <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Globe size={18} color="#2563EB" />
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>
                    {t('profile.language', 'Platform Language / भाषा चुनें')}
                  </strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {languages.map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          backgroundColor: isSelected ? 'var(--color-blue-subtle)' : '#FFFFFF',
                          border: isSelected ? '2px solid var(--color-blue)' : '1px solid var(--color-border)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--color-blue)' : 'var(--color-navy)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ display: 'block', fontSize: '1rem' }}>{lang.flag} {lang.nativeName}</span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>{lang.name}</span>
                        </div>
                        {isSelected && <Check size={16} color="#2563EB" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="fields-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-name">{t('profile.fullName', 'Full Name')}</label>
                  <input
                    id="prof-name"
                    type="text"
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-email">{t('profile.email', 'Email Address')}</label>
                  <input
                    id="prof-email"
                    type="email"
                    className="form-input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-mobile">{t('profile.phone', 'Mobile Number (SMS Alerts)')}</label>
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
                <span>{isSaved ? 'Saved Successfully!' : t('profile.saveChanges', 'Save Personal Details')}</span>
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
