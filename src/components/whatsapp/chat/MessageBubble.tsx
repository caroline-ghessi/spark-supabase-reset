
import React from 'react';
import { MessageSquare, Bot, User } from 'lucide-react';
import { RealMessage } from '@/types/whatsapp';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MediaMessage } from './MediaMessage';

interface MessageBubbleProps {
  message: RealMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'client': return <User className="w-4 h-4" />;
      case 'bot': return <Bot className="w-4 h-4" />;
      case 'operator': case 'admin': return <MessageSquare className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getBubbleStyle = () => {
    if (message.sender_type === 'client') {
      return 'bg-gray-100 text-gray-900';
    } else if (message.sender_type === 'bot') {
      return 'bg-blue-100 text-blue-900';
    } else {
      return 'bg-orange-500 text-white';
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'failed': return '❌';
      default: return null;
    }
  };

  return (
    <div className={`flex ${message.sender_type === 'client' ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getBubbleStyle()}`}>
        <div className="flex items-center space-x-2 mb-1">
          {getSenderIcon(message.sender_type)}
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
          <span className="text-xs opacity-60">
            {getStatusIcon()}
          </span>
        </div>
      </div>
    </div>
  );
};
