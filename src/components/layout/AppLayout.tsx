
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConversationList } from '../conversations/ConversationList';
import { ChatPanel } from '../chat/ChatPanel';
import { MonitoringPanel } from '../monitoring/MonitoringPanel';
import { MetricsPanel } from '../metrics/MetricsPanel';
import { Conversation } from '../../types/conversation';
import { mockConversations, mockMessages } from '../../data/mockData';

export const AppLayout = () => {
  const [activeMenu, setActiveMenu] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState(mockConversations);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsChatPanelOpen(true);
  };

  const handleStatusChange = (conversationId: number, newStatus: Conversation['status']) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, status: newStatus }
          : conv
      )
    );
  };

  const renderMainContent = () => {
    switch (activeMenu) {
      case 'salespeople':
        return <MonitoringPanel />;
      case 'metrics':
        return <MetricsPanel />;
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-2">Configurações do sistema em desenvolvimento...</p>
          </div>
        );
      default:
        return (
          <div className="flex h-full">
            {/* Conversation List */}
            <div className="w-full lg:w-2/3 border-r border-gray-200">
              <ConversationList 
                conversations={conversations}
                onConversationSelect={handleConversationSelect}
                selectedConversation={selectedConversation}
              />
            </div>
            
            {/* Chat Panel */}
            <div className={`${isChatPanelOpen ? 'block' : 'hidden'} lg:block w-full lg:w-1/3 bg-white`}>
              <ChatPanel 
                conversation={selectedConversation}
                messages={selectedConversation ? mockMessages[selectedConversation.id] || [] : []}
                onStatusChange={handleStatusChange}
                onClose={() => setIsChatPanelOpen(false)}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onMenuChange={setActiveMenu} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
};
