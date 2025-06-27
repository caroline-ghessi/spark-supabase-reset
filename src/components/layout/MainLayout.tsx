
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConversationsDashboard } from '../conversations/ConversationsDashboard';
import { MonitoringPanel } from '../monitoring/MonitoringPanel';
import { MetricsPanel } from '../metrics/MetricsPanel';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { SettingsPanel } from '../settings/SettingsPanel';
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
        return <MonitoringPanel />;
      case 'metrics':
        return <MetricsPanel />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <SettingsPanel />;
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
