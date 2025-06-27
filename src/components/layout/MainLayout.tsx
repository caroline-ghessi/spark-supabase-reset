
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConversationsDashboard } from '../conversations/ConversationsDashboard';
import { SellersPanel } from '../monitoring/MonitoringPanel';
import { MetricsPage } from '../metrics/MetricsPanel';
import { NotificationsCenter } from '../notifications/NotificationCenter';
import { SettingsPage } from '../settings/SettingsPanel';
import { RealConversation } from '@/types/whatsapp';

export const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<RealConversation | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'conversations':
        return (
          <ConversationsDashboard 
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        );
      case 'sellers':
        return <SellersPanel />;
      case 'metrics':
        return <MetricsPage />;
      case 'notifications':
        return <NotificationsCenter />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <ConversationsDashboard 
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
};
