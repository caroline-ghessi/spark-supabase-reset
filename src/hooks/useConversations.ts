
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealConversation } from '@/types/whatsapp';

export const useConversations = () => {
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadConversations = async () => {
    console.log('📊 Carregando conversas...');
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .rpc('get_conversations');

      if (error) {
        console.error('❌ Erro ao carregar conversas:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Erro",
          description: `Falha ao carregar conversas: ${error.message}`,
          variant: "destructive",
        });
        setConversations([]);
        return;
      }

      console.log('✅ Conversas carregadas:', data?.length || 0);
      
      // Garantir que os dados estão no formato correto
      const formattedConversations = (data || []).map((conv: any) => ({
        ...conv,
        potential_value: conv.potential_value ? Number(conv.potential_value) : null
      })) as RealConversation[];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('❌ Erro na busca de conversas:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar conversas - erro de conexão",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const takeControl = async (conversationId: string) => {
    console.log('🎯 Assumindo controle da conversa:', conversationId);
    
    try {
      const response = await supabase.functions.invoke('take-control', {
        body: {
          conversation_id: conversationId
        }
      });

      if (response.error) {
        console.error('❌ Erro na resposta:', response.error);
        throw new Error(response.error.message || 'Erro desconhecido');
      }

      console.log('✅ Controle assumido com sucesso');
      toast({
        title: "Controle Assumido",
        description: "Você assumiu o controle da conversa",
        className: "bg-orange-500 text-white",
      });

      // Recarregar conversas para atualizar status
      await loadConversations();

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao assumir controle:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao assumir controle",
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
