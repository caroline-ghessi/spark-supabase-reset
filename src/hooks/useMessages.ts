
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
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Erro",
          description: `Falha ao carregar mensagens: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ Mensagens carregadas para ${conversationId}:`, data?.length || 0);
      
      // Garantir que os dados estão no formato correto
      const formattedMessages = (data || []).map((msg: any) => ({
        ...msg,
        file_size: msg.file_size ? Number(msg.file_size) : null
      })) as RealMessage[];

      setMessages(prev => ({
        ...prev,
        [conversationId]: formattedMessages
      }));
    } catch (error) {
      console.error('❌ Erro na busca de mensagens:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mensagens - erro de conexão",
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
        console.error('❌ Erro na resposta:', response.error);
        throw new Error(response.error.message || 'Erro desconhecido');
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
        description: error instanceof Error ? error.message : "Falha ao enviar mensagem",
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
