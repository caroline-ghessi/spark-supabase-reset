
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealConversation } from '@/types/whatsapp';

export const useConversations = () => {
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_conversations');

      if (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
      } else {
        setConversations((data || []) as RealConversation[]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar conversas",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const takeControl = async (conversationId: string) => {
    try {
      const response = await supabase.functions.invoke('take-control', {
        body: {
          conversation_id: conversationId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Controle Assumido",
        description: "Você assumiu o controle da conversa",
        className: "bg-orange-500 text-white",
      });

      return response.data;
    } catch (error) {
      console.error('Error taking control:', error);
      toast({
        title: "Erro",
        description: "Falha ao assumir controle",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    conversations,
    setConversations,
    loading,
    loadConversations,
    takeControl
  };
};
