
import { useEffect } from 'react';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useWhatsAppRealtime } from './useWhatsAppRealtime';

export const useWhatsAppIntegration = () => {
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

  // Set up real-time subscriptions
  useWhatsAppRealtime({
    setConversations,
    setMessages
  });

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  return {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl,
    loadConversations
  };
};

// Re-export types for backward compatibility
export type { RealConversation, RealMessage } from '@/types/whatsapp';
