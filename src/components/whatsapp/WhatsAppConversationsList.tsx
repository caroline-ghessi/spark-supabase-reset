import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, User, Clock, RefreshCw } from 'lucide-react';
import { RealConversation } from '@/types/whatsapp';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WhatsAppConversationsListProps {
  conversations: RealConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: RealConversation) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const WhatsAppConversationsList: React.FC<WhatsAppConversationsListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onRefresh,
  loading
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bot': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'seller': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'bot': return <Bot className="w-4 h-4" />;
      case 'manual': return <User className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Conversas WhatsApp</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {conversations.length} conversas ativas
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Carregando conversas...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma conversa ativa</p>
              <p className="text-xs mt-1">
                As conversas aparecerão aqui quando os clientes enviarem mensagens
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversationId === conversation.id
                      ? 'bg-orange-50 border-l-4 border-l-orange-500'
                      : ''
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {conversation.client_name}
                        </h4>
                        <Badge className={getTemperatureColor(conversation.lead_temperature)}>
                          {conversation.lead_temperature === 'hot' ? '🔥' :
                           conversation.lead_temperature === 'warm' ? '🟡' : '🔵'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {conversation.client_phone}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(conversation.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(conversation.status)}
                        <span>
                          {conversation.status === 'bot' ? 'Bot' :
                           conversation.status === 'manual' ? 'Manual' :
                           conversation.status === 'waiting' ? 'Aguardando' :
                           conversation.status}
                        </span>
                      </div>
                    </Badge>
                    
                    {conversation.priority === 'critical' && (
                      <Badge className="bg-red-100 text-red-800">
                        🚨 Crítico
                      </Badge>
                    )}
                    
                    {conversation.priority === 'high' && (
                      <Badge className="bg-orange-100 text-orange-800">
                        ⚡ Alto
                      </Badge>
                    )}
                  </div>
                  
                  {conversation.potential_value && (
                    <div className="mt-2 text-xs text-green-600">
                      💰 Valor Potencial: R$ {conversation.potential_value.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
