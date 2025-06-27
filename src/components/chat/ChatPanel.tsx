
import { useState } from 'react';
import { X, Send, UserPlus, CheckCircle, User } from 'lucide-react';
import { Conversation } from '../../types/conversation';
import { Message } from '../../types/message';
import { MessageBubble } from './MessageBubble';

interface ChatPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  onStatusChange: (conversationId: number, newStatus: string) => void;
  onClose: () => void;
}

export const ChatPanel = ({ conversation, messages, onStatusChange, onClose }: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState('');

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Selecione uma conversa</p>
          <p className="text-sm">Escolha uma conversa da lista para visualizar</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aqui implementaremos o envio da mensagem
      console.log('Enviando mensagem:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-600">
                {conversation.clientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{conversation.clientName}</h3>
              <p className="text-sm text-gray-500">{conversation.clientPhone}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onStatusChange(conversation.id, 'manual')}
            className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Assumir Controle</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors">
            <UserPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Transferir</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Finalizar</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            rows={2}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
