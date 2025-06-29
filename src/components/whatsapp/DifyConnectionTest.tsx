
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DifyConnectionTest: React.FC = () => {
  const [testMessage, setTestMessage] = useState('Olá, como você pode me ajudar?');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testDifyConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testando conexão com Dify...');
      
      const response = await fetch('/api/test-dify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage
        })
      });

      const result = await response.json();
      console.log('🧪 Resultado do teste:', result);

      setTestResult({
        success: response.ok,
        data: result,
        status: response.status
      });

      if (response.ok) {
        toast({
          title: "Teste Concluído",
          description: "Conexão com Dify testada com sucesso!",
          className: "bg-green-500 text-white",
        });
      } else {
        toast({
          title: "Erro no Teste",
          description: result.error || "Falha na conexão com Dify",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        success: false,
        error: error.message,
        status: 0
      });
      
      toast({
        title: "Erro no Teste",
        description: "Falha na comunicação com o servidor",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-purple-600" />
          <span>Teste de Conexão Dify</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-message">Mensagem de Teste</Label>
          <Input
            id="test-message"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Digite uma mensagem para testar..."
            className="mt-1"
          />
        </div>

        <Button
          onClick={testDifyConnection}
          disabled={testing || !testMessage.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 mr-2" />
              Testar Dify
            </>
          )}
        </Button>

        {testResult && (
          <>
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status da Conexão:</span>
                <Badge className={testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {testResult.success ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Erro
                    </>
                  )}
                </Badge>
              </div>

              {testResult.success && testResult.data?.response && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Resposta do Dify:</h4>
                  <p className="text-green-700 text-sm">{testResult.data.response}</p>
                </div>
              )}

              {!testResult.success && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Erro Detectado:
                  </h4>
                  <p className="text-red-700 text-sm">
                    {testResult.data?.error || testResult.error || 'Erro desconhecido'}
                  </p>
                  {testResult.status && (
                    <p className="text-red-600 text-xs mt-1">
                      Status HTTP: {testResult.status}
                    </p>
                  )}
                </div>
              )}

              {testResult.data?.details && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Detalhes Técnicos:</h4>
                  <pre className="text-blue-700 text-xs overflow-x-auto">
                    {JSON.stringify(testResult.data.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
