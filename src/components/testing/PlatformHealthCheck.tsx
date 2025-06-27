
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database, 
  Wifi, 
  MessageSquare, 
  Users, 
  Bell,
  Activity,
  Play
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
}

export const PlatformHealthCheck: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Conexão Supabase', status: 'pending' },
    { name: 'Verificar Tabelas', status: 'pending' },
    { name: 'Dados de Vendedores', status: 'pending' },
    { name: 'Real-time Subscriptions', status: 'pending' },
    { name: 'Edge Function Webhook', status: 'pending' },
    { name: 'Criar Conversa Teste', status: 'pending' },
    { name: 'Sistema de Notificações', status: 'pending' },
    { name: 'Limpeza de Dados Teste', status: 'pending' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const { toast } = useToast();

  const updateTestStatus = (testName: string, status: TestResult['status'], message?: string) => {
    setTests(prev => prev.map(test => 
      test.name === testName 
        ? { ...test, status, message, timestamp: new Date() }
        : test
    ));
  };

  // Teste 1: Conexão Supabase
  const testSupabaseConnection = async () => {
    updateTestStatus('Conexão Supabase', 'running');
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      updateTestStatus('Conexão Supabase', 'success', 'Conectado com sucesso');
      return true;
    } catch (error) {
      updateTestStatus('Conexão Supabase', 'error', `Erro: ${error.message}`);
      return false;
    }
  };

  // Teste 2: Verificar se todas as tabelas existem
  const testTablesExist = async () => {
    updateTestStatus('Verificar Tabelas', 'running');
    const requiredTables = [
      'conversations', 'messages', 'sellers', 'clients', 
      'materials', 'notifications', 'ai_recommendations',
      'quality_scores', 'escalations', 'audit_logs'
    ];
    
    try {
      let tablesFound = 0;
      
      for (const table of requiredTables) {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
          
        if (!error) tablesFound++;
      }
      
      if (tablesFound === requiredTables.length) {
        updateTestStatus('Verificar Tabelas', 'success', `${tablesFound}/10 tabelas encontradas`);
        return true;
      } else {
        updateTestStatus('Verificar Tabelas', 'error', `Apenas ${tablesFound}/10 tabelas encontradas`);
        return false;
      }
    } catch (error) {
      updateTestStatus('Verificar Tabelas', 'error', `Erro: ${error.message}`);
      return false;
    }
  };

  // Teste 3: Verificar dados de vendedores
  const testSellersData = async () => {
    updateTestStatus('Dados de Vendedores', 'running');
    try {
      const { data: sellers, error } = await supabase
        .from('sellers')
        .select('*');
      
      if (error) throw error;
      
      if (sellers && sellers.length > 0) {
        updateTestStatus('Dados de Vendedores', 'success', `${sellers.length} vendedores encontrados`);
        return true;
      } else {
        updateTestStatus('Dados de Vendedores', 'error', 'Nenhum vendedor encontrado');
        return false;
      }
    } catch (error) {
      updateTestStatus('Dados de Vendedores', 'error', `Erro: ${error.message}`);
      return false;
    }
  };

  // Teste 4: Real-time subscriptions
  const testRealTime = async () => {
    updateTestStatus('Real-time Subscriptions', 'running');
    
    return new Promise((resolve) => {
      try {
        const channel = supabase
          .channel('health-check-channel')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'conversations'
          }, () => {
            // Real-time funcionando
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              updateTestStatus('Real-time Subscriptions', 'success', 'Real-time ativado');
              supabase.removeChannel(channel);
              resolve(true);
            } else if (status === 'CHANNEL_ERROR') {
              updateTestStatus('Real-time Subscriptions', 'error', 'Erro na subscription');
              resolve(false);
            }
          });
        
        // Timeout após 5 segundos
        setTimeout(() => {
          supabase.removeChannel(channel);
          updateTestStatus('Real-time Subscriptions', 'error', 'Timeout na subscription');
          resolve(false);
        }, 5000);
        
      } catch (error) {
        updateTestStatus('Real-time Subscriptions', 'error', `Erro: ${error.message}`);
        resolve(false);
      }
    });
  };

  // Teste 5: Edge Function Webhook
  const testWebhookFunction = async () => {
    updateTestStatus('Edge Function Webhook', 'running');
    try {
      const testToken = 'test-token-12345';
      const response = await fetch(
        `https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=${testToken}&hub.challenge=12345`,
        { method: 'GET' }
      );
      
      if (response.ok) {
        const result = await response.text();
        updateTestStatus('Edge Function Webhook', 'success', 'Webhook respondendo');
        return true;
      } else {
        updateTestStatus('Edge Function Webhook', 'error', `Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      updateTestStatus('Edge Function Webhook', 'error', `Erro: ${error.message}`);
      return false;
    }
  };

  // Teste 6: Criar conversa de teste
  const testCreateConversation = async () => {
    updateTestStatus('Criar Conversa Teste', 'running');
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_phone: '555199999999',
          client_name: 'Cliente Teste HealthCheck',
          status: 'bot',
          lead_temperature: 'warm',
          source: 'test'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Salvar ID para limpeza posterior
      (window as any).__testConversationId = data.id;
      
      updateTestStatus('Criar Conversa Teste', 'success', 'Conversa criada com sucesso');
      return true;
    } catch (error) {
      updateTestStatus('Criar Conversa Teste', 'error', `Erro: ${error.message}`);
      return false;
    }
  };

  // Teste 7: Sistema de notificações
  const testNotifications = async () => {
    updateTestStatus('Sistema de Notificações', 'running');
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: 'health_check',
          title: 'Teste de Sistema',
          message: 'Sistema de notificações funcionando corretamente',
          priority: 'normal'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Salvar ID para limpeza posterior
      (window as any).__testNotificationId = data.id;
      
      updateTestStatus('Sistema de Notificações', 'success', 'Notificação criada');
      return true;
    } catch (error) {
      updateTestStatus('Sistema de Notificações', 'error', `Erro: ${error.message}`);
      return false;
    }
  };

  // Teste 8: Limpeza de dados de teste
  const cleanupTestData = async () => {
    updateTestStatus('Limpeza de Dados Teste', 'running');
    try {
      const conversationId = (window as any).__testConversationId;
      const notificationId = (window as any).__testNotificationId;
      
      let cleanupCount = 0;
      
      if (conversationId) {
        await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);
        cleanupCount++;
      }
      
      if (notificationId) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);
        cleanupCount++;
      }
      
      updateTestStatus('Limpeza de Dados Teste', 'success', `${cleanupCount} registros removidos`);
      return true;
    } catch (error) {
      updateTestStatus('Limpeza de Dados Teste', 'error', `Erro: ${error.message}`);
      return false;
    }
  };

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    
    // Reset todos os status
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })));
    
    const testFunctions = [
      testSupabaseConnection,
      testTablesExist,
      testSellersData,
      testRealTime,
      testWebhookFunction,
      testCreateConversation,
      testNotifications,
      cleanupTestData
    ];
    
    let successCount = 0;
    
    for (const testFn of testFunctions) {
      const success = await testFn();
      if (success) successCount++;
      
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    setOverallStatus('complete');
    
    // Toast com resultado final
    if (successCount === testFunctions.length) {
      toast({
        title: "🎉 Teste Completo",
        description: "Todos os testes passaram! Plataforma totalmente funcional.",
        className: "bg-green-500 text-white",
      });
    } else {
      toast({
        title: "⚠️ Teste com Problemas",
        description: `${successCount}/${testFunctions.length} testes passaram. Verifique os erros.`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestIcon = (testName: string) => {
    if (testName.includes('Supabase')) return <Database className="w-4 h-4" />;
    if (testName.includes('Real-time')) return <Wifi className="w-4 h-4" />;
    if (testName.includes('Webhook')) return <MessageSquare className="w-4 h-4" />;
    if (testName.includes('Vendedores')) return <Users className="w-4 h-4" />;
    if (testName.includes('Notificações')) return <Bell className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const successfulTests = tests.filter(t => t.status === 'success').length;
  const failedTests = tests.filter(t => t.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-orange-600" />
                <span>Teste Final da Plataforma</span>
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Verificação completa de todas as funcionalidades antes de ir para produção
              </p>
            </div>
            
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Executar Testes
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {overallStatus !== 'idle' && (
          <CardContent>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  ✅ {successfulTests} Sucessos
                </Badge>
              </div>
              
              {failedTests > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800">
                    ❌ {failedTests} Falhas
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-800">
                  📊 {successfulTests}/{tests.length} Completos
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de Testes */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados dos Testes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getTestIcon(test.name)}
                  <div>
                    <div className="font-medium text-gray-900">{test.name}</div>
                    {test.message && (
                      <div className="text-sm text-gray-600">{test.message}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {test.timestamp && (
                    <span className="text-xs text-gray-500">
                      {test.timestamp.toLocaleTimeString()}
                    </span>
                  )}
                  <Badge className={getStatusColor(test.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(test.status)}
                      <span className="capitalize">{test.status}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultado Final */}
      {overallStatus === 'complete' && (
        <Card className={successfulTests === tests.length ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {successfulTests === tests.length ? '🎉' : '⚠️'}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                successfulTests === tests.length ? 'text-green-800' : 'text-red-800'
              }`}>
                {successfulTests === tests.length 
                  ? 'Plataforma Totalmente Funcional!' 
                  : 'Alguns Problemas Encontrados'
                }
              </h3>
              <p className="text-gray-600">
                {successfulTests === tests.length 
                  ? 'Todos os sistemas estão operacionais. A plataforma está pronta para produção!'
                  : `${failedTests} teste(s) falharam. Verifique os problemas acima antes de prosseguir.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
