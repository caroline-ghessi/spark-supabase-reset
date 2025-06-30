
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VendorConversation {
  conversation_id: string;
  client_phone: string;
  client_name: string | null;
  seller_name: string;
  seller_id: string;
  conversation_status: string;
  last_message_at: string;
  last_message_text: string | null;
  total_messages: number;
  seller_messages: number;
  client_messages: number;
  whapi_status: string;
}

interface VendorMessage {
  id: string;
  text_content: string;
  is_from_seller: boolean;
  sent_at: string;
  status: string;
  conversation_id: string;
}

export const useVendorConversations = () => {
  const [conversations, setConversations] = useState<VendorConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, VendorMessage[]>>({});
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendor_conversations_full')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar conversas de vendedores:', error);
        toast.error('Erro ao carregar conversas');
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast.error('Erro ao carregar mensagens');
        return;
      }

      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const sendMessage = async (conversationId: string, sellerId: string, clientPhone: string, message: string) => {
    try {
      console.log('🚀 Enviando mensagem via Whapi:', {
        conversationId,
        sellerId,
        clientPhone,
        message: message.substring(0, 50) + '...'
      });

      const { data, error } = await supabase.functions.invoke('whapi-send-message', {
        body: {
          seller_id: sellerId,
          to_number: clientPhone,
          message: message,
          message_type: 'text'
        }
      });

      if (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        throw new Error(error.message || 'Erro ao enviar mensagem');
      }

      console.log('✅ Mensagem enviada com sucesso:', data);
      
      // Recarregar mensagens após envio
      await loadMessages(conversationId);
      
      return data;
    } catch (error) {
      console.error('❌ Erro no envio da mensagem:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return {
    conversations,
    messages,
    loading,
    loadConversations,
    loadMessages,
    sendMessage
  };
};
