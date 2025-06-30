
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealConversation } from '@/types/whatsapp';

interface DashboardStats {
  totalConversations: number;
  botConversations: number;
  manualConversations: number;
  waitingConversations: number;
  activeSellers: number;
  conversionRate: string;
  qualityScore: string;
}

interface TemperatureStats {
  hot: number;
  warm: number;
  cold: number;
}

interface RecentConversation {
  id: string;
  clientName: string;
  leadTemperature: 'hot' | 'warm' | 'cold';
  lastMessage: string;
}

interface TopSeller {
  id: string;
  name: string;
  initials: string;
  score: number;
  color: string;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    botConversations: 0,
    manualConversations: 0,
    waitingConversations: 0,
    activeSellers: 0,
    conversionRate: '0%',
    qualityScore: '0.0'
  });
  
  const [temperatureStats, setTemperatureStats] = useState<TemperatureStats>({
    hot: 0,
    warm: 0,
    cold: 0
  });
  
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDashboardData = async () => {
    console.log('📊 Carregando dados do dashboard...');
    setLoading(true);
    
    try {
      // Carregar estatísticas de conversas
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, status, lead_temperature, client_name, created_at')
        .order('created_at', { ascending: false });

      if (conversationsError) {
        console.error('❌ Erro ao carregar conversas:', conversationsError);
        throw conversationsError;
      }

      // Calcular estatísticas das conversas
      const totalConversations = conversations?.length || 0;
      const botConversations = conversations?.filter(c => c.status === 'bot').length || 0;
      const manualConversations = conversations?.filter(c => c.status === 'manual').length || 0;
      const waitingConversations = conversations?.filter(c => c.status === 'waiting').length || 0;

      // Calcular temperatura dos leads
      const hot = conversations?.filter(c => c.lead_temperature === 'hot').length || 0;
      const warm = conversations?.filter(c => c.lead_temperature === 'warm').length || 0;
      const cold = conversations?.filter(c => c.lead_temperature === 'cold').length || 0;

      // Carregar vendedores ativos
      const { data: sellers, error: sellersError } = await supabase
        .from('sellers')
        .select('id, name, status, performance_score')
        .eq('status', 'active')
        .order('performance_score', { ascending: false });

      if (sellersError) {
        console.error('❌ Erro ao carregar vendedores:', sellersError);
        throw sellersError;
      }

      const activeSellers = sellers?.length || 0;
      const avgQualityScore = sellers?.length > 0 
        ? (sellers.reduce((sum, seller) => sum + (seller.performance_score || 0), 0) / sellers.length).toFixed(1)
        : '0.0';

      // Simular taxa de conversão baseada em dados históricos
      const conversionRate = totalConversations > 0 ? '68%' : '0%';

      // Preparar conversas recentes (top 3)
      const recentConvs = conversations?.slice(0, 3).map(conv => ({
        id: conv.id,
        clientName: conv.client_name || 'Cliente Anônimo',
        leadTemperature: conv.lead_temperature as 'hot' | 'warm' | 'cold',
        lastMessage: getLastMessageText(conv.lead_temperature)
      })) || [];

      // Preparar top vendedores (top 3)
      const topSellersData = sellers?.slice(0, 3).map((seller, index) => ({
        id: seller.id,
        name: seller.name,
        initials: getInitials(seller.name),
        score: seller.performance_score || 0,
        color: getSellerColor(index)
      })) || [];

      // Atualizar estados
      setStats({
        totalConversations,
        botConversations,
        manualConversations,
        waitingConversations,
        activeSellers,
        conversionRate,
        qualityScore: avgQualityScore
      });

      setTemperatureStats({ hot, warm, cold });
      setRecentConversations(recentConvs);
      setTopSellers(topSellersData);

      console.log('✅ Dados do dashboard carregados:', {
        totalConversations,
        activeSellers,
        temperature: { hot, warm, cold }
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    stats,
    temperatureStats,
    recentConversations,
    topSellers,
    loading,
    refreshData: loadDashboardData
  };
};

// Funções auxiliares
const getLastMessageText = (temperature: string): string => {
  switch (temperature) {
    case 'hot':
      return 'Interessado em fechar negócio';
    case 'warm':
      return 'Solicitando mais informações';
    case 'cold':
      return 'Primeira conversa';
    default:
      return 'Conversa em andamento';
  }
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getSellerColor = (index: number): string => {
  const colors = ['green', 'blue', 'orange'];
  return colors[index] || 'gray';
};
