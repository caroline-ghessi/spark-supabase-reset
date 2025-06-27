
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
  }, [setConversations, setMessages, toast]);
};
