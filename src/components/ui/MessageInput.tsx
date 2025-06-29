
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useOptimisticMessages } from '@/hooks/useOptimisticMessages';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onSendMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addOptimisticMessage, removeOptimisticMessage } = useOptimisticMessages(conversationId);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || sending || disabled) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    // Adicionar mensagem otimista
    const tempId = addOptimisticMessage(messageText);

    try {
      await onSendMessage(messageText);
      // Remover mensagem otimista após sucesso
      setTimeout(() => removeOptimisticMessage(tempId), 500);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Restaurar mensagem em caso de erro
      setMessage(messageText);
      removeOptimisticMessage(tempId);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2 items-end">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Assuma o controle para enviar mensagens" : "Digite sua mensagem..."}
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[40px] max-h-[120px] overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || sending || disabled}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 min-w-[80px] h-[40px]"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Enviando</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </>
          )}
        </button>
      </div>
      
      {disabled && (
        <p className="text-xs text-gray-500">
          💡 Assuma o controle da conversa para poder enviar mensagens
        </p>
      )}
    </div>
  );
};
