import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MessageSquare, TrendingUp, Users, Activity } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  avg_quality_score?: number;
}

interface VendorSectionProps {
  sellerName: string;
  conversations: VendorConversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: VendorConversation) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const VendorSection: React.FC<VendorSectionProps> = ({
  sellerName,
  conversations,
  selectedConversationId,
  onSelectConversation,
  isOpen,
  onToggle
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

  // Calcular estatísticas do vendedor
  const stats = {
    totalConversations: conversations.length,
    totalMessages: conversations.reduce((sum, c) => sum + (c.total_messages || 0), 0),
    avgQuality: conversations.length > 0 
      ? conversations.reduce((sum, c) => sum + (c.avg_quality_score || 0), 0) / conversations.length 
      : 0
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{sellerName}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {stats.totalConversations} conversas
                  </span>
                  <span className="flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    {stats.totalMessages} mensagens
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Qualidade: {stats.avgQuality.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.totalConversations}
              </Badge>
              <div className={`transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                ▶
              </div>
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="space-y-2 pl-4">
          {conversations.map((conversation) => (
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
                      className="text-xs bg-green-100 text-green-800"
                    >
                      Via Rodri.GO
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
                    {conversation.avg_quality_score && (
                      <span className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {conversation.avg_quality_score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};