
import React, { useState } from 'react';
import { ConversationsList } from './ConversationsList';
import { ChatInterface } from './ChatInterface';
import { EmptyState } from '../ui/EmptyState';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { RealConversation } from '@/types/whatsapp';

export const ConversationsDashboard: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl,
    selectedConversation,
    setSelectedConversation
  } = useWhatsAppIntegration();

  // Encontrar a conversa selecionada na lista atual
  const currentSelectedConversation = selectedConversationId 
    ? conversations.find(conv => conv.id === selectedConversationId) || null
    : null;

  const handleSelectConversation = async (conversation: RealConversation) => {
    console.log('📱 Selecionando conversa:', conversation.id, 'Status:', conversation.status);
    setSelectedConversationId(conversation.id);
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async (message: string) => {
    if (!currentSelectedConversation) return;
    await sendMessage(currentSelectedConversation.id, message);
  };

  const handleTakeControl = async () => {
    if (!currentSelectedConversation) return;
    await takeControl(currentSelectedConversation.id);
  };

  // Usar a conversa mais atualizada (do real-time) ou a selecionada localmente
  const conversationToDisplay = selectedConversation || currentSelectedConversation;

  return (
    <div className="flex-1 flex h-full">
      {/* Lista de Conversas */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <ConversationsList
          conversations={conversations}
          selectedConversation={conversationToDisplay}
          onSelectConversation={handleSelectConversation}
          loading={loading}
        />
      </div>
      
      {/* Interface de Chat */}
      <div className="flex-1 flex flex-col">
        {conversationToDisplay ? (
          <ChatInterface 
            conversation={conversationToDisplay}
            messages={messages[conversationToDisplay.id] || []}
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
