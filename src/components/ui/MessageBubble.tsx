
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RealMessage } from '@/types/whatsapp';
import { Bot, User, MessageSquare } from 'lucide-react';

interface MessageBubbleProps {
  message: RealMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isFromClient = message.sender_type === 'client';
  const isFromBot = message.sender_type === 'bot';
  
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
      return 'bg-orange-500 text-white';
    }
  };

  return (
    <div className={`flex ${isFromClient ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getBubbleStyle()}`}>
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
        
        <p className="text-sm">{message.content}</p>
        
        {message.file_url && (
          <div className="mt-2">
            {message.message_type === 'image' ? (
              <img
                src={message.file_url}
                alt="Imagem"
                className="max-w-full h-auto rounded"
              />
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                📎 {message.file_name || 'Arquivo'}
              </a>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs opacity-60">
            {message.status === 'sent' && '✓'}
            {message.status === 'delivered' && '✓✓'}
            {message.status === 'read' && '✓✓'}
            {message.status === 'failed' && '❌'}
          </span>
        </div>
      </div>
    </div>
  );
};
