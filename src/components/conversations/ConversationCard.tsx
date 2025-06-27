
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RealConversation } from '@/types/whatsapp';
import { LeadBadge } from '../ui/LeadBadge';
import { StatusBadge } from '../ui/StatusBadge';

interface ConversationCardProps {
  conversation: RealConversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
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
              {conversation.client_name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">
                {conversation.client_name || 'Cliente'}
              </h3>
              <LeadBadge type={conversation.lead_temperature} />
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conversation.client_phone}
            </p>
            <p className="text-sm text-gray-600 truncate mt-1">
              {/* Will show last message when available */}
              Conversa ativa
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <StatusBadge status={conversation.status} />
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(conversation.updated_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
          {conversation.priority === 'critical' && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full mt-1">
              🚨
            </span>
          )}
          {conversation.priority === 'high' && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-xs rounded-full mt-1">
              ⚡
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
