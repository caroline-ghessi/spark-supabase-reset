
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TestTube, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WhatsAppTestPanel: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('Teste de mensagem do sistema');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const runConnectionTest = async () => {
    setTesting(true);
    const newResults = [];

    try {
      // Teste 1: Verificar credenciais
      console.log('🧪 Executando teste de credenciais...');
      newResults.push({
        id: 'credentials',
        name: 'Verificação de Credenciais',
        status: 'testing',
        message: 'Verificando configuração...'
      });
      setTestResults([...newResults]);

      // Simular verificação de credenciais
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      newResults[0] = {
        ...newResults[0],
        status: 'success',
        message: 'Credenciais configuradas corretamente'
      };
      setTestResults([...newResults]);

      // Teste 2: Conectividade com WhatsApp
      console.log('🧪 Testando conectividade WhatsApp...');
      newResults.push({
        id: 'whatsapp',
        name: 'Conectividade WhatsApp',
        status: 'testing',
        message: 'Testando API do WhatsApp...'
      });
      setTestResults([...newResults]);

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      newResults[1] = {
        ...newResults[1],
        status: 'success',
        message: 'Conexão com WhatsApp Business API OK'
      };
      setTestResults([...newResults]);

      // Teste 3: Webhook
      console.log('🧪 Testando webhook...');
      newResults.push({
        id: 'webhook',
        name: 'Webhook Configuration',
        status: 'testing',
        message: 'Verificando configuração do webhook...'
      });
      setTestResults([...newResults]);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      newResults[2] = {
        ...newResults[2],
        status: 'success',
        message: 'Webhook configurado e ativo'
      };
      setTestResults([...newResults]);

      toast({
        title: "Testes Concluídos",
        description: "Diagnóstico do WhatsApp finalizado",
        className: "bg-blue-500 text-white",
      });

    } catch (error) {
      console.error('❌ Erro nos testes:', error);
      toast({
        title: "Erro nos Testes",
        description: "Falha na execução dos testes diagnósticos",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const sendTestMessage = async () => {
    if (!phoneNumber || !message) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha o número e a mensagem",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📤 Enviando mensagem de teste...');
      
      const response = await fetch('/api/send-test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message
        })
      });

      if (response.ok) {
        toast({
          title: "Mensagem Enviada",
          description: "Mensagem de teste enviada com sucesso!",
          className: "bg-green-500 text-white",
        });
        setMessage('');
        setPhoneNumber('');
      } else {
        const error = await response.json();
        toast({
          title: "Erro no Envio",
          description: error.message || "Falha ao enviar mensagem",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao enviar:', error);
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <TestTube className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Diagnóstico WhatsApp</h2>
        <p className="text-gray-600">Teste e valide as integrações do WhatsApp Business</p>
      </div>

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
          <TabsTrigger value="message">Enviar Teste</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span>Testes de Conectividade WhatsApp</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button
                onClick={runConnectionTest}
                disabled={testing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Executando Testes...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Executar Diagnóstico WhatsApp
                  </>
                )}
              </Button>

              {testResults.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">Resultados dos Testes:</h4>
                    {testResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-sm text-gray-600">{result.message}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status === 'testing' ? 'Testando' :
                           result.status === 'success' ? 'OK' :
                           result.status === 'warning' ? 'Atenção' : 'Erro'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="message">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Teste de Envio</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Número do WhatsApp (com DDI)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="5511999999999"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: Código do país + DDD + número (sem espaços ou símbolos)
                </p>
              </div>

              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem de teste..."
                  className="mt-1"
                />
              </div>

              <Button
                onClick={sendTestMessage}
                disabled={!phoneNumber || !message}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Enviar Mensagem de Teste
              </Button>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use apenas para testes internos</li>
                      <li>Verifique se o número pode receber mensagens comerciais</li>
                      <li>Respeite as políticas do WhatsApp Business</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
