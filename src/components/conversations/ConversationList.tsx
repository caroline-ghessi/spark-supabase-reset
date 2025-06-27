
import { useState } from 'react';
import { Search, Filter, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { Conversation } from '../../types/conversation';
import { ConversationCard } from './ConversationCard';

interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
}

export const ConversationList = ({ 
  conversations, 
  onConversationSelect, 
  selectedConversation 
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leadTypeFilter, setLeadTypeFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.clientPhone.includes(searchTerm) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    const matchesLeadType = leadTypeFilter === 'all' || conv.leadType === leadTypeFilter;
    return matchesSearch && matchesStatus && matchesLeadType;
  });

  // Count conversations by status
  const statusCounts = conversations.reduce((acc, conv) => {
    acc[conv.status] = (acc[conv.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count conversations by lead type
  const leadTypeCounts = conversations.reduce((acc, conv) => {
    acc[conv.leadType] = (acc[conv.leadType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Conversas Ativas</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredConversations.length} de {conversations.length}
            </span>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-md transition-colors ${
                showAdvancedFilters 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Basic Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos Status ({conversations.length})</option>
              <option value="bot">Bot Ativo ({statusCounts.bot || 0})</option>
              <option value="manual">Manual ({statusCounts.manual || 0})</option>
              <option value="seller">Vendedor ({statusCounts.seller || 0})</option>
              <option value="waiting">Aguardando ({statusCounts.waiting || 0})</option>
            </select>
          </div>

          <select
            value={leadTypeFilter}
            onChange={(e) => setLeadTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Todos Leads</option>
            <option value="hot">🔥 Quente ({leadTypeCounts.hot || 0})</option>
            <option value="warm">🟡 Morno ({leadTypeCounts.warm || 0})</option>
            <option value="cold">🔵 Frio ({leadTypeCounts.cold || 0})</option>
          </select>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros Avançados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mensagens não lidas</label>
                <select className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm">
                  <option value="all">Todas</option>
                  <option value="unread">Apenas não lidas</option>
                  <option value="read">Apenas lidas</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tempo</label>
                <select className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm">
                  <option value="all">Todos os períodos</option>
                  <option value="today">Hoje</option>
                  <option value="yesterday">Ontem</option>
                  <option value="week">Última semana</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nenhuma conversa encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou buscar por outros termos</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => onConversationSelect(conversation)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
