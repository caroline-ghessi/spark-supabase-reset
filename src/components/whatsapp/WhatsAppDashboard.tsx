
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
      title: 'Total de Conversas',
      value: stats.total,
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      trend: { value: '+12% em relação ao mês anterior', isPositive: true }
    },
    {
      title: 'Bot Ativo',
      value: stats.bot,
      icon: Bot,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      title: 'Atendimento Manual',
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
      {/* Header com Stats */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="p-4">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">WhatsApp Business</h1>
            <p className="text-gray-600">Central de atendimento integrada</p>
          </div>

          {/* Alerta de RLS se necessário */}
          {rlsTestPassed === false && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>Problema de Autenticação Detectado:</strong> As políticas de segurança não estão funcionando corretamente.
                </span>
                <Button 
                  onClick={() => window.location.reload()} 
                  size="sm" 
                  variant="outline"
                  className="ml-4"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Recarregar Página
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading de conversas */}
          {loading && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {testingRLS ? 'Verificando permissões e carregando conversas...' : 'Carregando conversas...'}
              </AlertDescription>
            </Alert>
          )}

          {/* Erro se não houver conversas e não estiver carregando */}
          {!loading && conversations.length === 0 && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Nenhuma conversa encontrada. Isso pode indicar um problema de permissões.</span>
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

          {/* Estatísticas */}
          <StatsGrid stats={statsData} />

          {/* Temperatura dos Leads */}
          <TemperatureBadges data={temperatureData} />
        </div>
      </div>

      {/* Interface Principal com Abas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center space-x-2">
                <TestTube className="w-4 h-4" />
                <span>Diagnóstico WhatsApp</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mx-4 mb-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex">
              <div className="flex h-full w-full">
                {/* Lista de Conversas */}
                <div className="w-full sm:w-80 lg:w-96 border-r border-gray-200 flex flex-col flex-shrink-0">
                  <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Conversas WhatsApp</h3>
                    <p className="text-sm text-gray-600">{conversations.length} conversas ativas</p>
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

                {/* Interface de Chat */}
                <div className="flex-1 flex flex-col min-w-0">
                  {selectedConversation ? (
                    <WhatsAppChatInterface
                      conversation={selectedConversation}
                      messages={messages[selectedConversation.id] || []}
                      onSendMessage={handleSendMessage}
                      onTakeControl={handleTakeControl}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="text-center">
                        <MessageSquare className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          Selecione uma conversa
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                          Escolha uma conversa da lista para começar o atendimento
                        </p>
                        {conversations.length === 0 && !loading && (
                          <Button 
                            onClick={handleRetryLoad} 
                            className="mt-4"
                            variant="outline"
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
          
          <TabsContent value="diagnostics" className="flex-1 overflow-hidden mx-4 mb-4">
            <WhatsAppTestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
