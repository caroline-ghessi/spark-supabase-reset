
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users, Target, Clock, Award } from 'lucide-react';
import { mockRankingVendedores } from '../../data/analyticsData';

const chartConfig = {
  conversoes: {
    label: "Conversões",
    color: "hsl(var(--chart-1))",
  },
  meta: {
    label: "Meta",
    color: "hsl(var(--chart-2))",
  },
};

export const SalesPerformance = () => {
  const [selectedVendedor, setSelectedVendedor] = useState<string | null>(null);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'subindo':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'descendo':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (posicao: number) => {
    if (posicao === 1) return 'bg-yellow-50 border-yellow-200';
    if (posicao <= 3) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Dados para gráfico comparativo
  const dadosComparativos = mockRankingVendedores.map(v => ({
    vendedor: v.vendedor.split(' ')[0],
    conversoes: v.conversoes,
    meta: v.meta,
    ticket: v.ticketMedio / 1000
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance de Vendedores</h2>
          <p className="text-gray-600">Ranking e métricas individuais da equipe de vendas</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">81</p>
            <p className="text-sm text-gray-600">Conversões Totais</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">77</p>
            <p className="text-sm text-gray-600">Meta Total</p>
          </div>
        </div>
      </div>

      {/* Gráfico Comparativo */}
      <Card>
        <CardHeader>
          <CardTitle>Conversões vs Meta</CardTitle>
          <CardDescription>Comparativo de performance da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={dadosComparativos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendedor" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="conversoes" fill="var(--color-conversoes)" name="Conversões" />
              <Bar dataKey="meta" fill="var(--color-meta)" name="Meta" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Ranking de Vendedores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {mockRankingVendedores.map((vendedor) => (
          <Card 
            key={vendedor.posicao} 
            className={`${getStatusColor(vendedor.posicao)} border-2 hover:shadow-lg transition-all cursor-pointer`}
            onClick={() => setSelectedVendedor(vendedor.vendedor)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    vendedor.posicao === 1 ? 'bg-yellow-500 text-white' :
                    vendedor.posicao <= 3 ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {vendedor.posicao}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{vendedor.vendedor}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(vendedor.trend)}
                      <span className="text-sm text-gray-600">Tendência</span>
                    </div>
                  </div>
                </div>
                {vendedor.posicao === 1 && <Award className="w-6 h-6 text-yellow-500" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Métricas Principais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{vendedor.conversoes}</p>
                  <p className="text-xs text-gray-600">Conversões</p>
                  <p className="text-xs text-gray-500">Meta: {vendedor.meta}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{vendedor.taxaConversao}%</p>
                  <p className="text-xs text-gray-600">Taxa Conversão</p>
                </div>
              </div>

              {/* Ticket Médio e Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(vendedor.ticketMedio)}</p>
                  <p className="text-xs text-gray-600">Ticket Médio</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{vendedor.scoreQualidade}</p>
                  <p className="text-xs text-gray-600">Score Qualidade</p>
                </div>
              </div>

              {/* Métricas Secundárias */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Clientes Ativos:</span>
                  <span className="font-medium">{vendedor.clientesAtivos}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tempo Médio:</span>
                  <span className="font-medium">{vendedor.tempoMedioFechamento}</span>
                </div>
              </div>

              {/* IA Recommendations */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Recomendações IA:</span>
                  <Badge variant={vendedor.recomendacoesIA.taxa_implementacao > 80 ? "default" : "secondary"}>
                    {vendedor.recomendacoesIA.taxa_implementacao}%
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {vendedor.recomendacoesIA.implementadas}/{vendedor.recomendacoesIA.recebidas} implementadas
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas Gerais da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Vendedores Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">78%</p>
                <p className="text-sm text-gray-600">Taxa Conversão Média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">6.0</p>
                <p className="text-sm text-gray-600">Dias Médio Fechamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">8.5</p>
                <p className="text-sm text-gray-600">Score Qualidade Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
