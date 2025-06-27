
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { KPICard } from './KPICard';
import { mockKPIs, mockEvolucaoConversoes, mockImpactoIA } from '../../data/analyticsData';

const chartConfig = {
  conversoes: {
    label: "Conversões",
    color: "hsl(var(--chart-1))",
  },
  meta: {
    label: "Meta",
    color: "hsl(var(--chart-2))",
  },
  valor: {
    label: "Valor",
    color: "hsl(var(--chart-3))",
  },
};

const COLORS = {
  quente: '#ef4444',
  morno: '#f59e0b', 
  frio: '#3b82f6'
};

export const ExecutiveDashboard = () => {
  const impactoData = [
    { name: 'Quente', value: mockImpactoIA.leadsClassificados.quente.quantidade, conversao: mockImpactoIA.leadsClassificados.quente.conversao },
    { name: 'Morno', value: mockImpactoIA.leadsClassificados.morno.quantidade, conversao: mockImpactoIA.leadsClassificados.morno.conversao },
    { name: 'Frio', value: mockImpactoIA.leadsClassificados.frio.quantidade, conversao: mockImpactoIA.leadsClassificados.frio.conversao }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">KPIs Executivos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockKPIs.map((kpi, index) => (
            <KPICard key={index} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Conversões */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Conversões</CardTitle>
            <CardDescription>Últimos 12 meses - Realizadas vs Meta</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart data={mockEvolucaoConversoes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="conversoes" 
                  stroke="var(--color-conversoes)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-conversoes)", strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  stroke="var(--color-meta)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "var(--color-meta)", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Impacto da IA */}
        <Card>
          <CardHeader>
            <CardTitle>Classificação de Leads pela IA</CardTitle>
            <CardDescription>Distribuição e taxa de conversão por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-64">
                <PieChart>
                  <Pie
                    data={impactoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {impactoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">Leads: {data.value}</p>
                            <p className="text-sm">Conversões: {data.conversao}</p>
                            <p className="text-sm">Taxa: {((data.conversao / data.value) * 100).toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
              
              {/* Estatísticas das Recomendações */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{mockImpactoIA.recomendacoesImplementadas.taxa_implementacao}%</p>
                  <p className="text-sm text-gray-600">Taxa Implementação</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{mockImpactoIA.recomendacoesImplementadas.taxa_sucesso}%</p>
                  <p className="text-sm text-gray-600">Taxa Sucesso</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
          <CardDescription>Principais insights e recomendações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">🎯 Sucessos</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• ROI da plataforma 70% acima da meta</li>
                <li>• Tempo de fechamento 28% melhor</li>
                <li>• IA salvou R$ 1.8M em leads</li>
                <li>• Taxa de conversão 62% acima do setor</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">⚠️ Atenção</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Meta mensal 15% abaixo do esperado</li>
                <li>• Roberto Santos precisa suporte</li>
                <li>• Gargalo na qualificação de leads</li>
                <li>• 48% dos leads não são atendidos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">💡 Recomendações</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Automatizar nurturing de leads frios</li>
                <li>• Treinar Roberto em técnicas de venda</li>
                <li>• Implementar mais 34% das sugestões da IA</li>
                <li>• Contratar 1 vendedor adicional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
