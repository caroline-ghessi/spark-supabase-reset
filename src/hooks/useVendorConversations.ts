
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
  avg_quality_score?: number;
}

interface VendorMessage {
  id: string;
  text_content: string;
  is_from_seller: boolean;
  sent_at: string;
  status: string;
  conversation_id: string;
}

export const useVendorConversations = (refreshKey?: number) => {
  const [conversations, setConversations] = useState<VendorConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('vendor_conversations_full')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (fetchError) {
        console.error('Erro ao carregar conversas de vendedores:', fetchError);
        setError('Erro ao carregar conversas');
        toast.error('Erro ao carregar conversas');
        return;
      }

      setConversations(data || []);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
      setError('Erro ao carregar conversas');
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const refetch = loadConversations;

  useEffect(() => {
    loadConversations();
  }, [refreshKey]);

  return {
    conversations,
    loading,
    error,
    refetch
  };
};
