import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';

import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { RecoveryCopilotModal } from './components/modals/RecoveryCopilotModal';
import { ReportExportModal } from './components/modals/ReportExportModal';
import { PageTransition } from './components/layout/PageTransition';
import { AnimatePresence } from 'motion/react';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { DashboardPage } from './pages/DashboardPage';
import { RecoveryQueuePage } from './pages/RecoveryQueuePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { SimulationPage } from './pages/SimulationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { SettingsPage } from './pages/SettingsPage';

function MainApp() {
  const { user, isAuthenticated, login } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleDemoLogin = async () => {
    await login('surajkr12510@gmail.com');
    navigate('/dashboard');
  };

  // Route matching
  const renderRoute = () => {
    if (currentPath === '/') {
      return <LandingPage navigate={navigate} onDemoLogin={handleDemoLogin} />;
    }
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/signup') {
      return <SignupPage navigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }
    if (currentPath === '/onboarding') {
      return <OnboardingWizard navigate={navigate} />;
    }

    // Authenticated views
    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/recovery') {
      return <RecoveryQueuePage navigate={navigate} />;
    }
    if (currentPath === '/transactions') {
      return <TransactionsPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/transactions/')) {
      const id = currentPath.replace('/transactions/', '');
      return <TransactionDetailPage transactionId={id} navigate={navigate} />;
    }
    if (currentPath === '/customers') {
      return <CustomersPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/customers/')) {
      const id = currentPath.replace('/customers/', '');
      return <CustomerDetailPage customerId={id} navigate={navigate} />;
    }
    if (currentPath === '/simulation') {
      return <SimulationPage navigate={navigate} />;
    }
    if (currentPath === '/analytics') {
      return <AnalyticsPage />;
    }
    if (currentPath === '/experiments') {
      return <ExperimentsPage />;
    }
    if (currentPath === '/audit') {
      return <AuditLogPage />;
    }
    if (currentPath === '/developer') {
      return <DeveloperPage />;
    }
    if (currentPath === '/settings') {
      return <SettingsPage />;
    }

    // Fallback to Dashboard
    return <DashboardPage navigate={navigate} />;
  };

  const isPublicPage =
    currentPath === '/' ||
    currentPath === '/login' ||
    currentPath === '/signup' ||
    currentPath === '/forgot-password' ||
    currentPath === '/onboarding';

  if (isPublicPage) {
    return (
      <>
        <AnimatePresence mode="wait">
          <PageTransition key={currentPath}>
            {renderRoute()}
          </PageTransition>
        </AnimatePresence>
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar currentPath={currentPath} navigate={navigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopNav navigate={navigate} />
        <main className="flex-1 pb-16">
          <AnimatePresence mode="wait">
            <PageTransition key={currentPath}>
              {renderRoute()}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Interactive Modals & Toasts */}
      <GlobalSearchModal navigate={navigate} />
      <RecoveryCopilotModal navigate={navigate} />
      <ReportExportModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <MainApp />
      </PlatformProvider>
    </AuthProvider>
  );
}
