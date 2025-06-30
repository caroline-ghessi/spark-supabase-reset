
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
      // Primeiro, verificar se o usuário atual tem permissões
      const { data: userInfo, error: userError } = await supabase
        .rpc('get_current_user_info');

      if (userError) {
        console.error('❌ Erro ao verificar usuário:', userError);
      } else {
        console.log('👤 Usuário atual:', userInfo);
      }

      // Tentar carregar conversas usando a função RPC corrigida
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

        // Se for erro de recursão, sugerir recarregar a página
        if (error.message?.includes('infinite recursion')) {
          toast({
            title: "Erro de Autenticação",
            description: "Detectado problema de recursão. Tente recarregar a página.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: `Falha ao carregar conversas: ${error.message}`,
            variant: "destructive",
          });
        }
        
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

      // Toast de sucesso apenas se houver conversas
      if (formattedConversations.length > 0) {
        toast({
          title: "Conversas Carregadas",
          description: `${formattedConversations.length} conversas encontradas`,
          className: "bg-green-500 text-white",
        });
      }

    } catch (error) {
      console.error('❌ Erro crítico na busca de conversas:', error);
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
