
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Phone } from 'lucide-react';
import { RealConversation } from '@/types/whatsapp';

interface ChatHeaderProps {
  conversation: RealConversation;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
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

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">{conversation.client_name}</h3>
        <p className="text-sm text-gray-600">{conversation.client_phone}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={getTemperatureColor(conversation.lead_temperature)}>
          {conversation.lead_temperature === 'hot' ? '🔥 Quente' :
           conversation.lead_temperature === 'warm' ? '🟡 Morno' : '🔵 Frio'}
        </Badge>
        <Badge className={getStatusColor(conversation.status)}>
          {conversation.status === 'bot' ? '🤖 Bot' :
           conversation.status === 'manual' ? '👤 Manual' :
           conversation.status === 'waiting' ? '⏳ Aguardando' : conversation.status}
        </Badge>
      </div>
    </div>
  );
};
