
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAIAgents } from '@/hooks/useAIAgents';
import { Bot, Brain, Target, FileText, Activity, Settings } from 'lucide-react';

export const SPINAgentsTab = () => {
  const { agents, loading, updateAgentStatus } = useAIAgents();

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'classificador_cliente': return <Target className="w-5 h-5 text-red-500" />;
      case 'matcher_vendedor': return <Brain className="w-5 h-5 text-blue-500" />;
      case 'monitor_qualidade': return <Activity className="w-5 h-5 text-green-500" />;
      case 'gerador_resumo': return <FileText className="w-5 h-5 text-purple-500" />;
      default: return <Bot className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAgentColor = (agentId: string) => {
    switch (agentId) {
      case 'classificador_cliente': return 'border-red-200 bg-red-50';
      case 'matcher_vendedor': return 'border-blue-200 bg-blue-50';
      case 'monitor_qualidade': return 'border-green-200 bg-green-50';
      case 'gerador_resumo': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agentes SPIN...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Agentes SPIN Selling</h3>
          <p className="text-sm text-gray-600">
            Configuração dos agentes de IA treinados em metodologia SPIN
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          <Bot className="w-3 h-3 mr-1" />
          {agents.filter(a => a.status === 'active').length} ativos
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Classificador</p>
              <p className="text-xs text-gray-600">Leads SPIN</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Brain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Matcher</p>
              <p className="text-xs text-gray-600">Vendedor ideal</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Monitor</p>
              <p className="text-xs text-gray-600">Qualidade SPIN</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Resumos</p>
              <p className="text-xs text-gray-600">Análise SPIN</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <div className="grid gap-4">
        {agents.map(agent => (
          <Card key={agent.id} className={`border-2 ${getAgentColor(agent.agent_id)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getAgentIcon(agent.agent_id)}
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    v{agent.version}
                  </Badge>
                  <Switch
                    checked={agent.status === 'active'}
                    onCheckedChange={(checked) => 
                      updateAgentStatus(agent.agent_id, checked ? 'active' : 'inactive')
                    }
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Configurações */}
              <div className="bg-white rounded-lg p-3 border">
                <h5 className="font-medium text-sm mb-2">Configurações SPIN:</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {agent.agent_id === 'classificador_cliente' && (
                    <>
                      <div>Confiança mínima: 80%</div>
                      <div>Considera histórico: Sim</div>
                      <div>Foco: Problemas/Implicações</div>
                      <div>Metodologia: SPIN</div>
                    </>
                  )}
                  {agent.agent_id === 'matcher_vendedor' && (
                    <>
                      <div>Prioriza SPIN: Sim</div>
                      <div>Match por necessidade: Sim</div>
                      <div>Considera carga: Sim</div>
                      <div>Balanceamento: Não</div>
                    </>
                  )}
                  {agent.agent_id === 'monitor_qualidade' && (
                    <>
                      <div>Intervalo: 3 min</div>
                      <div>Score mínimo: 7.0</div>
                      <div>SPIN compliance: 60%</div>
                      <div>Coaching real-time: Sim</div>
                    </>
                  )}
                  {agent.agent_id === 'gerador_resumo' && (
                    <>
                      <div>Inclui transcrição: Sim</div>
                      <div>Destaca gaps SPIN: Sim</div>
                      <div>Sugere perguntas: Sim</div>
                      <div>Por categoria: Sim</div>
                    </>
                  )}
                </div>
              </div>

              {/* Prompt Preview */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-sm mb-2">Prompt SPIN (Preview):</h5>
                <p className="text-xs text-gray-700 line-clamp-3">
                  {agent.prompt.substring(0, 200)}...
                </p>
                <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Ver completo
                </Button>
              </div>

              {/* Status e métricas */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  Última atualização: {new Date(agent.updated_at).toLocaleDateString('pt-BR')}
                </span>
                <Badge variant="outline" className="text-xs">
                  {agent.status === 'active' ? '🟢 Ativo' : '🔴 Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
