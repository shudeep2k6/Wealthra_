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
  Eye
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useAccessibility } from '../context/AccessibilityContext';

export const Sidebar = ({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) => {
  const { currentUser, setIsAuthenticated } = useFinancial();
  const { setIsPanelOpen, simpleLanguage } = useAccessibility();

  const navItems = [
    { id: 'dashboard', label: simpleLanguage ? 'My Wellness' : 'Dashboard', icon: LayoutDashboard },
    { id: 'assessment', label: simpleLanguage ? 'Health Check' : 'Assessment', icon: ClipboardCheck },
    { id: 'distress', label: simpleLanguage ? 'Distress Check' : 'Distress Detection', icon: ShieldAlert },
    { id: 'warnings', label: simpleLanguage ? 'Warning Signs' : 'Early Warning Center', icon: AlertTriangle },
    { id: 'predictive', label: simpleLanguage ? 'Future Outlook' : 'Predictive Risk', icon: TrendingUp },
    { id: 'interventions', label: simpleLanguage ? 'Action Steps' : 'Interventions', icon: CheckCircle2 },
    { id: 'expenses', label: simpleLanguage ? 'Money Flow' : 'Expenses & Flow', icon: PieChart },
    { id: 'debt', label: simpleLanguage ? 'Loan Health' : 'Debt & Loans', icon: CreditCard },
    { id: 'guidance', label: simpleLanguage ? 'Learning Guide' : 'Financial Guide', icon: BookOpen },
    { id: 'profile', label: simpleLanguage ? 'My Settings' : 'Profile & Settings', icon: UserCheck }
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
        <div className="sidebar-header">
          <div className="brand-logo" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-box">
              <ShieldAlert size={18} />
            </div>
            <span className="brand-name">Wealthra</span>
          </div>
          <span className="brand-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>INCLUSIVE</span>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <span className="sidebar-nav-heading">Wellness Banking</span>
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

        {/* Accessibility trigger & User Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-link"
            onClick={() => setIsPanelOpen(true)}
            style={{ color: '#2563EB', backgroundColor: 'var(--color-blue-subtle)', marginBottom: '0.5rem' }}
          >
            <Eye size={18} />
            <span>Accessibility Settings</span>
          </button>

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
                Safe Banking Active
              </span>
            </div>
          </div>

          <button className="sidebar-link" onClick={handleLogout} style={{ marginTop: '0.25rem', color: '#DC2626' }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
