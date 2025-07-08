
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Send, Phone, User, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { MediaMessage } from './chat/MediaMessage';

interface VendorMessage {
  id: string;
  text_content: string;
  is_from_seller: boolean;
  sent_at: string;
  status: string;
  seller_name?: string;
}

interface VendorConversation {
  conversation_id: string;
  client_phone: string;
  client_name: string | null;
  seller_name: string;
  conversation_status: string;
  last_message_at: string;
  total_messages: number;
  seller_messages: number;
  client_messages: number;
}

interface VendorChatInterfaceProps {
  conversation: VendorConversation;
  messages: VendorMessage[];
  onSendMessage: (message: string) => Promise<void>;
}

export const VendorChatInterface: React.FC<VendorChatInterfaceProps> = ({
  conversation,
  messages,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header da Conversa */}
      <div className="flex-shrink-0 border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {conversation.client_name || 'Cliente'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{conversation.client_phone}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">
              {conversation.seller_name}
            </Badge>
            <div className="text-xs text-gray-500 flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              {conversation.total_messages} mensagens
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Nenhuma mensagem ainda</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_from_seller ? 'justify-end' : 'justify-start'}`}
            >
              <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.is_from_seller
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.text_content ? (
                    <p className="text-sm">{message.text_content}</p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">[Mensagem de mídia]</p>
                  )}
                  
                  {/* Renderizar mídia se houver */}
                  {/* Note: vendor messages não têm file_url diretamente, mas têm media_url */}
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${
                      message.is_from_seller ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.sent_at)}
                    </span>
                    {message.is_from_seller && (
                      <Badge
                        variant="secondary"
                        className="text-xs ml-2"
                      >
                        {message.status}
                      </Badge>
                    )}
                  </div>
                </div>
            </div>
          ))
        )}
      </div>

      {/* Input de Nova Mensagem */}
      <div className="flex-shrink-0 border-t bg-white p-4">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Digite Enter para enviar, Shift+Enter para nova linha
        </div>
      </div>
    </div>
  );
};
