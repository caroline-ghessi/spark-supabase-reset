
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { TestResult } from './integrationTestTypes';

interface TestMessageSenderProps {
  testResults: TestResult[];
}

export const TestMessageSender: React.FC<TestMessageSenderProps> = ({ testResults }) => {
  const [testMessage, setTestMessage] = useState('Teste de integração - Sistema funcionando!');

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
        console.log(`📤 Enviando mensagem para ${result.seller}: ${testMessage}`);
        // Implementar chamada para Edge Function de envio
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${result.seller}:`, error);
      }
    }
  };

  return (
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
  );
};
