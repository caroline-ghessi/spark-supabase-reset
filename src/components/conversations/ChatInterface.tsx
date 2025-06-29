
import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import { RealConversation, RealMessage } from '@/types/whatsapp';
import { TakeControlButton } from '../ui/TakeControlButton';
import { TransferToSellerButton } from '../ui/TransferToSellerButton';
import { MessageBubble } from '../ui/MessageBubble';
import { MessageInput } from '../ui/MessageInput';
import { useOptimisticMessages } from '@/hooks/useOptimisticMessages';

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
  const [isManualControl, setIsManualControl] = useState(conversation.status === 'manual');
  const { optimisticMessages, clearOptimisticMessages } = useOptimisticMessages(conversation.id);

  // Sincronizar estado local com mudanças na conversa
  useEffect(() => {
    console.log('🔄 Status da conversa mudou:', conversation.status);
    setIsManualControl(conversation.status === 'manual');
  }, [conversation.status]);

  // Combinar mensagens reais com otimistas
  const allMessages = React.useMemo(() => {
    const combined = [...messages, ...optimisticMessages]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return combined;
  }, [messages, optimisticMessages]);

  // Auto-scroll para última mensagem com delay para animação suave
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [allMessages]);

  // Limpar mensagens otimistas quando conversa muda
  useEffect(() => {
    return () => clearOptimisticMessages();
  }, [conversation.id, clearOptimisticMessages]);

  const handleTakeControl = async () => {
    console.log('🎯 Assumindo controle via ChatInterface');
    try {
      await onTakeControl();
    } catch (error) {
      console.error('❌ Erro ao assumir controle:', error);
    }
  };

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
              <p className="text-xs text-gray-400">
                Status: {conversation.status} | Local: {isManualControl ? 'manual' : 'não-manual'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TakeControlButton 
              conversationId={conversation.id}
              currentStatus={conversation.status}
              onTakeControl={handleTakeControl}
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
        {allMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="font-medium">Nenhuma mensagem ainda</p>
            <p className="text-sm">Inicie a conversa ou aguarde mensagens do cliente</p>
          </div>
        ) : (
          allMessages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message as RealMessage & { isOptimistic?: boolean }}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <MessageInput 
          conversationId={conversation.id}
          onSendMessage={onSendMessage}
          disabled={!isManualControl}
        />
        {!isManualControl && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Status atual: {conversation.status} - Assuma o controle para enviar mensagens
          </p>
        )}
      </div>
    </div>
  );
};
