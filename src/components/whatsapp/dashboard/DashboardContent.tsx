
import React from 'react';
import { WhatsAppConversationsList } from '@/components/whatsapp/WhatsAppConversationsList';
import { WhatsAppChatInterface } from '@/components/whatsapp/WhatsAppChatInterface';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RealConversation, RealMessage } from '@/types/whatsapp';

interface DashboardContentProps {
  conversations: RealConversation[];
  selectedConversation: RealConversation | null;
  messages: Record<string, RealMessage[]>;
  loading: boolean;
  onSelectConversation: (conversation: RealConversation) => void;
  onSendMessage: (message: string) => Promise<void>;
  onTakeControl: () => Promise<void>;
  onRefresh: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  conversations,
  selectedConversation,
  messages,
  loading,
  onSelectConversation,
  onSendMessage,
  onTakeControl,
  onRefresh
}) => {
  return (
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
              onSelectConversation={onSelectConversation}
              onRefresh={onRefresh}
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
              onSendMessage={onSendMessage}
              onTakeControl={onTakeControl}
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
                    onClick={onRefresh} 
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
  );
};
