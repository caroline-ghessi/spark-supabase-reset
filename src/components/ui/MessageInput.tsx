
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useOptimisticMessages } from '@/hooks/useOptimisticMessages';
import { EmojiPicker } from './EmojiPicker';
import { replaceShortcutsWithEmojis, endsWithShortcut } from '@/utils/emojiShortcuts';

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

  // Função para inserir emoji na posição do cursor
  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = message;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const newText = before + emoji + after;
    setMessage(newText);
    
    // Reposicionar cursor após o emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending || disabled) return;

    let messageText = message.trim();
    
    // Aplicar atalhos de emoji antes de enviar
    messageText = replaceShortcutsWithEmojis(messageText);
    
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Auto-substituir atalhos de emoji quando o usuário digita espaço
    if (newValue.endsWith(' ')) {
      const shortcut = endsWithShortcut(newValue.slice(0, -1));
      if (shortcut) {
        const replacedText = replaceShortcutsWithEmojis(newValue);
        if (replacedText !== newValue) {
          setMessage(replacedText);
        }
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Assuma o controle para enviar mensagens" : "Digite sua mensagem..."}
            rows={1}
            disabled={disabled}
            className="w-full pl-3 pr-20 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[40px] max-h-[120px] overflow-y-auto"
            style={{ scrollbarWidth: 'thin' }}
          />
          
          {/* Botões flutuantes dentro do campo */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <EmojiPicker onEmojiSelect={insertEmoji} />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
              type="button"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
      
      {/* Dica de atalhos */}
      <div className="text-xs text-gray-400">
        Enter para enviar • Shift+Enter para quebra de linha • :) :D <3 para emojis
      </div>
    </div>
  );
};
