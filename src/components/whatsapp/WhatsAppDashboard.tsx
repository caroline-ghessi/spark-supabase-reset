import React, { useState, useEffect, useCallback } from 'react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { testRLSPolicies } from '@/contexts/auth/userOperations';
import { RealConversation } from '@/types/whatsapp';

// Import the dashboard components
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardAlerts } from './dashboard/DashboardAlerts';
import { DashboardStats } from './dashboard/DashboardStats';
import { DashboardContent } from './dashboard/DashboardContent';
import { EmptyStateMessage } from './dashboard/EmptyStateMessage';
import { SellerRecommendation } from './SellerRecommendation';

export const WhatsAppDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<RealConversation | null>(null);
  const [rlsTestPassed, setRlsTestPassed] = useState<boolean | null>(null);
  const [testingRLS, setTestingRLS] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  // Usar apenas conversas da API Oficial do WhatsApp (source = 'whatsapp')
  const {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl,
    loadConversations
  } = useWhatsAppIntegration(undefined, 'whatsapp');

  // Verificar se é usuário real
  const isRealUser = user && !user.id.startsWith('temp-') && !user.id.startsWith('dev-') && !user.id.startsWith('emergency-');

  // Testar RLS apenas para usuários reais
  useEffect(() => {
    let isMounted = true;
    
    const runRLSTest = async () => {
      if (!isRealUser || testingRLS || rlsTestPassed !== null) return;
      
      console.log('🧪 Testando políticas RLS para usuário real:', user.email);
      setTestingRLS(true);
      
      try {
        const testResult = await testRLSPolicies();
        if (isMounted) {
          setRlsTestPassed(testResult);
          console.log('🧪 Resultado do teste RLS:', testResult ? 'PASSOU' : 'FALHOU');
        }
      } catch (error) {
        console.error('❌ Erro no teste RLS:', error);
        if (isMounted) {
          setRlsTestPassed(false);
        }
      } finally {
        if (isMounted) {
          setTestingRLS(false);
        }
      }
    };

    if (isRealUser && !authLoading) {
      runRLSTest();
    }

    return () => {
      isMounted = false;
    };
  }, [isRealUser, user, authLoading, testingRLS, rlsTestPassed]);

  // Carregar conversas apenas para usuários reais e após RLS passar
  useEffect(() => {
    if (isRealUser && !authLoading && !loading && !conversationsLoaded && rlsTestPassed === true) {
      console.log('📊 Carregando conversas para usuário real:', user.email);
      loadConversations();
      setConversationsLoaded(true);
    }
  }, [isRealUser, user, authLoading, loading, conversationsLoaded, rlsTestPassed, loadConversations]);

  // Handlers memoizados
  const handleSelectConversation = useCallback(async (conversation: RealConversation) => {
    console.log('💬 Selecionando conversa da API Oficial:', conversation.client_name, 'Source:', conversation.source);
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  }, [loadMessages]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!selectedConversation) return;
    console.log('📤 Enviando mensagem para:', selectedConversation.client_name);
    await sendMessage(selectedConversation.id, message);
  }, [selectedConversation, sendMessage]);

  const handleTakeControl = useCallback(async () => {
    if (!selectedConversation) return;
    console.log('🎯 Assumindo controle da conversa:', selectedConversation.client_name);
    await takeControl(selectedConversation.id);
  }, [selectedConversation, takeControl]);

  const handleRetryLoad = useCallback(async () => {
    console.log('🔄 Tentando recarregar conversas...');
    setConversationsLoaded(false);
    await loadConversations();
    setConversationsLoaded(true);
  }, [loadConversations]);

  const toggleDebug = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);

  // Mostrar debug apenas para usuários não-reais
  useEffect(() => {
    if (!isRealUser) {
      setShowDebug(true);
    }
  }, [isRealUser]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header Compacto */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="p-2">
          <DashboardHeader 
            showDebug={showDebug}
            onToggleDebug={toggleDebug}
          />

          <DashboardAlerts
            showDebug={showDebug}
            user={user}
            authLoading={authLoading}
            rlsTestPassed={rlsTestPassed}
            testingRLS={testingRLS}
            loading={loading}
            conversationsLength={conversations.length}
            onRetryLoad={handleRetryLoad}
          />

          {/* Stats apenas para usuários reais */}
          {isRealUser && (
            <DashboardStats
              user={user}
              conversations={conversations}
            />
          )}
        </div>
      </div>

      {/* Interface Principal */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {isRealUser ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Indicador de que estamos vendo apenas API Oficial */}
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    WhatsApp API Oficial - Central de Atendimento
                  </span>
                </div>
                <span className="text-xs text-blue-600">
                  {conversations.length} conversas ativas
                </span>
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden min-h-0">
              <div className="flex-1 min-w-0">
                <DashboardContent
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  messages={messages}
                  loading={loading}
                  onSelectConversation={handleSelectConversation}
                  onSendMessage={handleSendMessage}
                  onTakeControl={handleTakeControl}
                  onRefresh={loadConversations}
                />
              </div>
              {selectedConversation && (
                <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50">
                  <SellerRecommendation selectedConversation={selectedConversation} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyStateMessage />
        )}
      </div>
    </div>
  );
};
