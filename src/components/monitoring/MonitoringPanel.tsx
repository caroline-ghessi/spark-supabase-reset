
import { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { ConversationMonitorCard } from './ConversationMonitorCard';
import { RecommendationStream } from './RecommendationStream';
import { EscalationAlert } from './EscalationAlert';
import { ScrollArea } from '../ui/scroll-area';
import { 
  mockMetricas, 
  mockConversasVendedores, 
  mockRecomendacoes, 
  mockEscalacoes,
  ConversaVendedor 
} from '../../data/monitoringData';
import { Button } from '../ui/button';
import { Filter, RefreshCw } from 'lucide-react';

export const MonitoringPanel = () => {
  const [conversas, setConversas] = useState(mockConversasVendedores);
  const [recomendacoes, setRecomendacoes] = useState(mockRecomendacoes);
  const [escalacoes, setEscalacoes] = useState(mockEscalacoes);
  const [filtroVendedor, setFiltroVendedor] = useState('Todos');
  const [filtroRisco, setFiltroRisco] = useState('Todos');
  
  // Simulação de tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular mudanças nos scores e status
      setConversas(prev => 
        prev.map(conv => ({
          ...conv,
          qualityScore: Math.max(3, Math.min(10, conv.qualityScore + (Math.random() - 0.5) * 0.5)),
          recomendacoesPendentes: Math.max(0, conv.recomendacoesPendentes + (Math.random() > 0.8 ? 1 : 0))
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const vendedores = Array.from(new Set(conversas.map(c => c.vendedor)));
  
  const conversasFiltradas = conversas.filter(conv => {
    if (filtroVendedor !== 'Todos' && conv.vendedor !== filtroVendedor) return false;
    if (filtroRisco !== 'Todos' && conv.risco !== filtroRisco.toLowerCase()) return false;
    return true;
  });

  const handleResolveEscalation = (id: number) => {
    setEscalacoes(prev => 
      prev.map(esc => 
        esc.id === id ? { ...esc, status: 'resolvido' as const } : esc
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Vendedores</h1>
            <p className="text-gray-600">Monitoramento em tempo real da qualidade do atendimento</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockMetricas.map((metrica, index) => (
              <MetricCard key={index} metrica={metrica} />
            ))}
          </div>

          {/* Escalation Alerts */}
          {escalacoes.filter(esc => esc.status === 'enviado').length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-red-600">🚨 Escalações Críticas</h2>
              {escalacoes
                .filter(esc => esc.status === 'enviado')
                .map(escalacao => (
                  <EscalationAlert
                    key={escalacao.id}
                    escalacao={escalacao}
                    onResolve={handleResolveEscalation}
                  />
                ))}
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center bg-white p-4 rounded-lg border">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={filtroVendedor}
                  onChange={(e) => setFiltroVendedor(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="Todos">Todos os Vendedores</option>
                  {vendedores.map(vendedor => (
                    <option key={vendedor} value={vendedor}>{vendedor}</option>
                  ))}
                </select>
                <select
                  value={filtroRisco}
                  onChange={(e) => setFiltroRisco(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="Todos">Todos os Riscos</option>
                  <option value="Baixo">Baixo</option>
                  <option value="Medio">Médio</option>
                  <option value="Alto">Alto</option>
                </select>
              </div>

              {/* Conversations */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Conversas Monitoradas ({conversasFiltradas.length})
                </h2>
                {conversasFiltradas.map(conversa => (
                  <ConversationMonitorCard key={conversa.id} conversa={conversa} />
                ))}
              </div>
            </div>

            {/* Recommendations Stream */}
            <div>
              <RecommendationStream recomendacoes={recomendacoes} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
