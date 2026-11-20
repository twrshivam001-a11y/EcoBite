import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DevSetupBanner } from './components/DevSetupBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { FeedbackModal } from './components/FeedbackModal';
import { ToastContainer } from './components/ToastContainer';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { PlansPage } from './pages/PlansPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';

const AppShell: React.FC = () => {
  const { user, profile, loading, profileLoading, isDemoMode, needsEmailVerification } = useAuth();
  const { activeTab } = useAppData();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-[#166534] animate-spin" />
        <p className="mt-4 font-display text-sm font-medium text-stone-600">
          Loading EcoBite Lucknow...
        </p>
      </div>
    );
  }

  // Protected Auth Gate
  if (!isDemoMode && (!user || needsEmailVerification)) {
    return (
      <>
        <DevSetupBanner />
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  // Protected Onboarding Gate
  if (!profile || !profile.onboardingComplete) {
    return (
      <>
        <DevSetupBanner />
        <OnboardingPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col pb-20 md:pb-0">
      <DevSetupBanner />
      <OfflineIndicator />
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'menu' && <MenuPage />}
        {activeTab === 'plans' && <PlansPage />}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <footer className="hidden md:block border-t border-stone-200/80 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-stone-500">
          <span>EcoBite · Fresh, Hygienic, Affordable Home-Style Meals in Lucknow</span>
          <span>Zero-Plastic Bagasse Packaging · FSSAI Verified Home Kitchens</span>
        </div>
      </footer>

      <BottomNav />
      <CartDrawer />
      <FeedbackModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppDataProvider>
          <AppShell />
        </AppDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
