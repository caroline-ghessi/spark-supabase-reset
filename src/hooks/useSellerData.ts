
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface SellerMetrics {
  totalConversations: number;
  conversionRate: number;
  salesToday: number;
  activeConversations: number;
  spinScore?: number;
}

export function useSellerData() {
  const { user, isSeller, isAdmin, isSupervisor } = useAuth();
  const [metrics, setMetrics] = useState<SellerMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isSeller && user.seller_id) {
      loadSellerMetrics();
    }
  }, [user, isSeller]);

  const loadSellerMetrics = async () => {
    if (!user?.seller_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_seller_metrics', { seller_uuid: user.seller_id });

      if (error) {
        console.error('Erro ao carregar métricas:', error);
        return;
      }

      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar apenas conversas permitidas baseado no role
  const getConversations = async () => {
    let query = supabase.from('conversations').select(`
      *,
      sellers(name, phone)
    `);
    
    // Se for vendedor, filtrar apenas suas conversas
    if (isSeller && user?.seller_id) {
      query = query.eq('assigned_seller_id', user.seller_id);
    }
    
    // Admin e Supervisor veem tudo (sem filtro adicional)
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);
    
    return { data, error };
  };

  // Buscar mensagens apenas se tiver acesso à conversa
  const getMessages = async (conversationId: string) => {
    // Primeiro verificar se pode acessar a conversa
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('assigned_seller_id')
      .eq('id', conversationId)
      .single();

    if (convError) return { data: null, error: convError };

    // Se for vendedor, verificar se é sua conversa
    if (isSeller && user?.seller_id && conv.assigned_seller_id !== user.seller_id) {
      return { data: null, error: { message: 'Acesso negado a esta conversa' } };
    }

    // Buscar mensagens
    const { data, error } = await supabase
      .rpc('get_messages', { conv_id: conversationId });

    return { data, error };
  };

  // Buscar recomendações de IA
  const getAIRecommendations = async () => {
    let query = supabase
      .from('ai_recommendations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Vendedor vê apenas suas recomendações
    if (isSeller && user?.seller_id) {
      query = query.eq('seller_id', user.seller_id);
    }
    
    const { data, error } = await query;
    return { data, error };
  };

  return {
    metrics,
    loading,
    getConversations,
    getMessages,
    getAIRecommendations,
    loadSellerMetrics,
    // Permissões baseadas no role
    canTransferConversations: !isSeller, // Apenas admin/supervisor
    canViewAllSellers: isAdmin,
    canEditSettings: isAdmin,
    canManageUsers: isAdmin,
    canAccessAudit: isAdmin,
    canManageLibrary: isAdmin || isSupervisor,
    canViewLibrary: true, // Todos podem ver biblioteca
    canAssumeControl: !isSeller, // Apenas admin/supervisor
    canMonitorConversations: !isSeller
  };
}
