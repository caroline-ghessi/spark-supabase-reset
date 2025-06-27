
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, TestTube, Database, MessageSquare, AlertCircle } from 'lucide-react';

export const WhatsAppTestPanel: React.FC = () => {
  const [phone, setPhone] = useState('5511999999999');
  const [name, setName] = useState('Cliente Teste');
  const [message, setMessage] = useState('Olá, esta é uma mensagem de teste!');
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const testWebhook = async () => {
    setTesting(true);
    try {
      console.log('🧪 Iniciando teste do webhook...');
      
      const response = await supabase.functions.invoke('test-whatsapp-message', {
        body: { phone, name, message }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro desconhecido');
      }

      setLastResult(response.data);
      
      toast({
        title: "Teste Executado",
        description: "Verifique os logs e o resultado abaixo",
        className: "bg-blue-500 text-white",
      });
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      toast({
        title: "Erro no Teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const checkDatabaseData = async () => {
    try {
      // Verificar conversas
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (convError) throw convError;

      console.log('📊 Últimas conversas:', conversations);

      // Verificar mensagens
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (msgError) throw msgError;

      console.log('📝 Últimas mensagens:', messages);

      toast({
        title: "Dados Verificados",
        description: `${conversations?.length || 0} conversas, ${messages?.length || 0} mensagens`,
        className: "bg-green-500 text-white",
      });

    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error);
      toast({
        title: "Erro na Verificação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>Painel de Diagnóstico WhatsApp</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Teste de Mensagem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5511999999999"
              />
            </div>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cliente Teste"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem de teste..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={testWebhook}
              disabled={testing}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {testing ? (
                <>
                  <TestTube className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Testar Webhook
                </>
              )}
            </Button>

            <Button
              onClick={checkDatabaseData}
              variant="outline"
            >
              <Database className="w-4 h-4 mr-2" />
              Verificar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado do Teste */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Resultado do Teste</span>
              <Badge className={lastResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {lastResult.success ? 'Sucesso' : 'Erro'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Status do Webhook</Label>
                <div className="flex items-center space-x-2">
                  <Badge className={lastResult.webhook_status === 200 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {lastResult.webhook_status}
                  </Badge>
                  <span className="text-sm text-gray-600">{lastResult.webhook_response}</span>
                </div>
              </div>

              <div>
                <Label>Payload Enviado</Label>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(lastResult.test_payload, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Como Usar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>Testar Webhook:</strong> Simula uma mensagem do WhatsApp chegando no webhook</p>
            <p>• <strong>Verificar Dados:</strong> Mostra as últimas conversas e mensagens no console</p>
            <p>• <strong>Console:</strong> Abra o Dev Tools para ver logs detalhados</p>
            <p>• <strong>Edge Function Logs:</strong> Verifique os logs do Supabase para mais detalhes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
