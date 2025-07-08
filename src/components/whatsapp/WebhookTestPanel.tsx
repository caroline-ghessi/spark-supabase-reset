import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, TestTube, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  status: string;
  timestamp: string;
  credentials?: {
    dify_api_key: boolean;
    dify_base_url: string;
    whatsapp_token: boolean;
    phone_number_id: boolean;
  };
  problem_conversations?: number;
  conversations?: Array<{
    id: string;
    client_name: string;
    client_phone: string;
    created_at: string;
  }>;
}

interface ReprocessResult {
  status: string;
  timestamp: string;
  summary: {
    total_found: number;
    processed: number;
    successful: number;
    errors: number;
  };
}

interface HealthCheckResult {
  status: string;
  timestamp: string;
  checks: {
    webhook: {
      status: string;
      responseTime: number;
      url: string;
    };
    dify: {
      status: string;
      responseTime: number;
      configured: boolean;
    };
    conversations: {
      problemCount: number;
      withoutBotResponse: number;
      conversations: Array<{
        id: string;
        client_name: string;
        client_phone: string;
        created_at: string;
        status: string;
      }>;
    };
  };
  issues: string[];
  recommendations: string[];
}

export const WebhookTestPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessResult, setReprocessResult] = useState<ReprocessResult | null>(null);
  const [healthChecking, setHealthChecking] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  const runWebhookTest = async () => {
    setTesting(true);
    setError(null);
    
    try {
      console.log('🧪 Iniciando teste do webhook...');
      
      const { data, error: funcError } = await supabase.functions.invoke('test-webhook-dify', {
        body: {
          test_message: 'Teste de conectividade',
          timestamp: new Date().toISOString()
        }
      });

      if (funcError) {
        throw new Error(`Erro na função: ${funcError.message}`);
      }

      setResult(data);
      
      if (data.status === 'test_completed') {
        toast.success('Teste do webhook concluído!');
      } else {
        toast.warning('Teste parcialmente concluído');
      }
      
    } catch (err) {
      console.error('❌ Erro no teste:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Erro ao executar teste');
    } finally {
      setTesting(false);
    }
  };

  const reprocessLostMessages = async () => {
    setReprocessing(true);
    setError(null);
    
    try {
      console.log('🔄 Iniciando reprocessamento de mensagens perdidas...');
      
      const { data, error: funcError } = await supabase.functions.invoke('reprocess-lost-messages');

      if (funcError) {
        throw new Error(`Erro na função: ${funcError.message}`);
      }

      setReprocessResult(data);
      
      if (data.status === 'completed') {
        toast.success(`Reprocessamento concluído! ${data.summary.successful} mensagens enviadas`);
      } else {
        toast.warning('Reprocessamento parcialmente concluído');
      }
      
    } catch (err) {
      console.error('❌ Erro no reprocessamento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Erro ao reprocessar mensagens');
    } finally {
      setReprocessing(false);
    }
  };

  const runHealthCheck = async () => {
    setHealthChecking(true);
    setError(null);
    
    try {
      console.log('🏥 Iniciando health check completo...');
      
      const { data, error: funcError } = await supabase.functions.invoke('webhook-health-check');

      if (funcError) {
        throw new Error(`Erro na função: ${funcError.message}`);
      }

      setHealthResult(data);
      
      if (data.status === 'healthy') {
        toast.success('Sistema funcionando normalmente!');
      } else if (data.status === 'warning') {
        toast.warning('Sistema com problemas menores detectados');
      } else if (data.status === 'degraded') {
        toast.error('Sistema com problemas significativos');
      } else {
        toast.error('Sistema com problemas críticos!');
      }
      
    } catch (err) {
      console.error('❌ Erro no health check:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Erro ao executar health check');
    } finally {
      setHealthChecking(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>Teste de Webhook e Dify</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={async () => {
              const { executeRecoveryPlan } = await import('@/utils/recoveryPlan');
              await executeRecoveryPlan();
            }} 
            disabled={testing || reprocessing || healthChecking}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700"
          >
            <RefreshCw className={`w-4 h-4 ${healthChecking || reprocessing ? 'animate-spin' : ''}`} />
            <span>🚀 EXECUTAR PLANO DE RECUPERAÇÃO</span>
          </Button>
          
          <Button 
            onClick={runHealthCheck} 
            disabled={testing || reprocessing || healthChecking}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${healthChecking ? 'animate-spin' : ''}`} />
            <span>{healthChecking ? 'Verificando Saúde...' : 'Health Check Completo'}</span>
          </Button>
          
          <Button 
            onClick={runWebhookTest} 
            disabled={testing || reprocessing || healthChecking}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testando...' : 'Testar Conectividade'}</span>
          </Button>
          
          <Button 
            onClick={reprocessLostMessages} 
            disabled={testing || reprocessing || healthChecking}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
            <span>{reprocessing ? 'Reprocessando...' : 'Reenviar Mensagens Perdidas'}</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Status das Credenciais</h4>
              {result.credentials && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.credentials.dify_api_key)}
                    <span>Dify API Key</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.credentials.whatsapp_token)}
                    <span>WhatsApp Token</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.credentials.phone_number_id)}
                    <span>Phone Number ID</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(!!result.credentials.dify_base_url)}
                    <span>Dify Base URL</span>
                  </div>
                </div>
              )}
            </div>

            {result.problem_conversations !== undefined && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span>Conversas Problemáticas</span>
                  <Badge variant="outline">{result.problem_conversations}</Badge>
                </h4>
                
                {result.conversations && result.conversations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Conversas das últimas 24h sem resposta do Dify:
                    </p>
                    {result.conversations.map((conv) => (
                      <div 
                        key={conv.id} 
                        className="bg-white p-2 rounded border text-sm"
                      >
                        <div className="font-medium">{conv.client_name}</div>
                        <div className="text-gray-600">{conv.client_phone}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(conv.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500">
              Teste executado em: {new Date(result.timestamp).toLocaleString('pt-BR')}
            </div>
          </div>
        )}

        {healthResult && (
          <div className={`p-4 rounded-lg ${
            healthResult.status === 'healthy' ? 'bg-green-50' :
            healthResult.status === 'warning' ? 'bg-yellow-50' :
            healthResult.status === 'degraded' ? 'bg-orange-50' :
            'bg-red-50'
          }`}>
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              {healthResult.status === 'healthy' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {healthResult.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
              {healthResult.status === 'degraded' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
              {healthResult.status === 'critical' && <XCircle className="w-4 h-4 text-red-600" />}
              <span>Status do Sistema: {healthResult.status}</span>
            </h4>
            
            <div className="space-y-3">
              {/* Webhook Status */}
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Webhook Principal</span>
                  <Badge variant={healthResult.checks.webhook.status === 'working' ? 'default' : 'destructive'}>
                    {healthResult.checks.webhook.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>URL: {healthResult.checks.webhook.url}</div>
                  <div>Tempo de resposta: {healthResult.checks.webhook.responseTime}ms</div>
                </div>
              </div>

              {/* Dify Status */}
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Dify AI</span>
                  <Badge variant={healthResult.checks.dify.status === 'working' ? 'default' : 'destructive'}>
                    {healthResult.checks.dify.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Configurado: {healthResult.checks.dify.configured ? 'Sim' : 'Não'}</div>
                  {healthResult.checks.dify.responseTime > 0 && (
                    <div>Tempo de resposta: {healthResult.checks.dify.responseTime}ms</div>
                  )}
                </div>
              </div>

              {/* Conversations Status */}
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Conversas</span>
                  <Badge variant={healthResult.checks.conversations.problemCount === 0 ? 'default' : 'destructive'}>
                    {healthResult.checks.conversations.problemCount} problemas
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Sem resposta do bot: {healthResult.checks.conversations.withoutBotResponse}</div>
                  <div>Total problemáticas: {healthResult.checks.conversations.problemCount}</div>
                </div>
              </div>

              {/* Issues */}
              {healthResult.issues.length > 0 && (
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium mb-2">Problemas Detectados:</h5>
                  <ul className="text-sm text-red-600 space-y-1">
                    {healthResult.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium mb-2">Recomendações:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {healthResult.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-3">
              Health check executado em: {new Date(healthResult.timestamp).toLocaleString('pt-BR')}
            </div>
          </div>
        )}

        {reprocessResult && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Resultado do Reprocessamento</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Encontradas:</span> {reprocessResult.summary.total_found}
              </div>
              <div>
                <span className="font-medium">Processadas:</span> {reprocessResult.summary.processed}
              </div>
              <div>
                <span className="font-medium text-green-600">Sucessos:</span> {reprocessResult.summary.successful}
              </div>
              <div>
                <span className="font-medium text-red-600">Erros:</span> {reprocessResult.summary.errors}
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              Reprocessamento em: {new Date(reprocessResult.timestamp).toLocaleString('pt-BR')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};