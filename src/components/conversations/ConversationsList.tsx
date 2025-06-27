
import React, { useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { ConversationCard } from './ConversationCard';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leadTypeFilter, setLeadTypeFilter] = useState('all');

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = 
      conv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.client_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    const matchesLeadType = leadTypeFilter === 'all' || conv.lead_temperature === leadTypeFilter;
    
    return matchesSearch && matchesStatus && matchesLeadType;
  });

  // Count conversations by status
  const statusCounts = conversations.reduce((acc, conv) => {
    acc[conv.status] = (acc[conv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const leadTypeCounts = conversations.reduce((acc, conv) => {
    acc[conv.lead_temperature] = (acc[conv.lead_temperature] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
        
        {/* Filtros */}
        <div className="flex space-x-2 mb-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todos Status ({conversations.length})</option>
            <option value="bot">Bot Ativo ({statusCounts.bot || 0})</option>
            <option value="manual">Manual ({statusCounts.manual || 0})</option>
            <option value="seller">Vendedor ({statusCounts.seller || 0})</option>
            <option value="waiting">Aguardando ({statusCounts.waiting || 0})</option>
          </select>
          
          <select 
            value={leadTypeFilter}
            onChange={(e) => setLeadTypeFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todos Leads</option>
            <option value="hot">🔥 Quente ({leadTypeCounts.hot || 0})</option>
            <option value="warm">🟡 Morno ({leadTypeCounts.warm || 0})</option>
            <option value="cold">🔵 Frio ({leadTypeCounts.cold || 0})</option>
          </select>
        </div>
        
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>
      
      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Carregando conversas...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="font-medium">Nenhuma conversa encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou buscar por outros termos</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
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
