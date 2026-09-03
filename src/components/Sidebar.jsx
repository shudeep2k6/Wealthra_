import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  PieChart,
  CreditCard,
  BookOpen,
  UserCheck,
  LogOut,
  FileSearch,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar = ({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) => {
  const { currentUser, setIsAuthenticated } = useFinancial();
  const { setIsPanelOpen, simpleLanguage } = useAccessibility();
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'assessment', label: t('nav.assessment', 'Assessment'), icon: ClipboardCheck },
    { id: 'distress', label: t('nav.distress', 'Distress Detection'), icon: ShieldAlert },
    { id: 'warnings', label: t('nav.warnings', 'Early Warning Center'), icon: AlertTriangle },
    { id: 'predictive', label: t('nav.predictive', 'Predictive Risk'), icon: TrendingUp },
    { id: 'interventions', label: t('nav.interventions', 'Interventions'), icon: CheckCircle2 },
    { id: 'expenses', label: t('nav.expenses', 'Expenses & Flow'), icon: PieChart },
    { id: 'debt', label: t('nav.debt', 'Debt & Loans'), icon: CreditCard },
    { id: 'loan-detector', label: t('nav.loanTerms', 'Loan Terms Detector'), icon: FileSearch },
    { id: 'monthly-income', label: t('nav.monthlyIncome', 'Monthly Income Manager'), icon: Coins },
    { id: 'scamshield', label: t('nav.scamshield', 'ScamShield AI'), icon: ShieldCheck },
    { id: 'guidance', label: t('nav.guidance', 'Financial Guide'), icon: BookOpen },
    { id: 'profile', label: t('nav.profile', 'Profile & Settings'), icon: UserCheck }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActivePage('auth');
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header" style={{ padding: '0.75rem 1.25rem', height: 'auto', minHeight: '68px', display: 'flex', alignItems: 'center' }}>
          <div className="brand-logo" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center' }}>
            <img
              src="/wealthra_logo.png"
              alt="Wealthra"
              style={{
                width: '100%',
                maxHeight: '52px',
                objectFit: 'contain',
                objectPosition: 'left center',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-heading">{t('nav.heading', 'Wellness Banking')}</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                id={`nav-${item.id}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">

          <div
            className="user-snippet"
            onClick={() => handleNavClick('profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar">{currentUser.avatarInitials}</div>
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-status">
                <span className="user-status-dot"></span>
                {t('nav.safeBanking', 'Safe Banking Active')}
              </span>
            </div>
          </div>

          <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '0.25rem', color: '#DC2626' }}>
            <LogOut size={18} />
            <span>{t('nav.logout', 'Logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
