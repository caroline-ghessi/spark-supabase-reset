
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Conversation } from '@/types/conversation';

interface LegacyConversationCardProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const LegacyConversationCard: React.FC<LegacyConversationCardProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  const getLeadBadgeStyles = (leadType: string) => {
    switch (leadType) {
      case 'hot':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warm':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'bot':
        return 'bg-blue-100 text-blue-800';
      case 'manual':
        return 'bg-green-100 text-green-800';
      case 'seller':
        return 'bg-purple-100 text-purple-800';
      case 'waiting':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadIcon = (leadType: string) => {
    switch (leadType) {
      case 'hot': return '🔥';
      case 'warm': return '🟡';
      case 'cold': return '🔵';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'bot': return 'Bot Ativo';
      case 'manual': return 'Manual';
      case 'seller': return 'Vendedor';
      case 'waiting': return 'Aguardando';
      case 'closed': return 'Finalizada';
      default: return status;
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {conversation.clientName?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">
                {conversation.clientName || 'Cliente'}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getLeadBadgeStyles(conversation.leadType)}`}>
                <span className="mr-1">{getLeadIcon(conversation.leadType)}</span>
                {conversation.leadType === 'hot' ? 'Quente' : conversation.leadType === 'warm' ? 'Morno' : 'Frio'}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conversation.clientPhone}
            </p>
            <p className="text-sm text-gray-600 truncate mt-1">
              {conversation.lastMessage || 'Sem mensagens'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadgeStyles(conversation.status)}`}>
            {getStatusLabel(conversation.status)}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            {conversation.lastMessageTime}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-xs rounded-full mt-1">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
