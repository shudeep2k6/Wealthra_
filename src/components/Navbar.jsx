import React, { useState } from 'react';
import { Bell, Menu, Volume2, ShieldCheck, AlertCircle, TrendingDown } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';
import { HelpButton } from './HelpButton';
import { LanguageSelector } from './LanguageSelector';

export const Navbar = ({ setActivePage, onOpenMobileMenu }) => {
  const { currentUser } = useFinancial();
  const { setIsPanelOpen, voiceEnabled, setVoiceEnabled } = useAccessibility();
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('topbar.goodMorning', 'Good Morning');
    if (hour < 17) return t('topbar.goodAfternoon', 'Good Afternoon');
    return t('topbar.goodEvening', 'Good Evening');
  };

  const notifications = [
    {
      id: 1,
      title: 'Financial Alert',
      desc: 'Your monthly essential expenses increased by 12% over 3 months.',
      time: '15m ago',
      color: '#F59E0B'
    },
    {
      id: 2,
      title: 'Payment Reminder',
      desc: 'Your upcoming home loan EMI of ₹9,500 is scheduled in 5 days.',
      time: '2h ago',
      color: '#2563EB'
    },
    {
      id: 3,
      title: 'Positive Update',
      desc: 'Your savings buffer reached 3.2 months of essential coverage.',
      time: '1d ago',
      color: '#16A34A'
    }
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onOpenMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="topbar-greeting">
          <h2 className="greeting-title">{getGreeting()}, {currentUser.name.split(' ')[0]}</h2>
          <span className="greeting-sub">{t('topbar.activeSub', 'Inclusive Digital Banking & Wellness Guard Active')}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Language Selector Dropdown */}
        <LanguageSelector variant="topbar" />

        {/* Voice Assistant Toggle */}
        <button
          type="button"
          className={`btn btn-sm ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          aria-label="Toggle voice guidance"
          style={{ display: 'none', md: 'inline-flex' }}
        >
          <Volume2 size={15} />
          <span>{t('topbar.voiceMode', 'Voice Mode')}</span>
        </button>

        {/* Customer Assistance Help Button */}
        <HelpButton />

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View system alerts"
          >
            <Bell size={18} />
            <span className="notification-badge">3</span>
          </button>

          {showNotifications && (
            <div className="notification-popover" onMouseLeave={() => setShowNotifications(false)}>
              <div className="notification-header">
                <span>Account Alerts</span>
                <span className="badge badge-blue">3 Updates</span>
              </div>
              <div className="notification-list">
                {notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    <div className="notif-icon" style={{ color: n.color }}>
                      <AlertCircle size={16} />
                    </div>
                    <div className="notif-text">
                      <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-navy)' }}>{n.title}</strong>
                      {n.desc}
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div
          className="user-avatar"
          style={{ cursor: 'pointer' }}
          onClick={() => setActivePage('profile')}
          title="Profile & Settings"
        >
          {currentUser.avatarInitials}
        </div>
      </div>
    </header>
  );
};
