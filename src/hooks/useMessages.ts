
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealMessage } from '@/types/whatsapp';

export const useMessages = () => {
  const [messages, setMessages] = useState<Record<string, RealMessage[]>>({});
  const { toast } = useToast();

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_messages', { conv_id: conversationId });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(prev => ({
          ...prev,
          [conversationId]: (data || []) as RealMessage[]
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mensagens",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    try {
      const response = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          conversation_id: conversationId,
          message: message
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Mensagem Enviada",
        description: "Mensagem enviada com sucesso!",
        className: "bg-green-500 text-white",
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    messages,
    setMessages,
    loadMessages,
    sendMessage
  };
};
