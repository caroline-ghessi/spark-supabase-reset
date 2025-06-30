
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppConversationsList } from './WhatsAppConversationsList';
import { WhatsAppChatInterface } from './WhatsAppChatInterface';
import { WhatsAppTestPanel } from './WhatsAppTestPanel';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { TemperatureBadges } from '@/components/ui/TemperatureBadges';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { testRLSPolicies } from '@/contexts/auth/userOperations';
import { RealConversation } from '@/types/whatsapp';
import { MessageSquare, Bot, User, AlertTriangle, TestTube, RefreshCw } from 'lucide-react';

export const WhatsAppDashboard: React.FC = () => {
  const {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl,
    loadConversations
  } = useWhatsAppIntegration();

  const [selectedConversation, setSelectedConversation] = useState<RealConversation | null>(null);
  const [rlsTestPassed, setRlsTestPassed] = useState<boolean | null>(null);
  const [testingRLS, setTestingRLS] = useState(false);

  // Testar RLS no carregamento inicial
  useEffect(() => {
    const runRLSTest = async () => {
      setTestingRLS(true);
      const testResult = await testRLSPolicies();
      setRlsTestPassed(testResult);
      setTestingRLS(false);
    };

    runRLSTest();
  }, []);

  const handleSelectConversation = async (conversation: RealConversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return;
    await sendMessage(selectedConversation.id, message);
  };

  const handleTakeControl = async () => {
    if (!selectedConversation) return;
    await takeControl(selectedConversation.id);
  };

  const handleRetryLoad = async () => {
    console.log('🔄 Tentando recarregar conversas...');
    await loadConversations();
  };

  // Estatísticas das conversas
  const stats = {
    total: conversations.length,
    bot: conversations.filter(c => c.status === 'bot').length,
    manual: conversations.filter(c => c.status === 'manual').length,
    waiting: conversations.filter(c => c.status === 'waiting').length,
    hot: conversations.filter(c => c.lead_temperature === 'hot').length,
    warm: conversations.filter(c => c.lead_temperature === 'warm').length,
    cold: conversations.filter(c => c.lead_temperature === 'cold').length
  };

  const statsData = [
    {
      title: 'Total',
      value: stats.total,
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      title: 'Bot',
      value: stats.bot,
      icon: Bot,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      title: 'Manual',
      value: stats.manual,
      icon: User,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100'
    },
    {
      title: 'Aguardando',
      value: stats.waiting,
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100'
    }
  ];

  const temperatureData = {
    hot: stats.hot,
    warm: stats.warm,
    cold: stats.cold
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header Compacto */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="p-2">
          <div className="mb-2">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp Business</h1>
          </div>

          {/* Alerta de RLS se necessário */}
          {rlsTestPassed === false && (
            <Alert className="mb-2 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">
                  <strong>Problema de Autenticação:</strong> Políticas de segurança com erro.
                </span>
                <Button 
                  onClick={() => window.location.reload()} 
                  size="sm" 
                  variant="outline"
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Recarregar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading compacto */}
          {loading && (
            <Alert className="mb-2 border-blue-200 bg-blue-50">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-sm">
                {testingRLS ? 'Verificando permissões...' : 'Carregando conversas...'}
              </AlertDescription>
            </Alert>
          )}

          {/* Erro compacto */}
          {!loading && conversations.length === 0 && (
            <Alert className="mb-2 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between text-sm">
                <span>Nenhuma conversa encontrada.</span>
                <Button 
                  onClick={handleRetryLoad} 
                  size="sm" 
                  variant="outline"
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Tentar Novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Estatísticas Compactas */}
          <StatsGrid stats={statsData} />

          {/* Temperatura Compacta */}
          <TemperatureBadges data={temperatureData} />
        </div>
      </div>

      {/* Interface Principal Maximizada */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2 mb-2 h-8">
              <TabsTrigger value="chat" className="flex items-center space-x-2 text-xs">
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center space-x-2 text-xs">
                <TestTube className="w-3 h-3" />
                <span>Diagnóstico</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mx-2 mb-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex-1 flex">
              <div className="flex h-full w-full">
                {/* Lista de Conversas */}
                <div className="w-full sm:w-80 lg:w-96 border-r border-gray-200 flex flex-col flex-shrink-0">
                  <div className="p-3 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Conversas WhatsApp</h3>
                    <p className="text-xs text-gray-600">{conversations.length} conversas ativas</p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <WhatsAppConversationsList
                      conversations={conversations}
                      selectedConversationId={selectedConversation?.id}
                      onSelectConversation={handleSelectConversation}
                      onRefresh={loadConversations}
                      loading={loading}
                    />
                  </div>
                </div>

                {/* Interface de Chat Maximizada */}
                <div className="flex-1 flex flex-col min-w-0">
                  {selectedConversation ? (
                    <WhatsAppChatInterface
                      conversation={selectedConversation}
                      messages={messages[selectedConversation.id] || []}
                      onSendMessage={handleSendMessage}
                      onTakeControl={handleTakeControl}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Selecione uma conversa
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Escolha uma conversa da lista para começar o atendimento
                        </p>
                        {conversations.length === 0 && !loading && (
                          <Button 
                            onClick={handleRetryLoad} 
                            className="mt-3"
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Recarregar Conversas
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostics" className="flex-1 overflow-hidden mx-2 mb-2">
            <WhatsAppTestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
