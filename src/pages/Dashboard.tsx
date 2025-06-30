
import React from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { TemperatureBadges } from '@/components/ui/TemperatureBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MessageCircle, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const statsData = [
    {
      title: 'Conversas Ativas',
      value: 24,
      icon: MessageCircle,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      trend: { value: '+12% em relação ao mês anterior', isPositive: true }
    },
    {
      title: 'Vendedores Ativos',
      value: 8,
      icon: Users,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      trend: { value: 'Todos online', isPositive: true }
    },
    {
      title: 'Taxa de Conversão',
      value: '68%',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      trend: { value: '+5% esta semana', isPositive: true }
    },
    {
      title: 'Score de Qualidade',
      value: '8.5',
      icon: BarChart3,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
      trend: { value: 'Média dos vendedores', isPositive: true }
    }
  ];

  const temperatureData = {
    hot: 5,
    warm: 12,
    cold: 7
  };

  return (
    <ModernLayout>
      <div className="h-full w-full flex flex-col overflow-hidden">
        {/* Header com Stats */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="p-3">
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-gray-900 mb-1">Dashboard</h1>
              <p className="text-sm text-gray-600">Visão geral da plataforma de gestão WhatsApp</p>
            </div>

            <StatsGrid stats={statsData} />
            <TemperatureBadges data={temperatureData} />
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate text-sm">Cliente João Silva</p>
                      <p className="text-xs text-gray-600 truncate">Interessado em produto X</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2">🔥 Quente</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate text-sm">Cliente Maria Santos</p>
                      <p className="text-xs text-gray-600 truncate">Solicitando orçamento</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2">🟡 Morno</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate text-sm">Cliente Pedro Costa</p>
                      <p className="text-xs text-gray-600 truncate">Primeira conversa</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2">🔵 Frio</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100 flex flex-col">
              <CardHeader className="flex-shrink-0 pb-2">
                <CardTitle className="text-base">Performance dos Vendedores</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-medium text-xs">AS</span>
                      </div>
                      <span className="font-medium text-gray-900 truncate text-sm">Antonio Santos</span>
                    </div>
                    <span className="text-green-600 font-bold flex-shrink-0 ml-2 text-sm">9.2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-medium text-xs">MS</span>
                      </div>
                      <span className="font-medium text-gray-900 truncate text-sm">Maria Silva</span>
                    </div>
                    <span className="text-green-600 font-bold flex-shrink-0 ml-2 text-sm">8.8</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-medium text-xs">CO</span>
                      </div>
                      <span className="font-medium text-gray-900 truncate text-sm">Carlos Oliveira</span>
                    </div>
                    <span className="text-yellow-600 font-bold flex-shrink-0 ml-2 text-sm">7.5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
