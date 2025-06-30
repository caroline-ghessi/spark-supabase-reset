
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { TestResult } from './integrationTestTypes';

interface TestResultItemProps {
  result: TestResult;
}

export const TestResultItem: React.FC<TestResultItemProps> = ({ result }) => {
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

  const showResultDetails = () => {
    if (!result.details) return;
    
    console.group(`🔍 Detalhes do teste - ${result.seller}`);
    console.log('Status:', result.status);
    console.log('Mensagem:', result.message);
    console.log('Detalhes completos:', result.details);
    console.groupEnd();
    
    toast.info(`Detalhes do ${result.seller} enviados para o console`);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
        {result.details && (
          <Button
            variant="ghost"
            size="sm"
            onClick={showResultDetails}
            className="text-xs px-2 py-1"
          >
            Ver Detalhes
          </Button>
        )}
      </div>
    </div>
  );
};
