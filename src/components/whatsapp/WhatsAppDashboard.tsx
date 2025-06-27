
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppConversationsList } from './WhatsAppConversationsList';
import { WhatsAppChatInterface } from './WhatsAppChatInterface';
import { WhatsAppTestPanel } from './WhatsAppTestPanel';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { RealConversation } from '@/types/whatsapp';
import { MessageSquare, Bot, User, Clock, AlertTriangle, TestTube } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Business</h1>
        <p className="text-gray-600">Central de atendimento integrada</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Conversas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Bot Ativo</p>
                <p className="text-2xl font-bold text-blue-600">{stats.bot}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Atendimento Manual</p>
                <p className="text-2xl font-bold text-green-600">{stats.manual}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Aguardando</p>
                <p className="text-2xl font-bold text-orange-600">{stats.waiting}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temperatura dos Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Temperatura dos Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Badge className="bg-red-100 text-red-800">
              🔥 Quentes: {stats.hot}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              🟡 Mornos: {stats.warm}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              🔵 Frios: {stats.cold}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interface Principal com Abas */}
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center space-x-2">
            <TestTube className="w-4 h-4" />
            <span>Diagnóstico</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Conversas */}
            <div className="lg:col-span-1">
              <WhatsAppConversationsList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
                onRefresh={loadConversations}
                loading={loading}
              />
            </div>

            {/* Interface de Chat */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <WhatsAppChatInterface
                  conversation={selectedConversation}
                  messages={messages[selectedConversation.id] || []}
                  onSendMessage={handleSendMessage}
                  onTakeControl={handleTakeControl}
                />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-gray-600">
                      Escolha uma conversa da lista para começar o atendimento
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="diagnostics">
          <WhatsAppTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
