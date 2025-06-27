
import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { ConversationCard } from './ConversationCard';
import { EmptyState } from '../ui/EmptyState';
import { RealConversation } from '@/types/whatsapp';

interface ConversationsListProps {
  conversations: RealConversation[];
  selectedConversation: RealConversation | null;
  onSelectConversation: (conversation: RealConversation) => void;
  loading: boolean;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading
}) => {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversas Ativas</h2>
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            {conversations.length} ativas
          </span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <EmptyState 
            message="Nenhuma conversa ativa"
            subtitle="As conversas aparecerão aqui quando os clientes enviarem mensagens"
          />
        ) : (
          conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
};
