
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppConversationsList } from './WhatsAppConversationsList';
import { WhatsAppChatInterface } from './WhatsAppChatInterface';
import { WhatsAppTestPanel } from './WhatsAppTestPanel';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { TemperatureBadges } from '@/components/ui/TemperatureBadges';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { RealConversation } from '@/types/whatsapp';
import { MessageSquare, Bot, User, AlertTriangle, TestTube } from 'lucide-react';

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
      {/* Header */}
      <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">WhatsApp Business</h1>
          <p className="text-gray-600">Central de atendimento integrada</p>
        </div>

        {/* Estatísticas */}
        <StatsGrid stats={statsData} />

        {/* Temperatura dos Leads */}
        <TemperatureBadges data={temperatureData} />
      </div>

      {/* Interface Principal com Abas */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 lg:p-8 pt-0">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-6 flex-shrink-0">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex items-center space-x-2">
              <TestTube className="w-4 h-4" />
              <span>Diagnóstico WhatsApp</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostics" className="flex-1 overflow-hidden">
            <WhatsAppTestPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
