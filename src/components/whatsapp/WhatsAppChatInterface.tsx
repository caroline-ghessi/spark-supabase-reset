import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { RealConversation, RealMessage } from '@/types/whatsapp';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WhatsAppChatInterfaceProps {
  conversation: RealConversation;
  messages: RealMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onTakeControl: () => Promise<void>;
}

export const WhatsAppChatInterface: React.FC<WhatsAppChatInterfaceProps> = ({
  conversation,
  messages,
  onSendMessage,
  onTakeControl
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [takingControl, setTakingControl] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleTakeControl = async () => {
    setTakingControl(true);
    try {
      await onTakeControl();
    } catch (error) {
      console.error('Erro ao assumir controle:', error);
    } finally {
      setTakingControl(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bot': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      case 'seller': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemperatureColor = (temperature: string) => {
    switch (temperature) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'client': return <User className="w-4 h-4" />;
      case 'bot': return <Bot className="w-4 h-4" />;
      case 'operator': case 'admin': return <MessageSquare className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header da Conversa */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{conversation.client_name}</CardTitle>
            <p className="text-sm text-gray-600">{conversation.client_phone}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getTemperatureColor(conversation.lead_temperature)}>
              {conversation.lead_temperature === 'hot' ? '🔥 Quente' :
               conversation.lead_temperature === 'warm' ? '🟡 Morno' : '🔵 Frio'}
            </Badge>
            <Badge className={getStatusColor(conversation.status)}>
              {conversation.status === 'bot' ? '🤖 Bot' :
               conversation.status === 'manual' ? '👤 Manual' :
               conversation.status === 'waiting' ? '⏳ Aguardando' : conversation.status}
            </Badge>
          </div>
        </div>

        {/* Botão Assumir Controle */}
        {conversation.status !== 'manual' && (
          <Button
            onClick={handleTakeControl}
            disabled={takingControl}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {takingControl ? 'Assumindo...' : '👆 Assumir Controle'}
          </Button>
        )}

        {conversation.status === 'manual' && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Você está no controle desta conversa</span>
          </div>
        )}
      </CardHeader>

      {/* Área de Mensagens */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

          {/* Input de Mensagem */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  conversation.status === 'manual'
                    ? "Digite sua mensagem..."
                    : "Assuma o controle para enviar mensagens"
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sending || conversation.status !== 'manual'}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sending || conversation.status !== 'manual'}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {sending ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {conversation.status !== 'manual' && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Assuma o controle da conversa para poder enviar mensagens
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
