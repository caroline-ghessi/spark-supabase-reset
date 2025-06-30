
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorMessage {
  id: string;
  whapi_message_id: string;
  seller_id: string;
  conversation_id: string;
  from_number: string;
  to_number: string;
  is_from_seller: boolean;
  client_phone: string;
  message_type: string;
  text_content?: string;
  caption?: string;
  media_url?: string;
  media_mime_type?: string;
  media_size?: number;
  quality_score?: number;
  spin_analysis: any;
  flagged_for_review: boolean;
  review_notes?: string;
  status: string;
  sent_at: string;
  created_at: string;
}

export interface VendorConversation {
  conversation_id: string;
  client_phone: string;
  client_name?: string;
  conversation_status: string;
  lead_temperature: string;
  seller_id: string;
  seller_name: string;
  whapi_status?: string;
  total_messages: number;
  seller_messages: number;
  client_messages: number;
  avg_quality_score?: number;
  flagged_count: number;
  first_message_at?: string;
  last_message_at?: string;
  last_message_text?: string;
  created_at: string;
  updated_at: string;
}

interface VendorMessagesFilters {
  seller_id?: string;
  flagged_only?: boolean;
  date_from?: string;
  search?: string;
}

export const useVendorMessages = () => {
  const [conversations, setConversations] = useState<VendorConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, VendorMessage[]>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadConversations = useCallback(async (filters: VendorMessagesFilters = {}) => {
    console.log('🔍 Carregando conversas de vendedores com filtros:', filters);
    setLoading(true);
    
    try {
      let query = supabase
        .from('vendor_conversations_full')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      // Aplicar filtros
      if (filters.seller_id) {
        query = query.eq('seller_id', filters.seller_id);
      }

      if (filters.flagged_only) {
        query = query.gt('flagged_count', 0);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao carregar conversas de vendedores:', error);
        toast({
          title: "Erro",
          description: `Falha ao carregar conversas: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Conversas de vendedores carregadas:', data?.length || 0);
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
  }, [toast]);

  const loadMessages = useCallback(async (conversationId: string) => {
    console.log(`📨 Carregando mensagens de vendedor para conversa: ${conversationId}`);
    
    try {
      const { data, error } = await supabase
        .from('vendor_whatsapp_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar mensagens do vendedor:', error);
        toast({
          title: "Erro",
          description: `Falha ao carregar mensagens: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ Mensagens do vendedor carregadas para ${conversationId}:`, data?.length || 0);
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));
    } catch (error) {
      console.error('❌ Erro na busca de mensagens do vendedor:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mensagens - erro de conexão",
        variant: "destructive",
      });
    }
  }, [toast]);

  const flagMessage = useCallback(async (messageId: string, notes?: string) => {
    console.log(`🚩 Sinalizando mensagem: ${messageId}`);
    
    try {
      const { error } = await supabase
        .from('vendor_whatsapp_messages')
        .update({
          flagged_for_review: true,
          review_notes: notes,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erro ao sinalizar mensagem:', error);
        toast({
          title: "Erro",
          description: `Falha ao sinalizar mensagem: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Mensagem sinalizada com sucesso');
      toast({
        title: "Mensagem Sinalizada",
        description: "Mensagem marcada para revisão",
        className: "bg-orange-500 text-white",
      });

      // Atualizar estado local
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg =>
            msg.id === messageId
              ? { ...msg, flagged_for_review: true, review_notes: notes }
              : msg
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('❌ Erro ao sinalizar mensagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao sinalizar mensagem - erro de conexão",
        variant: "destructive",
      });
    }
  }, [toast]);

  const unflagMessage = useCallback(async (messageId: string) => {
    console.log(`✅ Removendo sinalização da mensagem: ${messageId}`);
    
    try {
      const { error } = await supabase
        .from('vendor_whatsapp_messages')
        .update({
          flagged_for_review: false,
          review_notes: null,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erro ao remover sinalização:', error);
        toast({
          title: "Erro",
          description: `Falha ao remover sinalização: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Sinalização removida com sucesso');
      toast({
        title: "Sinalização Removida",
        description: "Mensagem marcada como OK",
        className: "bg-green-500 text-white",
      });

      // Atualizar estado local
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg =>
            msg.id === messageId
              ? { ...msg, flagged_for_review: false, review_notes: undefined }
              : msg
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('❌ Erro ao remover sinalização:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover sinalização - erro de conexão",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    conversations,
    messages,
    loading,
    loadConversations,
    loadMessages,
    flagMessage,
    unflagMessage
  };
};
