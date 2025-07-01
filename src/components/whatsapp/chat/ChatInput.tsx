
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Clock } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-shrink-0 border-t bg-white p-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            disabled
              ? "Assuma o controle para enviar mensagens"
              : "Digite sua mensagem..."
          }
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={sending || disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || sending || disabled}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {sending ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      {disabled && (
        <p className="text-xs text-gray-500 mt-2">
          💡 Assuma o controle da conversa para poder enviar mensagens
        </p>
      )}
    </div>
  );
};
