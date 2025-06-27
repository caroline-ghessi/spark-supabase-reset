
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealMessage } from '@/types/whatsapp';

export const useMessages = () => {
  const [messages, setMessages] = useState<Record<string, RealMessage[]>>({});
  const { toast } = useToast();

  const loadMessages = async (conversationId: string) => {
    console.log(`📨 Carregando mensagens para conversa: ${conversationId}`);
    
    try {
      const { data, error } = await supabase
        .rpc('get_messages', { conv_id: conversationId });

      if (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar mensagens",
          variant: "destructive",
        });
      } else {
        console.log(`✅ Mensagens carregadas para ${conversationId}:`, data?.length || 0);
        setMessages(prev => ({
          ...prev,
          [conversationId]: (data || []) as RealMessage[]
        }));
      }
    } catch (error) {
      console.error('❌ Erro na busca de mensagens:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mensagens",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    console.log(`📤 Enviando mensagem para conversa: ${conversationId}`);
    
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

      console.log('✅ Mensagem enviada com sucesso');
      toast({
        title: "Mensagem Enviada",
        description: "Mensagem enviada com sucesso!",
        className: "bg-green-500 text-white",
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
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
