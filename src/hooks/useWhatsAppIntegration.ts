
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useWhatsAppRealtime } from './useWhatsAppRealtime';
import { RealConversation } from '@/types/whatsapp';

export const useWhatsAppIntegration = (selectedConversation?: RealConversation | null) => {
  const [localSelectedConversation, setLocalSelectedConversation] = useState<RealConversation | null>(selectedConversation || null);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  const {
    conversations,
    setConversations,
    loading,
    loadConversations: originalLoadConversations,
    takeControl
  } = useConversations();

  const {
    messages,
    setMessages,
    loadMessages,
    sendMessage
  } = useMessages();

  // Memoizar função de carregamento para evitar re-renders
  const loadConversations = useCallback(async () => {
    if (!conversationsLoaded) {
      console.log('🔄 Carregando conversas (primeira vez)...');
      await originalLoadConversations();
      setConversationsLoaded(true);
    }
  }, [originalLoadConversations, conversationsLoaded]);

  // Memoizar callback de atualização de conversa
  const onConversationUpdate = useCallback((updatedConversation: RealConversation) => {
    if (localSelectedConversation && updatedConversation.id === localSelectedConversation.id) {
      console.log('🔄 Atualizando conversa selecionada:', updatedConversation.status);
      setLocalSelectedConversation(updatedConversation);
    }
  }, [localSelectedConversation]);

  // Set up real-time subscriptions com callbacks memoizados
  useWhatsAppRealtime({
    setConversations,
    setMessages,
    selectedConversation: localSelectedConversation,
    onConversationUpdate
  });

  // Load conversations apenas uma vez no mount
  useEffect(() => {
    if (!conversationsLoaded) {
      loadConversations();
    }
  }, [loadConversations, conversationsLoaded]);

  // Sync with external selectedConversation prop
  useEffect(() => {
    if (selectedConversation && (!localSelectedConversation || selectedConversation.id !== localSelectedConversation.id)) {
      setLocalSelectedConversation(selectedConversation);
    }
  }, [selectedConversation, localSelectedConversation]);

  // Enhanced takeControl function que usa useCallback
  const takeControlWithSync = useCallback(async (conversationId: string) => {
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
      
      // Recarregar conversas apenas se necessário
      setConversationsLoaded(false);
      
    } catch (error) {
      console.error('❌ Erro ao assumir controle:', error);
      throw error;
    }
  }, [takeControl, localSelectedConversation]);

  // Memoizar valores de retorno para evitar re-renders desnecessários
  const returnValue = useMemo(() => ({
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl: takeControlWithSync,
    loadConversations,
    selectedConversation: localSelectedConversation,
    setSelectedConversation: setLocalSelectedConversation
  }), [
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControlWithSync,
    loadConversations,
    localSelectedConversation
  ]);

  return returnValue;
};

// Re-export types for backward compatibility
export type { RealConversation, RealMessage } from '@/types/whatsapp';
