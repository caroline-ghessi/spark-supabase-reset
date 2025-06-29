
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealConversation, RealMessage } from '@/types/whatsapp';
import { useNotificationSound } from './useNotificationSound';

interface UseWhatsAppRealtimeProps {
  setConversations: React.Dispatch<React.SetStateAction<RealConversation[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, RealMessage[]>>>;
  selectedConversation?: RealConversation | null;
  onConversationUpdate?: (conversation: RealConversation) => void;
}

export const useWhatsAppRealtime = ({
  setConversations,
  setMessages,
  selectedConversation,
  onConversationUpdate
}: UseWhatsAppRealtimeProps) => {
  const { toast } = useToast();
  const { playSound } = useNotificationSound();

  useEffect(() => {
    console.log('🔌 Inicializando real-time subscriptions...');

    const conversationsChannel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        console.log('🔄 Mudança na conversa:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newConversation = payload.new as RealConversation;
          setConversations(prev => {
            const exists = prev.some(conv => conv.id === newConversation.id);
            if (exists) return prev;
            return [newConversation, ...prev];
          });
          
          playSound();
          toast({
            title: "Nova Conversa",
            description: `Cliente: ${newConversation.client_name}`,
            className: "bg-green-500 text-white",
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedConversation = payload.new as RealConversation;
          console.log('🔄 Conversa atualizada:', updatedConversation.id, updatedConversation.status);
          
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updatedConversation.id ? updatedConversation : conv
            )
          );

          if (onConversationUpdate) {
            onConversationUpdate(updatedConversation);
          }

          if (selectedConversation && updatedConversation.id === selectedConversation.id) {
            if (updatedConversation.status === 'manual') {
              toast({
                title: "Controle Assumido",
                description: "Você assumiu o controle da conversa",
                className: "bg-orange-500 text-white",
              });
            }
          }
        }
      })
      .subscribe((status) => {
        console.log('📡 Status conversations subscription:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conversations real-time ativo');
        }
      });

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('💬 Nova mensagem real-time:', payload.new);
        const newMessage = payload.new as RealMessage;
        
        setMessages(prev => {
          const conversationMessages = prev[newMessage.conversation_id] || [];
          const messageExists = conversationMessages.some(msg => msg.id === newMessage.id);
          
          if (messageExists) return prev;
          
          const updatedMessages = [...conversationMessages, newMessage]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

          return {
            ...prev,
            [newMessage.conversation_id]: updatedMessages
          };
        });

        // Som e toast apenas para mensagens de clientes
        if (newMessage.sender_type === 'client') {
          playSound();
          toast({
            title: "Nova Mensagem",
            description: `${newMessage.sender_name}: ${newMessage.content.substring(0, 50)}...`,
            className: "bg-blue-500 text-white",
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('🔄 Mensagem atualizada:', payload.new);
        const updatedMessage = payload.new as RealMessage;
        
        setMessages(prev => ({
          ...prev,
          [updatedMessage.conversation_id]: (prev[updatedMessage.conversation_id] || [])
            .map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        }));
      })
      .subscribe((status) => {
        console.log('📡 Status messages subscription:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Messages real-time ativo');
        }
      });

    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        console.log('🔔 Nova notificação:', payload.new);
        const notification = payload.new as any;
        
        playSound();
        toast({
          title: notification.title,
          description: notification.message,
          className: notification.priority === 'high' ? "bg-red-500 text-white" : "bg-blue-500 text-white",
        });
      })
      .subscribe((status) => {
        console.log('📡 Status notifications subscription:', status);
      });

    return () => {
      console.log('🔌 Removendo real-time subscriptions...');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [setConversations, setMessages, toast, selectedConversation, onConversationUpdate, playSound]);
};
