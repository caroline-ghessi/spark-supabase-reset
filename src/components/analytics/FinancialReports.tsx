
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, ArrowUp, ArrowDown } from 'lucide-react';

const chartConfig = {
  receita: {
    label: "Receita",
    color: "hsl(var(--chart-1))",
  },
  meta: {
    label: "Meta",
    color: "hsl(var(--chart-2))",
  },
  roi: {
    label: "ROI",
    color: "hsl(var(--chart-3))",
  },
};

const receitaMensal = [
  { mes: 'Jan', receita: 3850, meta: 3500, custo: 890 },
  { mes: 'Fev', receita: 4120, meta: 3800, custo: 920 },
  { mes: 'Mar', receita: 4890, meta: 4200, custo: 1080 },
  { mes: 'Abr', receita: 3920, meta: 4000, custo: 850 },
  { mes: 'Mai', receita: 5340, meta: 4500, custo: 1200 },
  { mes: 'Jun', receita: 6480, meta: 6000, custo: 1450 }
];

const breakdownReceita = [
  { name: 'Vendas Novas', value: 4320, color: '#3b82f6' },
  { name: 'Upsells', value: 1580, color: '#10b981' },
  { name: 'Renovações', value: 580, color: '#f59e0b' }
];

const roiPorCanal = [
  { canal: 'Bot WhatsApp', roi: 680, investimento: 2500 },
  { canal: 'Vendedores + IA', roi: 890, investimento: 8500 },
  { canal: 'Atendimento Manual', roi: 340, investimento: 5500 },
  { canal: 'Vendedores s/ IA', roi: 230, investimento: 4200 }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const FinancialReports = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value * 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h2>
          <p className="text-gray-600">Análise financeira detalhada e ROI da plataforma</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">R$ 6.48M</p>
            <p className="text-sm text-gray-600">Receita Este Mês</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">340%</p>
            <p className="text-sm text-gray-600">ROI da Plataforma</p>
          </div>
        </div>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">R$ 6.48M</p>
                <p className="text-sm text-green-600">Receita Mensal</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+8.0% vs meta</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-700">R$ 340</p>
                <p className="text-sm text-blue-600">CAC Atual</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowDown className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">-34.6% vs anterior</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-full">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-700">R$ 125k</p>
                <p className="text-sm text-purple-600">LTV Médio</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+18.7% crescimento</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-orange-700">3.7:1</p>
                <p className="text-sm text-orange-600">Razão LTV/CAC</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-gray-600">Excelente (&gt;3:1)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da Receita */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
            <CardDescription>Últimos 6 meses - Receita vs Meta (em milhares)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart data={receitaMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border rounded shadow">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">Receita: {formatCurrency(payload[0]?.value as number)}</p>
                          <p className="text-sm">Meta: {formatCurrency(payload[1]?.value as number)}</p>
                          <p className="text-sm">Lucro: {formatCurrency((payload[0]?.value as number) - (payload[2]?.value as number))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stackId="1"
                  stroke="var(--color-receita)" 
                  fill="var(--color-receita)"
                  fillOpacity={0.6}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  stroke="var(--color-meta)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Breakdown da Receita */}
        <Card>
          <CardHeader>
            <CardTitle>Composição da Receita</CardTitle>
            <CardDescription>Breakdown por tipo de venda - Junho 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-48">
                <PieChart>
                  <Pie
                    data={breakdownReceita}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {breakdownReceita.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">{formatCurrency(data.value)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
              
              <div className="space-y-2">
                {breakdownReceita.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI por Canal */}
      <Card>
        <CardHeader>
          <CardTitle>ROI por Canal de Vendas</CardTitle>
          <CardDescription>Comparativo de retorno sobre investimento por estratégia</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={roiPorCanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" />
              <YAxis />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">ROI: {data.roi}%</p>
                        <p className="text-sm">Investimento: {formatCurrency(data.investimento / 1000)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="roi" fill="var(--color-roi)" name="ROI (%)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Análise Financeira Detalhada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise de Eficiência</CardTitle>
            <CardDescription>Comparativo antes/depois da implementação da IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-lg font-bold text-red-700">Antes da IA</p>
                <div className="space-y-2 mt-2">
                  <div>
                    <p className="text-xl font-bold">R$ 520</p>
                    <p className="text-xs text-gray-600">CAC</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">52.3%</p>
                    <p className="text-xs text-gray-600">Taxa Conversão</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">12.5 dias</p>
                    <p className="text-xs text-gray-600">Tempo Fechamento</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-lg font-bold text-green-700">Com a IA</p>
                <div className="space-y-2 mt-2">
                  <div>
                    <p className="text-xl font-bold">R$ 340</p>
                    <p className="text-xs text-gray-600">CAC</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">73.1%</p>
                    <p className="text-xs text-gray-600">Taxa Conversão</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">5.2 dias</p>
                    <p className="text-xs text-gray-600">Tempo Fechamento</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">Melhorias Obtidas:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <span className="text-green-600 font-medium">34.6% redução</span> no custo de aquisição</li>
                <li>• <span className="text-green-600 font-medium">39.8% aumento</span> na taxa de conversão</li>
                <li>• <span className="text-green-600 font-medium">58.4% redução</span> no tempo de fechamento</li>
                <li>• <span className="text-green-600 font-medium">R$ 2.89M</span> em receita adicional mensal</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projeções Financeiras</CardTitle>
            <CardDescription>Cenários para os próximos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-700">Cenário Otimista</span>
                  <span className="text-xs text-green-600">+20% crescimento</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold">R$ 9.5M</p>
                    <p className="text-gray-600">Receita mensal</p>
                  </div>
                  <div>
                    <p className="font-bold">78%</p>
                    <p className="text-gray-600">Taxa conversão</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-700">Cenário Realista</span>
                  <span className="text-xs text-blue-600">+12% crescimento</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold">R$ 7.8M</p>
                    <p className="text-gray-600">Receita mensal</p>
                  </div>
                  <div>
                    <p className="font-bold">75%</p>
                    <p className="text-gray-600">Taxa conversão</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-yellow-700">Cenário Pessimista</span>
                  <span className="text-xs text-yellow-600">+5% crescimento</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold">R$ 6.8M</p>
                    <p className="text-gray-600">Receita mensal</p>
                  </div>
                  <div>
                    <p className="font-bold">70%</p>
                    <p className="text-gray-600">Taxa conversão</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">Recomendações:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Manter investimento em otimização da IA</li>
                <li>• Expandir equipe de vendas em +1 pessoa</li>
                <li>• Implementar 100% das sugestões de qualidade</li>
                <li>• Automatizar nurturing de leads frios</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
