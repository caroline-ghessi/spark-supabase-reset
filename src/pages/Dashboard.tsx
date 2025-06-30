
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
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral da plataforma de gestão WhatsApp</p>
        </div>

        <StatsGrid stats={statsData} />

        <TemperatureBadges data={temperatureData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Conversas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Cliente João Silva</p>
                    <p className="text-sm text-gray-600">Interessado em produto X</p>
                  </div>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">🔥 Quente</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Cliente Maria Santos</p>
                    <p className="text-sm text-gray-600">Solicitando orçamento</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">🟡 Morno</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Cliente Pedro Costa</p>
                    <p className="text-sm text-gray-600">Primeira conversa</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">🔵 Frio</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Performance dos Vendedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">AS</span>
                    </div>
                    <span className="font-medium text-gray-900">Antonio Santos</span>
                  </div>
                  <span className="text-green-600 font-bold">9.2</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">MS</span>
                    </div>
                    <span className="font-medium text-gray-900">Maria Silva</span>
                  </div>
                  <span className="text-green-600 font-bold">8.8</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-medium">CO</span>
                    </div>
                    <span className="font-medium text-gray-900">Carlos Oliveira</span>
                  </div>
                  <span className="text-yellow-600 font-bold">7.5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  );
}
