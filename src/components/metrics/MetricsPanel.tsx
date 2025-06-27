
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Users, Clock, Target, AlertTriangle } from 'lucide-react';

interface KPI {
  titulo: string;
  valor: string;
  variacao: string;
  periodo: string;
  tendencia: 'up' | 'down';
  cor: string;
}

const mockKPIs: KPI[] = [
  {
    titulo: "Taxa de Conversão",
    valor: "68%",
    variacao: "+12%",
    periodo: "últimos 30 dias",
    tendencia: "up",
    cor: "text-green-600"
  },
  {
    titulo: "Tempo Médio Resposta",
    valor: "8 min",
    variacao: "-23%",
    periodo: "últimos 7 dias",
    tendencia: "up",
    cor: "text-green-600"
  },
  {
    titulo: "Score Qualidade Médio",
    valor: "7.8",
    variacao: "+0.5",
    periodo: "este mês",
    tendencia: "up",
    cor: "text-green-600"
  },
  {
    titulo: "Escalações Semana",
    valor: "4",
    variacao: "-2",
    periodo: "esta semana",
    tendencia: "up",
    cor: "text-green-600"
  }
];

export const MetricsPanel = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Métricas</h1>
        <p className="text-gray-600">Acompanhe o desempenho da plataforma em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900">{kpi.valor}</p>
                  <div className="flex items-center mt-1">
                    {kpi.tendencia === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${kpi.cor}`}>{kpi.variacao}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{kpi.periodo}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Gráfico de Performance - Em breve</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução da Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">Gráfico de Evolução - Em breve</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Vendedor</th>
                  <th className="text-left py-3 px-4">Conversas</th>
                  <th className="text-left py-3 px-4">Score Médio</th>
                  <th className="text-left py-3 px-4">Taxa Conversão</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Antonio Silva</td>
                  <td className="py-3 px-4">12</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">8.5</span>
                  </td>
                  <td className="py-3 px-4">75%</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Ativo</span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Carla Mendes</td>
                  <td className="py-3 px-4">8</td>
                  <td className="py-3 px-4">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">6.2</span>
                  </td>
                  <td className="py-3 px-4">62%</td>
                  <td className="py-3 px-4">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Alerta</span>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Roberto Santos</td>
                  <td className="py-3 px-4">15</td>
                  <td className="py-3 px-4">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">4.1</span>
                  </td>
                  <td className="py-3 px-4">45%</td>
                  <td className="py-3 px-4">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Crítico</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
