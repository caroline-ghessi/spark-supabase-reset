
import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical } from 'lucide-react';
import { RealConversation, RealMessage } from '@/types/whatsapp';
import { TakeControlButton } from '../ui/TakeControlButton';
import { TransferToSellerButton } from '../ui/TransferToSellerButton';
import { MessageBubble } from '../ui/MessageBubble';
import { MessageInput } from '../ui/MessageInput';

interface ChatInterfaceProps {
  conversation: RealConversation;
  messages: RealMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onTakeControl: () => Promise<void>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  messages,
  onSendMessage,
  onTakeControl
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-600">
                {conversation.client_name?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{conversation.client_name}</h3>
              <p className="text-sm text-gray-500">{conversation.client_phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TakeControlButton 
              conversationId={conversation.id}
              currentStatus={conversation.status}
              onTakeControl={onTakeControl}
            />
            <TransferToSellerButton conversationId={conversation.id} />
            <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="font-medium">Nenhuma mensagem ainda</p>
            <p className="text-sm">Inicie a conversa ou aguarde mensagens do cliente</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <MessageInput 
          conversationId={conversation.id}
          onSendMessage={onSendMessage}
          disabled={conversation.status !== 'manual'}
        />
      </div>
    </div>
  );
};
