
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { testRLSPolicies } from '@/contexts/auth/userOperations';
import { RealConversation } from '@/types/whatsapp';

// Import the new smaller components
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardAlerts } from './dashboard/DashboardAlerts';
import { DashboardStats } from './dashboard/DashboardStats';
import { DashboardContent } from './dashboard/DashboardContent';
import { EmptyStateMessage } from './dashboard/EmptyStateMessage';

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

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
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

          <DashboardStats
            user={user}
            conversations={conversations}
          />
        </div>
      </div>

      {/* Interface Principal Maximizada */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {user ? (
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
        ) : (
          <EmptyStateMessage />
        )}
      </div>
    </div>
  );
};
