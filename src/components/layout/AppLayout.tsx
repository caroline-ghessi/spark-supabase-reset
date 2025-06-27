
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ConversationList } from '../conversations/ConversationList';
import { ChatPanel } from '../chat/ChatPanel';
import { Conversation } from '../../types/conversation';
import { mockConversations, mockMessages } from '../../data/mockData';

export const AppLayout = () => {
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex">
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
    </div>
  );
};
