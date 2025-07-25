import React, { useState, useCallback } from 'react';
import { User, SubscriptionTier } from './types';
import { getLoggedInUser, loginUser, logoutUser, upgradeSubscription } from './services/storyService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SubscriptionPage from './components/SubscriptionPage';
import StoryCreator from './components/StoryCreator';
import PaymentModal from './components/PaymentModal';
import HomePage from './components/HomePage';
import { SUBSCRIPTION_PLANS } from './constants';
import { useTranslations } from './hooks/useTranslations';

type View = 'dashboard' | 'subscriptions' | 'story-creator';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(getLoggedInUser());
  const [view, setView] = useState<View>('dashboard');
  const [viewContext, setViewContext] = useState<any>(null);
  const { t } = useTranslations();

  const [planToPurchase, setPlanToPurchase] = useState<SubscriptionTier | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleSetView = (newView: string, context: any = null) => {
    setView(newView as View);
    setViewContext(context);
    setUser(getLoggedInUser()); // Refresh user from localStorage on view change
    window.scrollTo(0, 0);
  };
  
  const handleLogin = (name: string, email: string) => {
      const loggedInUser = loginUser(name, email);
      setUser(loggedInUser);
      setView('dashboard');
  };

  const handleLogout = () => {
      logoutUser();
      setUser(null);
      setView('dashboard'); // Reset view for next login
  };
  
  const handleInitiateUpgrade = (tier: SubscriptionTier) => {
    setPlanToPurchase(tier);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!planToPurchase || !user) return;
    const updatedUser = upgradeSubscription(planToPurchase, user);
    setUser(updatedUser);
    setIsPaymentModalOpen(false);
    alert(t('upgrade_success', { tier: planToPurchase }));
    setPlanToPurchase(null);
    handleSetView('dashboard');
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    setPlanToPurchase(null);
  };
  
  const renderView = () => {
    if (!user) return null; // Should not be reached
    switch (view) {
      case 'dashboard':
        return <Dashboard user={user} setView={handleSetView} />;
      case 'subscriptions':
        return <SubscriptionPage user={user} onUpgrade={handleInitiateUpgrade} setView={handleSetView} />;
      case 'story-creator':
        return <StoryCreator user={user} storyToContinue={viewContext?.storyToContinue || null} setView={handleSetView} />;
      default:
        return <Dashboard user={user} setView={handleSetView} />;
    }
  };

  if (!user) {
      return <HomePage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} setView={handleSetView} onLogout={handleLogout} />
      <main>
        {renderView()}
      </main>
      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>{t('footer_text')}</p>
      </footer>
      {isPaymentModalOpen && planToPurchase && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPayment}
          plan={SUBSCRIPTION_PLANS[planToPurchase]}
        />
      )}
    </div>
  );
};

export default App;