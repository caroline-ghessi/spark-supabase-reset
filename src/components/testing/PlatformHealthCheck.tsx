
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Activity, Clock, Play } from 'lucide-react';
import { TestResult } from './types';
import { TestRunner } from './TestRunner';
import { TestResultsCard } from './TestResultsCard';
import { TestSummaryCard } from './TestSummaryCard';

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

  // Executar todos os testes
  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    
    // Reset todos os status
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const })));
    
    const testRunner = new TestRunner(updateTestStatus);
    const testFunctions = testRunner.getAllTestFunctions();
    
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
      <TestResultsCard tests={tests} />

      {/* Resultado Final */}
      <TestSummaryCard tests={tests} overallStatus={overallStatus} />
    </div>
  );
};
