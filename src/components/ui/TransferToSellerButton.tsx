
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { SimpleTransferModal } from '../modals/SimpleTransferModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealConversation } from '@/types/whatsapp';

interface TransferToSellerButtonProps {
  conversationId: string;
  conversation?: RealConversation;
}

export const TransferToSellerButton: React.FC<TransferToSellerButtonProps> = ({
  conversationId,
  conversation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const handleTransfer = async (sellerId: string, notes: string) => {
    try {
      const response = await supabase.functions.invoke('transfer-to-seller', {
        body: {
          conversation_id: conversationId,
          seller_id: sellerId,
          transfer_note: notes
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Transferência Realizada",
        description: `Cliente transferido com sucesso! O vendedor será notificado via WhatsApp.`,
        className: "bg-green-500 text-white",
      });

    } catch (error) {
      console.error('❌ Erro na transferência:', error);
      toast({
        title: "Erro na Transferência",
        description: error instanceof Error ? error.message : "Falha ao transferir cliente",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        <span>Transferir</span>
      </button>

      <SimpleTransferModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        conversation={conversation ? {
          id: parseInt(conversation.id),
          conversationId: conversation.id, // UUID real da conversa
          clientName: conversation.client_name || 'Não informado',
          clientPhone: conversation.client_phone,
          leadType: conversation.lead_temperature,
          status: conversation.status
        } : null}
        onTransfer={handleTransfer}
      />
    </>
  );
};
