
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealConversation, RealMessage } from '@/types/whatsapp';

interface UseWhatsAppRealtimeProps {
  setConversations: React.Dispatch<React.SetStateAction<RealConversation[]>>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, RealMessage[]>>>;
}

export const useWhatsAppRealtime = ({
  setConversations,
  setMessages
}: UseWhatsAppRealtimeProps) => {
  const { toast } = useToast();

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
          setConversations(prev => [newConversation, ...prev]);
          
          toast({
            title: "Nova Conversa",
            description: `Cliente: ${newConversation.client_name}`,
            className: "bg-green-500 text-white",
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedConversation = payload.new as RealConversation;
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updatedConversation.id ? updatedConversation : conv
            )
          );
        }
      })
      .subscribe((status) => {
        console.log('📡 Status conversations subscription:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conversations real-time ativo');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na subscription de conversas');
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
      .subscribe((status) => {
        console.log('📡 Status messages subscription:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Messages real-time ativo');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na subscription de mensagens');
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
  }, [setConversations, setMessages, toast]);
};
