import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, TestTube, CheckCircle, XCircle, AlertTriangle, MessageSquare, Bot, Database } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

interface IntegrationTest {
  webhookValidation: boolean;
  difyConnection: boolean;
  whatsappSending: boolean;
  dataIntegrity: boolean;
  endToEnd: boolean;
}

export const IntegrationVerificationPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [steps, setSteps] = useState<VerificationStep[]>([
    { id: 'webhook', name: 'Validação do Webhook', status: 'pending' },
    { id: 'dify', name: 'Comunicação com Dify', status: 'pending' },
    { id: 'whatsapp', name: 'Envio via WhatsApp', status: 'pending' },
    { id: 'database', name: 'Integridade dos Dados', status: 'pending' },
    { id: 'endtoend', name: 'Teste End-to-End', status: 'pending' }
  ]);

  const updateStep = (stepId: string, status: VerificationStep['status'], message?: string, details?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message, details } : step
    ));
  };

  const runFullVerification = async () => {
    setTesting(true);
    
    try {
      // Resetar todos os steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
      
      // Etapa 1: Validação do Webhook
      updateStep('webhook', 'running');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const { data: webhookTest, error: webhookError } = await supabase.functions.invoke('webhook-health-check');
        
        if (webhookError) {
          updateStep('webhook', 'error', `Erro no health check: ${webhookError.message}`);
        } else if (webhookTest?.checks?.webhook?.status === 'working') {
          updateStep('webhook', 'success', 'Webhook funcionando corretamente', webhookTest);
        } else {
          updateStep('webhook', 'error', 'Webhook com problemas detectados', webhookTest);
        }
      } catch (error) {
        updateStep('webhook', 'error', `Erro ao verificar webhook: ${error}`);
      }

      // Etapa 2: Comunicação com Dify
      updateStep('dify', 'running');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const { data: difyTest, error: difyError } = await supabase.functions.invoke('test-dify');
        
        if (difyError) {
          updateStep('dify', 'error', `Erro no teste Dify: ${difyError.message}`);
        } else if (difyTest?.status === 'success') {
          updateStep('dify', 'success', 'Dify respondendo corretamente', difyTest);
        } else {
          updateStep('dify', 'error', 'Dify não está respondendo adequadamente', difyTest);
        }
      } catch (error) {
        updateStep('dify', 'error', `Erro ao testar Dify: ${error}`);
      }

      // Etapa 3: Teste de envio WhatsApp
      updateStep('whatsapp', 'running');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const { data: whatsappTest, error: whatsappError } = await supabase.functions.invoke('test-whatsapp-message', {
          body: {
            to: '5511999999999', // Número de teste
            message: 'Teste de integração - ' + new Date().toISOString()
          }
        });
        
        if (whatsappError) {
          updateStep('whatsapp', 'error', `Erro no teste WhatsApp: ${whatsappError.message}`);
        } else if (whatsappTest?.success) {
          updateStep('whatsapp', 'success', 'WhatsApp enviando mensagens', whatsappTest);
        } else {
          updateStep('whatsapp', 'error', 'Erro ao enviar via WhatsApp', whatsappTest);
        }
      } catch (error) {
        updateStep('whatsapp', 'error', `Erro no teste WhatsApp: ${error}`);
      }

      // Etapa 4: Verificação da integridade dos dados
      updateStep('database', 'running');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id, client_name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('id, conversation_id, sender_type, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (convError || msgError) {
          updateStep('database', 'error', 'Erro ao verificar dados no banco');
        } else {
          updateStep('database', 'success', `${conversations?.length || 0} conversas, ${messages?.length || 0} mensagens`, {
            conversations,
            messages
          });
        }
      } catch (error) {
        updateStep('database', 'error', `Erro na verificação de dados: ${error}`);
      }

      // Etapa 5: Teste End-to-End (simulação)
      updateStep('endtoend', 'running');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const allSuccessful = steps.slice(0, 4).every(step => step.status === 'success');
      
      if (allSuccessful) {
        updateStep('endtoend', 'success', 'Todos os componentes funcionando em conjunto');
        toast.success('✅ Integração WhatsApp + Dify funcionando perfeitamente!');
      } else {
        updateStep('endtoend', 'error', 'Alguns componentes apresentam problemas');
        toast.error('❌ Integração com problemas detectados');
      }

    } catch (error) {
      console.error('Erro na verificação:', error);
      toast.error('Erro durante a verificação');
    } finally {
      setTesting(false);
    }
  };

  const getStepIcon = (step: VerificationStep) => {
    switch (step.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStepColor = (step: VerificationStep) => {
    switch (step.status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="w-5 h-5" />
          <span>Verificação da Integração WhatsApp + Dify</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Verificação completa de todos os componentes da integração
          </p>
          <Button 
            onClick={runFullVerification}
            disabled={testing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Verificando...' : 'Iniciar Verificação'}</span>
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className={`p-4 rounded-lg border ${getStepColor(step)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  {getStepIcon(step)}
                  <div>
                    <h4 className="font-medium">{step.name}</h4>
                    {step.message && (
                      <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                    )}
                  </div>
                </div>
                <Badge variant={
                  step.status === 'success' ? 'default' :
                  step.status === 'error' ? 'destructive' :
                  step.status === 'running' ? 'secondary' : 'outline'
                }>
                  {step.status === 'pending' ? 'Pendente' :
                   step.status === 'running' ? 'Executando' :
                   step.status === 'success' ? 'Sucesso' : 'Erro'}
                </Badge>
              </div>
              
              {step.details && step.status === 'success' && (
                <div className="mt-3 text-xs text-gray-500">
                  <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(step.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Esta verificação testa todos os componentes principais da integração.
            Execute após configurar todas as variáveis de ambiente no Supabase.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="flex flex-col items-center space-y-2">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <span>WhatsApp</span>
            <span className="text-xs text-gray-500">Webhook & Envio</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <span>Dify AI</span>
            <span className="text-xs text-gray-500">Chat & Respostas</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Database className="w-8 h-8 text-purple-600" />
            <span>Supabase</span>
            <span className="text-xs text-gray-500">Dados & Sincronização</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};