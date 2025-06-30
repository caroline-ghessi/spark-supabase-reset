
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { TemperatureBadges } from '@/components/ui/TemperatureBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboardData';
import { BarChart3, MessageCircle, Users, TrendingUp, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { 
    stats, 
    temperatureStats, 
    recentConversations, 
    topSellers, 
    loading, 
    refreshData 
  } = useDashboardData();

  const statsData = [
    {
      title: 'Conversas Ativas',
      value: stats.totalConversations,
      icon: MessageCircle,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      trend: { value: `${stats.botConversations} bot, ${stats.manualConversations} manual`, isPositive: true }
    },
    {
      title: 'Vendedores Ativos',
      value: stats.activeSellers,
      icon: Users,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      trend: { value: 'Todos online', isPositive: true }
    },
    {
      title: 'Taxa de Conversão',
      value: stats.conversionRate,
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      trend: { value: '+5% esta semana', isPositive: true }
    },
    {
      title: 'Score de Qualidade',
      value: stats.qualityScore,
      icon: BarChart3,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
      trend: { value: 'Média dos vendedores', isPositive: true }
    }
  ];

  const getTemperatureBadge = (temperature: 'hot' | 'warm' | 'cold') => {
    switch (temperature) {
      case 'hot':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2';
      case 'cold':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2';
    }
  };

  const getTemperatureEmoji = (temperature: 'hot' | 'warm' | 'cold') => {
    switch (temperature) {
      case 'hot':
        return '🔥 Quente';
      case 'warm':
        return '🟡 Morno';
      case 'cold':
        return '🔵 Frio';
      default:
        return '⚪ Neutro';
    }
  };

  const getSellerBgColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100';
      case 'blue':
        return 'bg-blue-100';
      case 'orange':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getSellerTextColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'blue':
        return 'text-blue-600';
      case 'orange':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="h-full w-full flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-400 animate-spin" />
              <p className="text-gray-600">Carregando dados do dashboard...</p>
            </div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* Header com Stats */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="p-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-sm text-gray-600">Visão geral da plataforma de gestão WhatsApp</p>
              </div>
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </Button>
            </div>

            <StatsGrid stats={statsData} />
            <TemperatureBadges data={temperatureStats} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-3">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
            <Card className="shadow-sm border-gray-100 flex flex-col">
              <CardHeader className="flex-shrink-0 pb-2">
                <CardTitle className="text-base">Conversas Recentes</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-0">
                <div className="space-y-3">
                  {recentConversations.length > 0 ? (
                    recentConversations.map((conversation) => (
                      <div key={conversation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate text-sm">{conversation.clientName}</p>
                          <p className="text-xs text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                        <span className={getTemperatureBadge(conversation.leadTemperature)}>
                          {getTemperatureEmoji(conversation.leadTemperature)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">Nenhuma conversa recente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100 flex flex-col">
              <CardHeader className="flex-shrink-0 pb-2">
                <CardTitle className="text-base">Performance dos Vendedores</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-0">
                <div className="space-y-3">
                  {topSellers.length > 0 ? (
                    topSellers.map((seller) => (
                      <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 ${getSellerBgColor(seller.color)} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className={`${getSellerTextColor(seller.color)} font-medium text-xs`}>
                              {seller.initials}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 truncate text-sm">{seller.name}</span>
                        </div>
                        <span className="text-green-600 font-bold flex-shrink-0 ml-2 text-sm">
                          {seller.score.toFixed(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">Nenhum vendedor encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
