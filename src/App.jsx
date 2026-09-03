import React, { useState } from 'react';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { VoiceAssistant } from './components/VoiceAssistant';

// Pages
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { AccessibilitySetup } from './pages/AccessibilitySetup';
import { Assessment } from './pages/Assessment';
import { Dashboard } from './pages/Dashboard';
import { DistressDetection } from './pages/DistressDetection';
import { EarlyWarnings } from './pages/EarlyWarnings';
import { PredictiveRisk } from './pages/PredictiveRisk';
import { Interventions } from './pages/Interventions';
import { Expenses } from './pages/Expenses';
import { DebtHealth } from './pages/DebtHealth';
import { FinancialGuide } from './pages/FinancialGuide';
import { ProfileSettings } from './pages/ProfileSettings';

// Styles
import './styles/global.css';
import './styles/accessibility.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/dashboard.css';
import './styles/pages.css';

const AppContent = () => {
  const { isAuthenticated } = useFinancial();
  const [activePage, setActivePage] = useState('landing');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Full-screen standalone views (Landing, Auth, Accessibility Onboarding)
  if (activePage === 'landing') {
    return (
      <>
        <Landing onNavigate={setActivePage} />
        <AccessibilityPanel />
        <VoiceAssistant onNavigate={setActivePage} />
      </>
    );
  }

  if (activePage === 'auth') {
    return (
      <>
        <Auth onNavigate={setActivePage} />
        <AccessibilityPanel />
        <VoiceAssistant onNavigate={setActivePage} />
      </>
    );
  }

  if (activePage === 'accessibility-setup') {
    return (
      <>
        <AccessibilitySetup onNavigate={setActivePage} />
        <AccessibilityPanel />
        <VoiceAssistant onNavigate={setActivePage} />
      </>
    );
  }

  // In-App Shell with Sidebar, Topbar, and Page container
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'assessment':
        return <Assessment onNavigate={setActivePage} />;
      case 'distress':
        return <DistressDetection onNavigate={setActivePage} />;
      case 'warnings':
        return <EarlyWarnings onNavigate={setActivePage} />;
      case 'predictive':
        return <PredictiveRisk onNavigate={setActivePage} />;
      case 'interventions':
        return <Interventions onNavigate={setActivePage} />;
      case 'expenses':
        return <Expenses onNavigate={setActivePage} />;
      case 'debt':
        return <DebtHealth onNavigate={setActivePage} />;
      case 'guidance':
        return <FinancialGuide onNavigate={setActivePage} />;
      case 'profile':
        return <ProfileSettings onNavigate={setActivePage} />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main App Container */}
      <div className="main-wrapper">
        <Navbar
          setActivePage={setActivePage}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        <main id="main-content" tabIndex="-1">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Accessibility Popover Panel */}
      <AccessibilityPanel />

      {/* Global Voice Assistant Guidance */}
      <VoiceAssistant onNavigate={setActivePage} />
    </div>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <FinancialProvider>
        <AppContent />
      </FinancialProvider>
    </AccessibilityProvider>
  );
}
