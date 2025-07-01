
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WhatsAppConversationsList } from './WhatsAppConversationsList';
import { WhatsAppChatInterface } from './WhatsAppChatInterface';
import { AuthDebugPanel } from './AuthDebugPanel';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { TemperatureBadges } from '@/components/ui/TemperatureBadges';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { testRLSPolicies } from '@/contexts/auth/userOperations';
import { RealConversation } from '@/types/whatsapp';
import { MessageSquare, Bot, User, AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react';

export const WhatsAppDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<RealConversation | null>(null);
  const [rlsTestPassed, setRlsTestPassed] = useState<boolean | null>(null);
  const [testingRLS, setTestingRLS] = useState(false);
  const [showDebug, setShowDebug] = useState(!user);
  const [shouldLoadConversations, setShouldLoadConversations] = useState(false);

  const {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl,
    loadConversations
  } = useWhatsAppIntegration();

  // Testar RLS apenas uma vez quando usuário logar
  useEffect(() => {
    let isMounted = true;
    const runRLSTest = async () => {
      if (!user || testingRLS) return;
      
      setTestingRLS(true);
      const testResult = await testRLSPolicies();
      if (isMounted) {
        setRlsTestPassed(testResult);
        setTestingRLS(false);
      }
    };

    if (user && rlsTestPassed === null) {
      runRLSTest();
    }

    return () => {
      isMounted = false;
    };
  }, [user, rlsTestPassed, testingRLS]);

  // Auto-carregar conversas quando usuário autenticar - APENAS UMA VEZ
  useEffect(() => {
    if (user && !authLoading && !shouldLoadConversations) {
      console.log('👤 Usuário autenticado, preparando para carregar conversas...', user.email);
      setShouldLoadConversations(true);
    }
  }, [user, authLoading, shouldLoadConversations]);

  // Carregar conversas apenas quando flag estiver setada
  useEffect(() => {
    if (shouldLoadConversations && !loading) {
      console.log('📊 Carregando conversas...');
      loadConversations();
      setShouldLoadConversations(false);
    }
  }, [shouldLoadConversations, loading, loadConversations]);

  // Memoizar handlers para evitar re-renders
  const handleSelectConversation = useCallback(async (conversation: RealConversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  }, [loadMessages]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedConversation) return;
    await sendMessage(selectedConversation.id, message);
  }, [selectedConversation, sendMessage]);

  const handleTakeControl = useCallback(async () => {
    if (!selectedConversation) return;
    await takeControl(selectedConversation.id);
  }, [selectedConversation, takeControl]);

  const handleRetryLoad = useCallback(async () => {
    console.log('🔄 Tentando recarregar conversas...');
    await loadConversations();
  }, [loadConversations]);

  const toggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);

  // Memoizar estatísticas para evitar recálculos
  const stats = useMemo(() => ({
    total: conversations.length,
    bot: conversations.filter(c => c.status === 'bot').length,
    manual: conversations.filter(c => c.status === 'manual').length,
    waiting: conversations.filter(c => c.status === 'waiting').length,
    hot: conversations.filter(c => c.lead_temperature === 'hot').length,
    warm: conversations.filter(c => c.lead_temperature === 'warm').length,
    cold: conversations.filter(c => c.lead_temperature === 'cold').length
  }), [conversations]);

  const statsData = useMemo(() => [
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
  ], [stats]);

  const temperatureData = useMemo(() => ({
    hot: stats.hot,
    warm: stats.warm,
    cold: stats.cold
  }), [stats]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header Compacto */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="p-2">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">WhatsApp Business</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDebug}
              className="text-xs"
            >
              {showDebug ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showDebug ? 'Ocultar' : 'Debug'}
            </Button>
          </div>

          {/* Painel de Debug */}
          {showDebug && <AuthDebugPanel />}

          {/* Alerta de não autenticado */}
          {!user && !authLoading && (
            <Alert className="mb-2 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">
                  <strong>Não Autenticado:</strong> Faça login para ver as conversas.
                </span>
                <Button 
                  onClick={() => window.location.href = '/login'} 
                  size="sm" 
                  variant="outline"
                  className="ml-4"
                >
                  Fazer Login
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Alerta de RLS se necessário */}
          {user && rlsTestPassed === false && (
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
          {(loading || authLoading) && (
            <Alert className="mb-2 border-blue-200 bg-blue-50">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-sm">
                {authLoading ? 'Verificando autenticação...' : 
                 testingRLS ? 'Verificando permissões...' : 'Carregando conversas...'}
              </AlertDescription>
            </Alert>
          )}

          {/* Erro compacto */}
          {user && !loading && conversations.length === 0 && (
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

          {/* Estatísticas Compactas - só mostrar se autenticado */}
          {user && <StatsGrid stats={statsData} />}

          {/* Temperatura Compacta - só mostrar se autenticado */}
          {user && <TemperatureBadges data={temperatureData} />}
        </div>
      </div>

      {/* Interface Principal Maximizada */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {user ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex-1 flex mx-2 my-2">
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
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Acesso Restrito
              </h2>
              <p className="text-gray-600 mb-4">
                Você precisa estar logado para visualizar as conversas do WhatsApp.
              </p>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <User className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
