
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Phone } from 'lucide-react';
import { RealConversation } from '@/types/whatsapp';
import { TransferToSellerButton } from '@/components/ui/TransferToSellerButton';

interface TakeControlSectionProps {
  conversation: RealConversation;
  onTakeControl: () => Promise<void>;
}

export const TakeControlSection: React.FC<TakeControlSectionProps> = ({
  conversation,
  onTakeControl
}) => {
  const [takingControl, setTakingControl] = useState(false);

  const handleTakeControl = async () => {
    setTakingControl(true);
    try {
      await onTakeControl();
    } catch (error) {
      console.error('Erro ao assumir controle:', error);
    } finally {
      setTakingControl(false);
    }
  };

  if (conversation.status === 'manual') {
    return (
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Você está no controle desta conversa</span>
          <span className="text-sm text-gray-500 ml-4">
            • {conversation.client_name} ({conversation.client_phone})
          </span>
        </div>
        <TransferToSellerButton 
          conversationId={conversation.id} 
          conversation={conversation}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{conversation.client_name}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{conversation.client_phone}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleTakeControl}
          disabled={takingControl}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {takingControl ? 'Assumindo...' : '👆 Assumir Controle'}
        </Button>
        <TransferToSellerButton 
          conversationId={conversation.id} 
          conversation={conversation}
        />
      </div>
    </div>
  );
};
