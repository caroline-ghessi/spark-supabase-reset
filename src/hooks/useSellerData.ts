
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import type { SellerMetrics } from '@/types/auth';

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
      // Usar query customizada já que get_seller_metrics não está nos tipos
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('assigned_seller_id', user.seller_id);

      if (error) {
        console.error('Erro ao carregar métricas:', error);
        return;
      }

      // Calcular métricas manualmente
      const totalConversations = conversations?.length || 0;
      const soldConversations = conversations?.filter(c => c.status === 'sold').length || 0;
      const conversionRate = totalConversations > 0 ? (soldConversations / totalConversations) * 100 : 0;
      const salesToday = conversations?.filter(c => 
        c.status === 'sold' && 
        new Date(c.updated_at || '').toDateString() === new Date().toDateString()
      ).length || 0;
      const activeConversations = conversations?.filter(c => 
        ['bot', 'human', 'transferred'].includes(c.status)
      ).length || 0;

      setMetrics({
        totalConversations,
        conversionRate: Math.round(conversionRate * 100) / 100,
        salesToday,
        activeConversations
      });
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

    // Buscar mensagens usando a função RPC disponível
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
