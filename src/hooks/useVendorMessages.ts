
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorMessage {
  id: string;
  whapi_message_id: string;
  seller_id: string;
  conversation_id: string | null;
  from_number: string;
  to_number: string;
  is_from_seller: boolean;
  client_phone: string;
  message_type: string;
  text_content: string | null;
  caption: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  media_size: number | null;
  media_duration: number | null;
  thumbnail_url: string | null;
  quoted_message_id: string | null;
  forwarded: boolean;
  whatsapp_context: any;
  status: string;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  quality_score: number | null;
  spin_analysis: any;
  flagged_for_review: boolean;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorConversation {
  conversation_id: string;
  client_phone: string;
  client_name: string | null;
  conversation_status: string;
  lead_temperature: string;
  seller_id: string;
  seller_name: string;
  whapi_status: string | null;
  total_messages: number;
  seller_messages: number;
  client_messages: number;
  avg_quality_score: number | null;
  flagged_count: number;
  first_message_at: string | null;
  last_message_at: string | null;
  last_message_text: string | null;
  created_at: string;
  updated_at: string;
}

export const useVendorMessages = () => {
  const [conversations, setConversations] = useState<VendorConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, VendorMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadConversations = async (filters: any = {}) => {
    console.log('📊 Carregando conversas dos vendedores...');
    setLoading(true);
    
    try {
      let query = supabase
        .from('vendor_conversations_full')
        .select('*')
        .order('last_message_at', { ascending: false });

      // Aplicar filtros
      if (filters.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
      }

      if (filters.flagged_only) {
        query = query.gt('flagged_count', 0);
      }

      if (filters.date_from) {
        query = query.gte('last_message_at', filters.date_from);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao carregar conversas:', error);
        toast({
          title: "Erro",
          description: `Falha ao carregar conversas: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ Conversas carregadas: ${data?.length || 0}`);
      setConversations(data || []);
      
    } catch (error) {
      console.error('❌ Erro na busca de conversas:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar conversas - erro de conexão",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    console.log(`📨 Carregando mensagens para conversa: ${conversationId}`);
    
    try {
      const { data, error } = await supabase
        .from('vendor_whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
        toast({
          title: "Erro",
          description: `Falha ao carregar mensagens: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ Mensagens carregadas para ${conversationId}: ${data?.length || 0}`);
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
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

  const flagMessage = async (messageId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('vendor_whatsapp_messages')
        .update({
          flagged_for_review: true,
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Mensagem Sinalizada",
        description: "Mensagem marcada para revisão",
        className: "bg-orange-500 text-white",
      });

      // Recarregar mensagens
      const message = Object.values(messages).flat().find(m => m.id === messageId);
      if (message?.conversation_id) {
        loadMessages(message.conversation_id);
      }

    } catch (error) {
      console.error('❌ Erro ao sinalizar mensagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao sinalizar mensagem",
        variant: "destructive",
      });
    }
  };

  const unflagMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_whatsapp_messages')
        .update({
          flagged_for_review: false,
          review_notes: null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Flag Removida",
        description: "Mensagem removida da revisão",
        className: "bg-green-500 text-white",
      });

      // Recarregar mensagens
      const message = Object.values(messages).flat().find(m => m.id === messageId);
      if (message?.conversation_id) {
        loadMessages(message.conversation_id);
      }

    } catch (error) {
      console.error('❌ Erro ao remover flag:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover flag da mensagem",
        variant: "destructive",
      });
    }
  };

  const sendMessageToSeller = async (sellerId: string, toNumber: string, message: string) => {
    try {
      const response = await supabase.functions.invoke('whapi-send-message', {
        body: {
          seller_id: sellerId,
          to_number: toNumber,
          message: message
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro desconhecido');
      }

      toast({
        title: "Mensagem Enviada",
        description: "Mensagem enviada via Whapi",
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

  const transferToSeller = async (conversationId: string, sellerId: string, note?: string) => {
    try {
      const response = await supabase.functions.invoke('transfer-to-seller', {
        body: {
          conversation_id: conversationId,
          seller_id: sellerId,
          transfer_note: note
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro desconhecido');
      }

      toast({
        title: "Conversa Transferida",
        description: `Conversa transferida para ${response.data.seller_name}`,
        className: "bg-green-500 text-white",
      });

      // Recarregar conversas
      loadConversations();

      return response.data;

    } catch (error) {
      console.error('❌ Erro ao transferir conversa:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao transferir conversa",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    console.log('🔌 Configurando real-time para mensagens dos vendedores...');

    const messagesSubscription = supabase
      .channel('vendor-messages-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vendor_whatsapp_messages'
      }, (payload) => {
        console.log('🔄 Mudança em vendor_whatsapp_messages:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as VendorMessage;
          setMessages(prev => {
            const conversationMessages = prev[newMessage.conversation_id!] || [];
            return {
              ...prev,
              [newMessage.conversation_id!]: [...conversationMessages, newMessage]
            };
          });

          toast({
            title: "Nova Mensagem",
            description: `${newMessage.is_from_seller ? 'Vendedor' : 'Cliente'}: ${newMessage.text_content?.substring(0, 50) || '[Mídia]'}`,
            className: "bg-blue-500 text-white",
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new as VendorMessage;
          setMessages(prev => ({
            ...prev,
            [updatedMessage.conversation_id!]: (prev[updatedMessage.conversation_id!] || [])
              .map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          }));
        }
      })
      .subscribe();

    return () => {
      console.log('🔌 Removendo real-time subscriptions...');
      supabase.removeChannel(messagesSubscription);
    };
  }, [toast]);

  return {
    conversations,
    messages,
    loading,
    loadConversations,
    loadMessages,
    flagMessage,
    unflagMessage,
    sendMessageToSeller,
    transferToSeller
  };
};
