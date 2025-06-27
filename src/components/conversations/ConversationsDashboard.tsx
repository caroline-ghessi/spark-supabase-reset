
import React, { useState } from 'react';
import { ConversationsList } from './ConversationsList';
import { ChatInterface } from './ChatInterface';
import { EmptyState } from '../ui/EmptyState';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { RealConversation } from '@/types/whatsapp';

interface ConversationsDashboardProps {
  selectedConversation: RealConversation | null;
  onSelectConversation: (conversation: RealConversation) => void;
}

export const ConversationsDashboard: React.FC<ConversationsDashboardProps> = ({
  selectedConversation,
  onSelectConversation
}) => {
  const {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl
  } = useWhatsAppIntegration();

  const handleSelectConversation = async (conversation: RealConversation) => {
    onSelectConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return;
    await sendMessage(selectedConversation.id, message);
  };

  const handleTakeControl = async () => {
    if (!selectedConversation) return;
    await takeControl(selectedConversation.id);
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Lista de Conversas */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <ConversationsList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          loading={loading}
        />
      </div>
      
      {/* Interface de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface 
            conversation={selectedConversation}
            messages={messages[selectedConversation.id] || []}
            onSendMessage={handleSendMessage}
            onTakeControl={handleTakeControl}
          />
        ) : (
          <EmptyState message="Selecione uma conversa para começar" />
        )}
      </div>
    </div>
  );
};
