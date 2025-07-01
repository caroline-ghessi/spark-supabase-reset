
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Bot, User } from 'lucide-react';
import { RealMessage } from '@/types/whatsapp';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessagesProps {
  messages: RealMessage[];
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'client': return <User className="w-4 h-4" />;
      case 'bot': return <Bot className="w-4 h-4" />;
      case 'operator': case 'admin': return <MessageSquare className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 max-h-[calc(100vh-350px)]">
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 h-full"
        style={{ maxHeight: 'calc(100vh - 350px)' }}
      >
        <div className="p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma mensagem ainda</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'client' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender_type === 'client'
                        ? 'bg-gray-100 text-gray-900'
                        : msg.sender_type === 'bot'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getSenderIcon(msg.sender_type)}
                      <span className="text-xs font-medium">
                        {msg.sender_name}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm">{msg.content}</p>
                    
                    {msg.file_url && (
                      <div className="mt-2">
                        {msg.message_type === 'image' ? (
                          <img
                            src={msg.file_url}
                            alt="Imagem"
                            className="max-w-full h-auto rounded"
                          />
                        ) : (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            📎 {msg.file_name || 'Arquivo'}
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end mt-1">
                      <span className="text-xs opacity-60">
                        {msg.status === 'sent' && '✓'}
                        {msg.status === 'delivered' && '✓✓'}
                        {msg.status === 'read' && '✓✓'}
                        {msg.status === 'failed' && '❌'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
