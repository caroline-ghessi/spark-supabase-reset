
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Phone, MessageSquare, Clock, RefreshCw } from 'lucide-react';

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

interface VendorConversationsListProps {
  conversations: VendorConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: VendorConversation) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const VendorConversationsList: React.FC<VendorConversationsListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onRefresh,
  loading = false
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Conversas dos Vendedores</h3>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.conversation_id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedConversationId === conversation.conversation_id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {conversation.client_name || 'Cliente'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="w-3 h-3 mr-1" />
                          <span className="truncate">{conversation.client_phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatTime(conversation.last_message_at)}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(conversation.whapi_status)}`}
                      >
                        {conversation.whapi_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-xs text-gray-600 truncate">
                      {conversation.last_message_text || 'Sem mensagens recentes'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {conversation.total_messages}
                      </span>
                      <span>Vendedor: {conversation.seller_name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
