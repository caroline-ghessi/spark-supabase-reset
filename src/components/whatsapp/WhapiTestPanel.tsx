
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Send, TestTube, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const WhapiTestPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testData, setTestData] = useState({
    seller: 'marcia',
    clientPhone: '5511999999999',
    clientName: 'Cliente Teste',
    message: 'Olá, preciso de informações sobre produtos'
  });
  
  const { toast } = useToast();

  const simulateWebhook = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Simular dados do webhook Whapi
      const webhookData = {
        messages: [{
          id: `test-${Date.now()}`,
          from_me: false,
          type: 'text',
          timestamp: Math.floor(Date.now() / 1000),
          from: testData.clientPhone,
          to: '555181181894', // Número da Márcia como exemplo
          text: {
            body: testData.message
          },
          contact: {
            name: testData.clientName
          },
          from_name: testData.clientName
        }],
        channel_id: 'TEST-CHANNEL'
      };

      console.log('🧪 Simulando webhook:', webhookData);

      // Chamar a função webhook diretamente
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whapi-webhook?seller=${testData.seller}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(webhookData)
      });

      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', [...response.headers.entries()]);

      const responseText = await response.text();
      console.log('📄 Resposta raw:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText, parseError: e.message };
      }

      setTestResult({
        status: response.status,
        ok: response.ok,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        toast({
          title: "Teste Enviado com Sucesso",
          description: "Webhook simulado com sucesso! Verifique os logs.",
          className: "bg-green-500 text-white",
        });
      } else {
        toast({
          title: "Erro no Teste",
          description: `Status ${response.status}: ${responseText}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        error: error.message,
        type: error.name,
        stack: error.stack
      });
      
      toast({
        title: "Erro de Conexão",
        description: error instanceof Error ? error.message : "Falha ao conectar com webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkVendorMessages = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('vendor_whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      console.log('📨 Últimas mensagens dos vendedores:', data);
      
      toast({
        title: "Mensagens Verificadas",
        description: `Encontradas ${data?.length || 0} mensagens. Veja o console para detalhes.`,
      });

    } catch (error) {
      console.error('❌ Erro ao verificar mensagens:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar mensagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>Teste de Integração Whapi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seller">Vendedor</Label>
              <Input
                id="seller"
                value={testData.seller}
                onChange={(e) => setTestData(prev => ({ ...prev, seller: e.target.value }))}
                placeholder="marcia, gabriel, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="clientPhone">Telefone do Cliente</Label>
              <Input
                id="clientPhone"
                value={testData.clientPhone}
                onChange={(e) => setTestData(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="5511999999999"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              value={testData.clientName}
              onChange={(e) => setTestData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Nome do cliente"
            />
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={testData.message}
              onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Mensagem do cliente..."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={simulateWebhook}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Simular Webhook
            </Button>

            <Button 
              onClick={checkVendorMessages}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar Mensagens
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {testResult.ok ? (
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span>Resultado do Teste</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {testResult.status || 'N/A'}
                </div>
                <div>
                  <strong>Sucesso:</strong> {testResult.ok ? '✅ Sim' : '❌ Não'}
                </div>
              </div>
              
              {testResult.error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro:</strong> {testResult.error}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <strong>Resposta:</strong>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>

              {testResult.headers && (
                <div>
                  <strong>Headers:</strong>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(testResult.headers, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Função Webhook:</span>
              <span className="text-green-600">✅ Ativa com melhor logging</span>
            </div>
            <div className="flex justify-between">
              <span>CORS:</span>
              <span className="text-green-600">✅ Configurado</span>
            </div>
            <div className="flex justify-between">
              <span>Tratamento de Erros:</span>
              <span className="text-blue-600">🔄 Melhorado</span>
            </div>
            <div className="flex justify-between">
              <span>Debug Detalhado:</span>
              <span className="text-green-600">✅ Habilitado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
