
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorConversationsList } from './VendorConversationsList';
import { VendorChatInterface } from './VendorChatInterface';
import { useVendorConversations } from '@/hooks/useVendorConversations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, TrendingUp, RefreshCw } from 'lucide-react';

interface VendorConversation {
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
}

export const VendorMonitoringDashboard: React.FC = () => {
  const {
    conversations,
    messages,
    loading,
    loadConversations,
    loadMessages,
    sendMessage
  } = useVendorConversations();

  const [selectedConversation, setSelectedConversation] = useState<VendorConversation | null>(null);

  const handleSelectConversation = async (conversation: VendorConversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.conversation_id);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedConversation) return;
    
    await sendMessage(
      selectedConversation.conversation_id,
      selectedConversation.seller_id,
      selectedConversation.client_phone,
      message
    );
  };

  // Estatísticas das conversas dos vendedores
  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.whapi_status === 'active').length,
    sellers: new Set(conversations.map(c => c.seller_name)).size,
    messages: conversations.reduce((sum, c) => sum + c.total_messages, 0)
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Monitoramento de Vendedores
            </h1>
            <p className="text-sm text-gray-600">
              Acompanhe as conversas dos vendedores em tempo real
            </p>
          </div>
          <Button onClick={loadConversations} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vendedores</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.sellers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mensagens</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.messages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interface Principal */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex h-full w-full">
          {/* Lista de Conversas */}
          <div className="w-full sm:w-80 lg:w-96 border-r border-gray-200 flex flex-col flex-shrink-0">
            <VendorConversationsList
              conversations={conversations}
              selectedConversationId={selectedConversation?.conversation_id}
              onSelectConversation={handleSelectConversation}
              onRefresh={loadConversations}
              loading={loading}
            />
          </div>

          {/* Interface de Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedConversation ? (
              <VendorChatInterface
                conversation={selectedConversation}
                messages={messages[selectedConversation.conversation_id] || []}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Escolha uma conversa da lista para monitorar o atendimento
                  </p>
                  {conversations.length === 0 && !loading && (
                    <div className="mt-4">
                      <Alert>
                        <AlertDescription>
                          Nenhuma conversa de vendedor encontrada. 
                          Verifique se os vendedores estão configurados corretamente.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
