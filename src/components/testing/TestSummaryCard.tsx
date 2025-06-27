
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TestResult } from './types';

interface TestSummaryCardProps {
  tests: TestResult[];
  overallStatus: 'idle' | 'running' | 'complete';
}

export const TestSummaryCard: React.FC<TestSummaryCardProps> = ({ 
  tests, 
  overallStatus 
}) => {
  const successfulTests = tests.filter(t => t.status === 'success').length;
  
  if (overallStatus !== 'complete') return null;

  return (
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
              : `${tests.length - successfulTests} teste(s) falharam. Verifique os problemas acima antes de prosseguir.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
