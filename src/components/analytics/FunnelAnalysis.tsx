
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, TrendingDown, Users, MessageCircle, FileText, CheckCircle } from 'lucide-react';
import { mockFunnelEtapas, mockGargalos } from '../../data/analyticsData';

const chartConfig = {
  quantidade: {
    label: "Quantidade",
    color: "hsl(var(--chart-1))",
  },
  percentual: {
    label: "Percentual",
    color: "hsl(var(--chart-2))",
  },
};

const iconMap = {
  'Mensagens Recebidas': MessageCircle,
  'Classificadas pela IA': Users,
  'Atendidas por Vendedor': Users,
  'Propostas Enviadas': FileText,
  'Vendas Fechadas': CheckCircle,
};

const colorMap = {
  azul: 'bg-blue-500',
  roxo: 'bg-purple-500',
  laranja: 'bg-orange-500',
  amarelo: 'bg-yellow-500',
  verde: 'bg-green-500',
};

export const FunnelAnalysis = () => {
  // Calcular taxa de conversão entre etapas
  const conversaoEtapas = mockFunnelEtapas.map((etapa, index) => {
    if (index === 0) return { ...etapa, conversao: 100 };
    const anterior = mockFunnelEtapas[index - 1];
    const conversao = (etapa.quantidade / anterior.quantidade) * 100;
    return { ...etapa, conversao };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Análise do Funil de Conversão</h2>
        <p className="text-gray-600">Identificação de gargalos e oportunidades de otimização</p>
      </div>

      {/* Funil Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão Completo</CardTitle>
          <CardDescription>Últimos 30 dias - Fluxo completo do lead à venda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockFunnelEtapas.map((etapa, index) => {
              const Icon = iconMap[etapa.nome as keyof typeof iconMap] || Users;
              const colorClass = colorMap[etapa.cor as keyof typeof colorMap];
              const anterior = index > 0 ? mockFunnelEtapas[index - 1] : null;
              const perda = anterior ? anterior.quantidade - etapa.quantidade : 0;
              const percentualPerda = anterior ? ((perda / anterior.quantidade) * 100) : 0;
              
              return (
                <div key={etapa.nome} className="relative">
                  {/* Etapa do Funil */}
                  <div className="flex items-center space-x-4 p-4 bg-white border rounded-lg">
                    <div className={`p-3 rounded-full ${colorClass}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{etapa.nome}</h3>
                      <div className="flex items-center space-x-6 mt-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {etapa.quantidade.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-600">
                          {etapa.percentual.toFixed(1)}% do total
                        </span>
                        {anterior && (
                          <span className="text-sm text-gray-500">
                            {((etapa.quantidade / anterior.quantidade) * 100).toFixed(1)}% da etapa anterior
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de Perda */}
                  {perda > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          -{perda.toLocaleString()} ({percentualPerda.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão por Etapa</CardTitle>
          <CardDescription>Percentual de conversão entre etapas consecutivas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={conversaoEtapas.slice(1)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nome" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">Conversão: {data.conversao.toFixed(1)}%</p>
                        <p className="text-sm">Quantidade: {data.quantidade.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="conversao" 
                fill="var(--color-quantidade)" 
                name="Taxa de Conversão (%)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Análise de Gargalos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Principais Gargalos</span>
            </CardTitle>
            <CardDescription>Pontos de maior perda no funil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockGargalos.map((gargalo, index) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{gargalo.etapa}</span>
                    <span className="text-red-600 font-bold">
                      -{gargalo.percentual_perda.toFixed(1)}%
                    </span>
                  </div>
                  <AlertDescription>
                    <div className="space-y-1">
                      <p><strong>Perda:</strong> {gargalo.perda.toLocaleString()} leads</p>
                      <p><strong>Motivo:</strong> {gargalo.motivo_principal}</p>
                      <p className="text-blue-600"><strong>Ação:</strong> {gargalo.acao_sugerida}</p>
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>

        {/* Conversão por Tipo de Lead */}
        <Card>
          <CardHeader>
            <CardTitle>Conversão por Tipo de Lead</CardTitle>
            <CardDescription>Performance diferenciada por classificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Leads Quentes</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">80.8%</p>
                  <p className="text-sm text-gray-600">189/234</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Leads Mornos</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">60.0%</p>
                  <p className="text-sm text-gray-600">267/445</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Leads Frios</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">12.2%</p>
                  <p className="text-sm text-gray-600">23/189</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h4 className="font-semibold text-gray-900">Insights:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Leads quentes têm 6.6x mais chance de conversão</li>
                <li>• Leads mornos representam 60% do volume total</li>
                <li>• Oportunidade: melhorar nurturing de leads frios</li>
                <li>• Priorizar velocidade no atendimento de quentes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
