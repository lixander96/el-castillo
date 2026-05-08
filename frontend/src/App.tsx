import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { NotificationToast } from './components/NotificationToast';
import { Toaster } from './components/ui/sonner';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname;
  const onTabChange = (tab: string) => {
    navigate(tab)
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation activeTab={activeTab} onTabChange={onTabChange} />

        <main className="flex-1 pb-20">
          <Outlet />
        </main>

        <Footer />

        <NotificationToast />
        <Toaster />
      </div>
    </AppProvider>
  );
}
