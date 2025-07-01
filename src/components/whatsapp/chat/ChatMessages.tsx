
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RealMessage } from '@/types/whatsapp';
import { MessageBubble } from './MessageBubble';
import { EmptyMessagesState } from './EmptyMessagesState';

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
              <EmptyMessagesState />
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
