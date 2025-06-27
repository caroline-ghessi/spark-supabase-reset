
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Bot, TrendingUp, Target, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { mockAgentesIA, mockROIAutomacao } from '../../data/analyticsData';

const chartConfig = {
  precisao: {
    label: "Precisão (%)",
    color: "hsl(var(--chart-1))",
  },
  recall: {
    label: "Recall (%)", 
    color: "hsl(var(--chart-2))",
  },
  f1_score: {
    label: "F1 Score (%)",
    color: "hsl(var(--chart-3))",
  },
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const AIEffectiveness = () => {
  // Dados para gráfico de performance dos agentes
  const performanceData = mockAgentesIA.map(agente => ({
    agente: agente.agente.replace(' de ', '\n'),
    precisao: agente.precisao,
    recall: agente.recall || 0,
    f1_score: agente.f1_score || 0
  }));

  // Dados para ROI
  const roiData = [
    { name: 'Economia Mensal', value: mockROIAutomacao.economia_mensal.economia_total },
    { name: 'Receita Adicional', value: mockROIAutomacao.melhoria_conversao.receita_adicional / 1000 },
    { name: 'Leads Salvos', value: mockROIAutomacao.leads_salvos.valor_total_salvo / 1000 }
  ];

  const getStatusBadge = (precisao: number) => {
    if (precisao >= 90) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (precisao >= 80) return <Badge className="bg-blue-100 text-blue-800">Bom</Badge>;
    if (precisao >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>;
    return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Eficácia da IA</h2>
          <p className="text-gray-600">Performance dos agentes inteligentes e ROI da automação</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">340%</p>
            <p className="text-sm text-gray-600">ROI Geral</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">90.2%</p>
            <p className="text-sm text-gray-600">Precisão Média</p>
          </div>
        </div>
      </div>

      {/* ROI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  R$ {(mockROIAutomacao.economia_mensal.economia_total / 1000).toFixed(1)}k
                </p>
                <p className="text-sm text-green-600">Economia Mensal</p>
                <p className="text-xs text-gray-600">
                  {mockROIAutomacao.economia_mensal.horas_economizadas}h economizadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  +{mockROIAutomacao.melhoria_conversao.melhoria_percentual}%
                </p>
                <p className="text-sm text-blue-600">Melhoria Conversão</p>
                <p className="text-xs text-gray-600">
                  {mockROIAutomacao.melhoria_conversao.conversao_antes_ia}% → {mockROIAutomacao.melhoria_conversao.conversao_com_ia}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {mockROIAutomacao.leads_salvos.leads_que_seriam_perdidos}
                </p>
                <p className="text-sm text-orange-600">Leads Salvos</p>
                <p className="text-xs text-gray-600">
                  R$ {(mockROIAutomacao.leads_salvos.valor_total_salvo / 1000000).toFixed(1)}M valor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance dos Agentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Agentes IA</CardTitle>
            <CardDescription>Métricas de precisão e eficácia</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="agente" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="precisao" fill="var(--color-precisao)" name="Precisão" />
                <Bar dataKey="recall" fill="var(--color-recall)" name="Recall" />
                <Bar dataKey="f1_score" fill="var(--color-f1_score)" name="F1 Score" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto Financeiro da IA</CardTitle>
            <CardDescription>Distribuição do valor gerado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={roiData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">
                            Valor: R$ {data.value > 1000 ? 
                              `${(data.value / 1000).toFixed(1)}k` : 
                              data.value.toLocaleString()
                            }
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes dos Agentes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Análise Detalhada dos Agentes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockAgentesIA.map((agente, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{agente.agente}</CardTitle>
                  {getStatusBadge(agente.precisao)}
                </div>
                <CardDescription>
                  Versão {agente.versao} | Precisão: {agente.precisao}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Métricas Principais */}
                <div className="grid grid-cols-2 gap-4">
                  {agente.classificacoes_mes && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {agente.classificacoes_mes.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Classificações</p>
                    </div>
                  )}
                  {agente.matches_realizados && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {agente.matches_realizados.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Matches</p>
                    </div>
                  )}
                  {agente.avaliacoes_realizadas && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {agente.avaliacoes_realizadas.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Avaliações</p>
                    </div>
                  )}
                  {agente.acertos && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{agente.acertos}</p>
                      <p className="text-xs text-gray-600">Acertos</p>
                    </div>
                  )}
                </div>

                {/* Principais Erros */}
                {agente.principais_erros && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Principais Erros:</h4>
                    <ul className="text-xs space-y-1 text-gray-600">
                      {agente.principais_erros.map((erro, i) => (
                        <li key={i}>• {erro}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Melhorias Sugeridas */}
                {agente.melhorias_sugeridas && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-blue-900">Melhorias:</h4>
                    <ul className="text-xs space-y-1 text-blue-600">
                      {agente.melhorias_sugeridas.map((melhoria, i) => (
                        <li key={i}>• {melhoria}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
