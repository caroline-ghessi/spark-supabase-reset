import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Users, MessageSquare, TrendingUp, RefreshCw } from 'lucide-react';
import { useVendorConversations } from '@/hooks/useVendorConversations';
import { useVendorMessages, VendorMessage as ImportedVendorMessage } from '@/hooks/useVendorMessages';
import { VendorConversationsList } from './VendorConversationsList';
import { VendorChatInterface } from './VendorChatInterface';
import { supabase } from '@/integrations/supabase/client';

// Usar o tipo do useVendorConversations que é compatível com a view
type VendorConversation = {
  conversation_id: string;
  client_phone: string;
  client_name: string | null;
  seller_name: string;
  seller_id: string;
  conversation_status: string;
  last_message_at: string;
  last_message_text: string | null;
  total_messages: number;
  seller_messages: number;
  client_messages: number;
  whapi_status: string;
  avg_quality_score?: number;
};

// Adapter function to convert ImportedVendorMessage to VendorMessage
const adaptVendorMessages = (messages: ImportedVendorMessage[]) => {
  return messages.map(msg => ({
    id: msg.id,
    text_content: msg.text_content || '',
    is_from_seller: msg.is_from_seller,
    sent_at: msg.sent_at,
    status: msg.status
  }));
};

export const VendorMonitoringDashboard: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<VendorConversation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations
  } = useVendorConversations(refreshKey);

  const {
    messages,
    loading: messagesLoading,
  } = useVendorMessages(selectedConversation?.conversation_id, refreshKey);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchConversations();
  };

  const handleSelectConversation = (conversation: VendorConversation) => {
    console.log('📱 Selecionando conversa do vendedor:', conversation.client_name, 'Seller:', conversation.seller_name);
    setSelectedConversation(conversation);
  };

  // Função para sincronizar mensagens
  const handleSyncMessages = async () => {
    try {
      console.log('🔄 Iniciando sincronização de mensagens...');
      const { data, error } = await supabase.functions.invoke('sync-messages', {
        body: { action: 'sync_missing', limit: 1000 }
      });
      
      if (error) throw error;
      
      console.log('✅ Sincronização concluída:', data);
      // Recarregar conversas após sincronização
      handleRefresh();
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  };

  // Stats calculadas
  const stats = {
    totalConversations: conversations.length,
    activeSellers: new Set(conversations.map(c => c.seller_id)).size,
    totalMessages: conversations.reduce((sum, c) => sum + (c.total_messages || 0), 0),
    avgQuality: conversations.length > 0 
      ? conversations.reduce((sum, c) => sum + (c.avg_quality_score || 0), 0) / conversations.length 
      : 0
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      {/* Header com indicador */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <h1 className="text-lg font-semibold text-purple-900">
                Monitoramento de Vendedores - Whapi
              </h1>
              <p className="text-sm text-purple-700">
                Acompanhe as conversas entre vendedores e clientes
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSyncMessages} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Mensagens
            </Button>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${conversationsLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              Total de conversas dos vendedores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSellers}</div>
            <p className="text-xs text-muted-foreground">
              Vendedores com conversas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Mensagens trocadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgQuality.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Score de qualidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex space-x-4 min-h-0">
        {/* Lista de Conversas */}
        <div className="w-1/3 flex-shrink-0">
          <Card className="h-full">
            <VendorConversationsList
              conversations={conversations}
              selectedConversationId={selectedConversation?.conversation_id}
              onSelectConversation={handleSelectConversation}
              onRefresh={handleRefresh}
              loading={conversationsLoading}
            />
          </Card>
        </div>

        {/* Interface de Chat */}
        <div className="flex-1 min-w-0">
          {selectedConversation ? (
            <VendorChatInterface
              conversation={{
                conversation_id: selectedConversation.conversation_id,
                client_phone: selectedConversation.client_phone,
                client_name: selectedConversation.client_name || selectedConversation.client_phone,
                seller_name: selectedConversation.seller_name,
                conversation_status: selectedConversation.conversation_status,
                last_message_at: selectedConversation.last_message_at,
                total_messages: selectedConversation.total_messages,
                seller_messages: selectedConversation.seller_messages,
                client_messages: selectedConversation.client_messages
              }}
              messages={adaptVendorMessages(messages)}
              onSendMessage={async (message: string) => {
                // Placeholder para implementar envio de mensagem
                console.log('Enviando mensagem:', message);
              }}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
                  Escolha uma conversa da lista para monitorar a interação vendedor-cliente
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Handling */}
      {conversationsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-800">
              Erro ao carregar dados: {conversationsError}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
