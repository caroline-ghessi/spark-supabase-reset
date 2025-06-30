
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, RefreshCw } from 'lucide-react';
import { useIntegrationTests } from '@/hooks/useIntegrationTests';
import { TestResultItem } from './TestResultItem';
import { TestMessageSender } from './TestMessageSender';

export const IntegrationTestPanel: React.FC = () => {
  const { testResults, isRunning, runAllTests, clearResults } = useIntegrationTests();

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
              onClick={clearResults}
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
                <TestResultItem key={result.seller} result={result} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TestMessageSender testResults={testResults} />

      <Alert>
        <AlertDescription>
          <strong>Instruções:</strong>
          <ol className="mt-2 ml-4 list-decimal text-sm space-y-1">
            <li>Execute os testes para verificar a conectividade com cada vendedor</li>
            <li>Use o botão "Ver Detalhes" para investigar erros específicos</li>
            <li>Verifique se todos os webhooks estão configurados corretamente no painel Whapi</li>
            <li>Envie uma mensagem de teste para validar o fluxo completo</li>
            <li>Monitore os logs dos Edge Functions para identificar possíveis problemas</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};
