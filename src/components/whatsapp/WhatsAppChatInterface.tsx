
import React from 'react';
import { RealConversation, RealMessage } from '@/types/whatsapp';
import { ChatHeader } from './chat/ChatHeader';
import { TakeControlSection } from './chat/TakeControlSection';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';

interface WhatsAppChatInterfaceProps {
  conversation: RealConversation;
  messages: RealMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onTakeControl: () => Promise<void>;
}

export const WhatsAppChatInterface: React.FC<WhatsAppChatInterfaceProps> = ({
  conversation,
  messages,
  onSendMessage,
  onTakeControl
}) => {
  return (
    <div className="h-full flex flex-col max-h-full">
      {/* Header da Conversa - altura fixa */}
      <div className="flex-shrink-0 border-b bg-white p-4">
        <ChatHeader conversation={conversation} />
        <TakeControlSection 
          conversation={conversation} 
          onTakeControl={onTakeControl} 
        />
      </div>

      {/* Área de Mensagens */}
      <ChatMessages messages={messages} />

      {/* Input de Mensagem */}
      <ChatInput 
        onSendMessage={onSendMessage}
        disabled={conversation.status !== 'manual'}
      />
    </div>
  );
};
