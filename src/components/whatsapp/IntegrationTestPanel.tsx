
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Send, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  seller: string;
  phone: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
}

export const IntegrationTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testMessage, setTestMessage] = useState('Teste de integração - Sistema funcionando!');

  const sellers = [
    { name: 'Márcia', phone: '5511995320167' },
    { name: 'Ricardo', phone: '5181257025' },
    { name: 'Luan', phone: '5181423303' },
    { name: 'Gabriel', phone: '5181690036' },
    { name: 'Felipe', phone: '5181252666' }
  ];

  const initializeTest = () => {
    const initialResults = sellers.map(seller => ({
      seller: seller.name,
      phone: seller.phone,
      status: 'pending' as const
    }));
    setTestResults(initialResults);
  };

  const updateTestResult = (sellerName: string, status: 'success' | 'error', message?: string) => {
    setTestResults(prev => prev.map(result => 
      result.seller === sellerName 
        ? { ...result, status, message, timestamp: new Date() }
        : result
    ));
  };

  const testSellerIntegration = async (seller: { name: string; phone: string }) => {
    try {
      console.log(`🧪 Testando integração do ${seller.name} (${seller.phone})`);
      
      // Buscar dados do vendedor no banco
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('whatsapp_number', seller.phone)
        .single();

      if (sellerError || !sellerData) {
        updateTestResult(seller.name, 'error', 'Vendedor não encontrado no banco de dados');
        return;
      }

      if (!sellerData.whapi_token) {
        updateTestResult(seller.name, 'error', 'Token Whapi não configurado');
        return;
      }

      if (sellerData.whapi_status !== 'active') {
        updateTestResult(seller.name, 'error', `Status Whapi: ${sellerData.whapi_status}`);
        return;
      }

      // Verificar se o webhook está configurado corretamente
      const expectedWebhook = `https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=${seller.name.toLowerCase()}`;
      if (sellerData.whapi_webhook_url !== expectedWebhook) {
        updateTestResult(seller.name, 'error', `Webhook incorreto: ${sellerData.whapi_webhook_url}`);
        return;
      }

      // Testar conectividade com Whapi
      try {
        const response = await fetch('https://gate.whapi.cloud/health', {
          headers: {
            'Authorization': `Bearer ${sellerData.whapi_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Health check ${seller.name}:`, data);
          updateTestResult(seller.name, 'success', `Conectado - Status: ${data.status || 'OK'}`);
        } else {
          updateTestResult(seller.name, 'error', `Erro HTTP: ${response.status}`);
        }
      } catch (error) {
        updateTestResult(seller.name, 'error', `Erro de conexão: ${error.message}`);
      }

    } catch (error) {
      console.error(`❌ Erro no teste do ${seller.name}:`, error);
      updateTestResult(seller.name, 'error', error.message);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    initializeTest();
    
    toast.info('Iniciando testes de integração...');

    for (const seller of sellers) {
      await testSellerIntegration(seller);
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    
    if (errorCount === 0) {
      toast.success(`✅ Todos os ${successCount} vendedores estão integrados!`);
    } else {
      toast.error(`⚠️ ${errorCount} vendedores com problemas, ${successCount} OK`);
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim()) {
      toast.error('Digite uma mensagem de teste');
      return;
    }

    const successfulSellers = testResults.filter(r => r.status === 'success');
    
    if (successfulSellers.length === 0) {
      toast.error('Nenhum vendedor disponível. Execute os testes primeiro.');
      return;
    }

    toast.info(`Enviando mensagem de teste para ${successfulSellers.length} vendedores...`);
    
    for (const result of successfulSellers) {
      try {
        // Aqui você pode implementar o envio real da mensagem
        console.log(`📤 Enviando mensagem para ${result.seller}: ${testMessage}`);
        // Implementar chamada para Edge Function de envio
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${result.seller}:`, error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>Teste de Integração Whapi</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Validar configuração e conectividade com todos os vendedores
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Button 
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                'Executar Testes'
              )}
            </Button>
            
            <Button 
              onClick={() => setTestResults([])}
              variant="outline"
              disabled={isRunning}
            >
              Limpar Resultados
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Resultados dos Testes:</h4>
              {testResults.map((result) => (
                <div key={result.seller} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <span className="font-medium">{result.seller}</span>
                      <p className="text-xs text-gray-500">{result.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'pending' ? 'Pendente' : 
                       result.status === 'success' ? 'Sucesso' : 'Erro'}
                    </Badge>
                    {result.message && (
                      <span className="text-xs text-gray-500 max-w-xs truncate">
                        {result.message}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-green-600" />
            <span>Teste de Envio</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Mensagem de Teste
            </label>
            <Textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Digite a mensagem que será enviada para todos os vendedores integrados..."
              rows={3}
            />
          </div>
          
          <Button 
            onClick={sendTestMessage}
            className="bg-green-600 hover:bg-green-700"
            disabled={testResults.filter(r => r.status === 'success').length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensagem de Teste
          </Button>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Instruções:</strong>
          <ol className="mt-2 ml-4 list-decimal text-sm space-y-1">
            <li>Execute os testes para verificar a conectividade com cada vendedor</li>
            <li>Verifique se todos os webhooks estão configurados corretamente no painel Whapi</li>
            <li>Envie uma mensagem de teste para validar o fluxo completo</li>
            <li>Monitore os logs dos Edge Functions para identificar possíveis problemas</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};
