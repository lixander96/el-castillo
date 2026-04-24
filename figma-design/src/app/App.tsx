import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { DemoFAB } from './components/DemoFAB';
import { NotificationToast } from './components/NotificationToast';
import { Agenda } from './components/modules/Agenda';
import { Reservas } from './components/modules/Reservas';
import { Pujas } from './components/modules/Pujas';
import { Perfil } from './components/modules/Perfil';
import { Marketplace } from './components/modules/Marketplace';
import { Gastronomia } from './components/modules/Gastronomia';
import { Streaming } from './components/modules/Streaming';
import { Dashboard } from './components/modules/Dashboard';
import { Arquitectura } from './components/modules/Arquitectura';
import { Notificaciones } from './components/modules/Notificaciones';
import { README } from './components/modules/README';
import { FrameViewer } from './components/FrameViewer';
import { DesignSystemDemo } from './DesignSystem/demo';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('agenda');

  const renderContent = () => {
    switch (activeTab) {
      case 'agenda':
        return <Agenda />;
      case 'reservas':
        return <Reservas />;
      case 'pujas':
        return <Pujas />;
      case 'perfil':
        return <Perfil />;
      case 'marketplace':
        return <Marketplace />;
      case 'gastronomia':
        return <Gastronomia />;
      case 'streaming':
        return <Streaming />;
      case 'notificaciones':
        return <Notificaciones />;
      case 'dashboard':
        return <Dashboard />;
      case 'arquitectura':
        return <Arquitectura />;
      case 'readme':
        return <README />;
      case 'designsystem':
        return <DesignSystemDemo />;
      case 'frames':
        return <FrameViewer />;
      default:
        return <Agenda />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 pb-20">
          {renderContent()}
        </main>

        <Footer />

        <DemoFAB />
        <NotificationToast />
        <Toaster />
      </div>
    </AppProvider>
  );
}