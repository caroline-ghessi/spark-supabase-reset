
import { useState, useEffect, useRef } from 'react';
import { X, Send, UserPlus, CheckCircle, User, Phone, MessageSquare } from 'lucide-react';
import { Conversation } from '../../types/conversation';
import { Message } from '../../types/message';
import { MessageBubble } from './MessageBubble';
import { SimpleTransferModal } from '../modals/SimpleTransferModal';
import { FinalizeModal } from '../modals/FinalizeModal';
import { Button } from '../ui/button';

interface ChatPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  onStatusChange: (conversationId: number, newStatus: Conversation['status']) => void;
  onClose: () => void;
}

export const ChatPanel = ({ conversation, messages, onStatusChange, onClose }: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Selecione uma conversa</p>
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

  const handleAssumeControl = () => {
    onStatusChange(conversation.id, 'manual');
  };

  const handleTransfer = (sellerId: string, notes: string) => {
    console.log('Transferindo para vendedor:', sellerId, 'Notas:', notes);
    onStatusChange(conversation.id, 'seller');
  };

  const handleFinalize = (reason: string, notes: string) => {
    console.log('Finalizando conversa:', reason, 'Notas:', notes);
    onStatusChange(conversation.id, 'waiting'); // Temporário, depois será 'finalized'
  };

  const getStatusColor = () => {
    switch (conversation.status) {
      case 'bot': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'manual': return 'bg-green-50 text-green-700 border-green-200';
      case 'seller': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'waiting': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (conversation.status) {
      case 'bot': return 'Bot Ativo';
      case 'manual': return 'Atendimento Manual';
      case 'seller': return `Vendedor: ${conversation.assignedSeller || 'Atribuído'}`;
      case 'waiting': return 'Aguardando';
      default: return 'Desconhecido';
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {conversation.clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{conversation.clientName}</h3>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{conversation.clientPhone}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleAssumeControl}
              disabled={conversation.status === 'manual'}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <User className="w-4 h-4" />
              <span>Assumir Controle</span>
            </Button>
            
            <Button
              onClick={() => setIsTransferModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Transferir</span>
            </Button>
            
            <Button
              onClick={() => setIsFinalizeModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finalizar</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Inicie a conversa ou aguarde mensagens do cliente</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-200 rounded-2xl px-4 py-2 rounded-bl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
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
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SimpleTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        conversation={conversation ? {
          id: conversation.id,
          conversationId: conversation.id.toString(), // Converter para string UUID
          clientName: conversation.clientName,
          clientPhone: conversation.clientPhone,
          leadType: conversation.leadType,
          status: conversation.status
        } : null}
        onTransfer={handleTransfer}
      />

      <FinalizeModal
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        conversation={conversation}
        onFinalize={handleFinalize}
      />
    </>
  );
};
