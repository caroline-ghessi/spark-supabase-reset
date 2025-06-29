
import { useState, useCallback } from 'react';
import { RealMessage } from '@/types/whatsapp';

interface OptimisticMessage extends Omit<RealMessage, 'id'> {
  id: string;
  isOptimistic?: boolean;
}

export const useOptimisticMessages = (conversationId: string) => {
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);

  const addOptimisticMessage = useCallback((content: string) => {
    const tempMessage: OptimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_type: 'admin',
      sender_name: 'Operador',
      content,
      message_type: 'text',
      status: 'sending',
      metadata: {},
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    setOptimisticMessages(prev => [...prev, tempMessage]);
    return tempMessage.id;
  }, [conversationId]);

  const removeOptimisticMessage = useCallback((tempId: string) => {
    setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
  }, []);

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  return {
    optimisticMessages,
    addOptimisticMessage,
    removeOptimisticMessage,
    clearOptimisticMessages
  };
};
