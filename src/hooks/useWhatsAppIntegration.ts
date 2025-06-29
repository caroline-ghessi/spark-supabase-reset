
import { useEffect, useState } from 'react';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useWhatsAppRealtime } from './useWhatsAppRealtime';
import { RealConversation } from '@/types/whatsapp';

export const useWhatsAppIntegration = (selectedConversation?: RealConversation | null) => {
  const [localSelectedConversation, setLocalSelectedConversation] = useState<RealConversation | null>(selectedConversation || null);

  const {
    conversations,
    setConversations,
    loading,
    loadConversations,
    takeControl
  } = useConversations();

  const {
    messages,
    setMessages,
    loadMessages,
    sendMessage
  } = useMessages();

  // Set up real-time subscriptions with callback to update selected conversation
  useWhatsAppRealtime({
    setConversations,
    setMessages,
    selectedConversation: localSelectedConversation,
    onConversationUpdate: (updatedConversation: RealConversation) => {
      // Se a conversa atualizada é a que está selecionada, atualizar o estado local
      if (localSelectedConversation && updatedConversation.id === localSelectedConversation.id) {
        console.log('🔄 Atualizando conversa selecionada:', updatedConversation.status);
        setLocalSelectedConversation(updatedConversation);
      }
    }
  });

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Sync with external selectedConversation prop
  useEffect(() => {
    if (selectedConversation && (!localSelectedConversation || selectedConversation.id !== localSelectedConversation.id)) {
      setLocalSelectedConversation(selectedConversation);
    }
  }, [selectedConversation]);

  // Enhanced takeControl function that updates local state immediately
  const takeControlWithSync = async (conversationId: string) => {
    console.log('🎯 Assumindo controle com sincronização local:', conversationId);
    
    try {
      await takeControl(conversationId);
      
      // Atualizar imediatamente o estado local da conversa selecionada
      if (localSelectedConversation && localSelectedConversation.id === conversationId) {
        const updatedConversation = {
          ...localSelectedConversation,
          status: 'manual' as const
        };
        console.log('✅ Atualizando estado local imediatamente:', updatedConversation.status);
        setLocalSelectedConversation(updatedConversation);
      }
      
      // Recarregar conversas para garantir sincronização
      await loadConversations();
      
    } catch (error) {
      console.error('❌ Erro ao assumir controle:', error);
      throw error;
    }
  };

  return {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl: takeControlWithSync,
    loadConversations,
    selectedConversation: localSelectedConversation,
    setSelectedConversation: setLocalSelectedConversation
  };
};

// Re-export types for backward compatibility
export type { RealConversation, RealMessage } from '@/types/whatsapp';
