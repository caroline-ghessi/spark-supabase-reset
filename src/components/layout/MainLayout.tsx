
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConversationsDashboard } from '../conversations/ConversationsDashboard';
import { RealSellersPanel } from '../sellers/RealSellersPanel';
import { MetricsPanel } from '../metrics/MetricsPanel';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { SettingsPanel } from '../settings/SettingsPanel';
import { PlatformHealthCheck } from '../testing/PlatformHealthCheck';
import { ToastContainer } from '../notifications/ToastContainer';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { NotificationProvider } from '@/contexts/NotificationContext';

export const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('conversations');

  const renderPage = () => {
    switch (currentPage) {
      case 'conversations':
        return <ConversationsDashboard />;
      case 'sellers':
        return <RealSellersPanel />;
      case 'metrics':
        return <MetricsPanel />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <SettingsPanel />;
      case 'health-check':
        return <PlatformHealthCheck />;
      default:
        return <ConversationsDashboard />;
    }
  };

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderPage()}
        </main>
        
        {/* Componentes globais */}
        <ToastContainer />
        <ConnectionStatus />
      </div>
    </NotificationProvider>
  );
};
