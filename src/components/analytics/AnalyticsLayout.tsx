
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { SalesPerformance } from './SalesPerformance';
import { FunnelAnalysis } from './FunnelAnalysis';
import { AIEffectiveness } from './AIEffectiveness';
import { FinancialReports } from './FinancialReports';
import { BarChart3, Users, TrendingUp, Bot, DollarSign, Download, Filter, Calendar } from 'lucide-react';

export const AnalyticsLayout = () => {
  const [activeTab, setActiveTab] = useState('executive');

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Central de Analytics</h1>
            <p className="text-gray-600">Relatórios avançados e insights de negócio</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Últimos 30 dias
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="default" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Vendedores</span>
            </TabsTrigger>
            <TabsTrigger value="funnel" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Funil</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>IA</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Financeiro</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <ExecutiveDashboard />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <SalesPerformance />
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            <FunnelAnalysis />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIEffectiveness />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
