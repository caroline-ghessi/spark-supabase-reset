
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, RefreshCw, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { VendorSection } from './VendorSection';

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState(false);

  // Agrupar conversas por vendedor
  const conversationsByVendor = conversations.reduce((acc, conversation) => {
    const vendorName = conversation.seller_name || 'Vendedor Desconhecido';
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(conversation);
    return acc;
  }, {} as Record<string, VendorConversation[]>);

  // Ordenar vendedores por número de conversas (descendente)
  const sortedVendors = Object.entries(conversationsByVendor)
    .sort(([, a], [, b]) => b.length - a.length);

  const handleToggleSection = (vendorName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [vendorName]: !prev[vendorName]
    }));
  };

  const handleExpandAll = () => {
    const newExpandAll = !expandAll;
    setExpandAll(newExpandAll);
    
    const newOpenSections: Record<string, boolean> = {};
    sortedVendors.forEach(([vendorName]) => {
      newOpenSections[vendorName] = newExpandAll;
    });
    setOpenSections(newOpenSections);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Conversas por Vendedor</h3>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {sortedVendors.length} vendedores • {conversations.length} conversas
          </span>
          <Button
            onClick={handleExpandAll}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {expandAll ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Recolher Tudo
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Expandir Tudo
              </>
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            sortedVendors.map(([vendorName, vendorConversations]) => (
              <VendorSection
                key={vendorName}
                sellerName={vendorName}
                conversations={vendorConversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={onSelectConversation}
                isOpen={openSections[vendorName] || false}
                onToggle={() => handleToggleSection(vendorName)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
