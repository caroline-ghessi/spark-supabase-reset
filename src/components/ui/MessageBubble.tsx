
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RealMessage } from '@/types/whatsapp';
import { Bot, User, MessageSquare, Clock } from 'lucide-react';
import { MediaMessage } from '../whatsapp/chat/MediaMessage';

interface MessageBubbleProps {
  message: RealMessage & { isOptimistic?: boolean };
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isFromClient = message.sender_type === 'client';
  const isFromBot = message.sender_type === 'bot';
  const isOptimistic = message.isOptimistic || false;
  
  const getSenderIcon = () => {
    switch (message.sender_type) {
      case 'client': return <User className="w-4 h-4" />;
      case 'bot': return <Bot className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getBubbleStyle = () => {
    if (isFromClient) {
      return 'bg-gray-100 text-gray-900';
    } else if (isFromBot) {
      return 'bg-blue-100 text-blue-900';
    } else {
      return `bg-orange-500 text-white ${isOptimistic ? 'opacity-70' : ''}`;
    }
  };

  const getStatusIcon = () => {
    if (isOptimistic || message.status === 'sending') {
      return <Clock className="w-3 h-3 animate-pulse" />;
    }
    
    switch (message.status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'failed': return '❌';
      default: return null;
    }
  };

  return (
    <div className={`flex ${isFromClient ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getBubbleStyle()} transition-opacity duration-200`}>
        <div className="flex items-center space-x-2 mb-1">
          {getSenderIcon()}
          <span className="text-xs font-medium">
            {message.sender_name}
          </span>
          <span className="text-xs opacity-70">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </span>
        </div>
        
        {message.message_type === 'text' ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div>
            {message.content && message.content !== '[Mídia]' && (
              <p className="text-sm mb-2">{message.content}</p>
            )}
            {message.file_url && (
              <MediaMessage
                messageType={message.message_type}
                fileUrl={message.file_url}
                fileName={message.file_name}
                fileSize={message.file_size}
                content={message.content}
                metadata={message.metadata}
              />
            )}
          </div>
        )}
        
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs opacity-60 flex items-center space-x-1">
            {isOptimistic && <span>Enviando</span>}
            {getStatusIcon()}
          </span>
        </div>
      </div>
    </div>
  );
};
