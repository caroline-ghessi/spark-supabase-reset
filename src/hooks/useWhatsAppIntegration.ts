
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealConversation {
  id: string;
  client_phone: string;
  client_name: string;
  status: 'bot' | 'manual' | 'seller' | 'waiting' | 'closed';
  lead_temperature: 'hot' | 'warm' | 'cold';
  source: string;
  dify_conversation_id?: string;
  potential_value?: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  assigned_seller_id?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface RealMessage {
  id: string;
  conversation_id: string;
  sender_type: 'client' | 'bot' | 'operator' | 'seller' | 'admin';
  sender_name: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  whatsapp_message_id?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata: any;
  created_at: string;
}

export const useWhatsAppIntegration = () => {
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, RealMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Listen to real-time changes
  useEffect(() => {
    const conversationsChannel = supabase
      .channel('conversations-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setConversations(prev => [payload.new as RealConversation, ...prev]);
          toast({
            title: "Nova Conversa",
            description: `Cliente: ${(payload.new as RealConversation).client_name}`,
          });
        } else if (payload.eventType === 'UPDATE') {
          setConversations(prev => 
            prev.map(conv => 
              conv.id === payload.new.id ? payload.new as RealConversation : conv
            )
          );
        }
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as RealMessage;
        setMessages(prev => ({
          ...prev,
          [newMessage.conversation_id]: [
            ...(prev[newMessage.conversation_id] || []),
            newMessage
          ]
        }));

        // Toast for new client messages
        if (newMessage.sender_type === 'client') {
          toast({
            title: "Nova Mensagem",
            description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}...`,
            className: "bg-blue-500 text-white",
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [toast]);

  const loadConversations = async () => {
    try {
      // Use RPC function to get conversations
      const { data, error } = await supabase
        .rpc('get_conversations');

      if (error) {
        console.error('Error loading conversations:', error);
        // Fallback to empty array
        setConversations([]);
      } else {
        setConversations(data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar conversas",
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Use RPC function to get messages - note parameter name is 'conv_id'
      const { data, error } = await supabase
        .rpc('get_messages', { conv_id: conversationId });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(prev => ({
          ...prev,
          [conversationId]: data || []
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar mensagens",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    try {
      const response = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          conversation_id: conversationId,
          message: message
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Mensagem Enviada",
        description: "Mensagem enviada com sucesso!",
        className: "bg-green-500 text-white",
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive",
      });
      throw error;
    }
  };

  const takeControl = async (conversationId: string) => {
    try {
      const response = await supabase.functions.invoke('take-control', {
        body: {
          conversation_id: conversationId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Controle Assumido",
        description: "Você assumiu o controle da conversa",
        className: "bg-orange-500 text-white",
      });

      return response.data;
    } catch (error) {
      console.error('Error taking control:', error);
      toast({
        title: "Erro",
        description: "Falha ao assumir controle",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    conversations,
    messages,
    loading,
    loadMessages,
    sendMessage,
    takeControl,
    loadConversations
  };
};
