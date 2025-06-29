
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDismissedNotifications } from './useDismissedNotifications';

interface RealNotification {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  icone: string;
  timestamp: string;
  lida: boolean;
  fixada: boolean;
  contexto?: {
    cliente?: string;
    telefone?: string;
    valorPotencial?: number;
    probabilidadeConversao?: number;
    tempoEspera?: number;
  };
  acao?: {
    tipo: string;
    dados: any;
  };
}

export const useRealNotifications = () => {
  const [notifications, setNotifications] = useState<RealNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { isNotificationDismissed } = useDismissedNotifications();

  const generateNotificationFromConversation = useCallback((conversation: any): RealNotification | null => {
    const now = new Date();
    const lastMessageTime = conversation.last_message_at ? new Date(conversation.last_message_at) : null;
    const minutesSinceLastMessage = lastMessageTime ? 
      Math.floor((now.getTime() - lastMessageTime.getTime()) / (1000 * 60)) : 0;

    // Definir prioridade baseada na temperatura do lead e valor potencial
    let prioridade: 'critica' | 'alta' | 'media' | 'baixa' = 'media';
    if (conversation.lead_temperature === 'hot' || conversation.potential_value > 10000) {
      prioridade = 'critica';
    } else if (conversation.lead_temperature === 'warm' || conversation.potential_value > 5000) {
      prioridade = 'alta';
    } else if (conversation.lead_temperature === 'cold') {
      prioridade = 'baixa';
    }

    // Gerar diferentes tipos de notificação baseados no estado da conversa
    if (conversation.status === 'waiting_human' && minutesSinceLastMessage > 15) {
      return {
        id: `waiting-${conversation.id}`,
        tipo: 'cliente_aguardando',
        titulo: 'Cliente aguardando resposta',
        mensagem: `${conversation.client_name || conversation.client_phone} está aguardando há ${minutesSinceLastMessage} minutos`,
        prioridade,
        icone: 'clock',
        timestamp: new Date().toISOString(),
        lida: false,
        fixada: false,
        contexto: {
          cliente: conversation.client_name || conversation.client_phone,
          telefone: conversation.client_phone,
          valorPotencial: conversation.potential_value,
          tempoEspera: minutesSinceLastMessage
        },
        acao: {
          tipo: 'abrir_conversa',
          dados: { conversationId: conversation.id }
        }
      };
    }

    if (conversation.lead_temperature === 'hot' && conversation.status === 'bot' && minutesSinceLastMessage > 5) {
      return {
        id: `hot-lead-${conversation.id}`,
        tipo: 'lead_quente',
        titulo: 'Lead quente precisa de atenção',
        mensagem: `Cliente ${conversation.client_name || conversation.client_phone} demonstrou alto interesse`,
        prioridade: 'critica',
        icone: 'user-plus',
        timestamp: new Date().toISOString(),
        lida: false,
        fixada: false,
        contexto: {
          cliente: conversation.client_name || conversation.client_phone,
          telefone: conversation.client_phone,
          valorPotencial: conversation.potential_value,
          probabilidadeConversao: 85
        },
        acao: {
          tipo: 'assumir_conversa',
          dados: { conversationId: conversation.id }
        }
      };
    }

    if (conversation.potential_value > 15000 && conversation.status === 'bot') {
      return {
        id: `high-value-${conversation.id}`,
        tipo: 'alto_valor',
        titulo: 'Oportunidade de alto valor',
        mensagem: `Cliente com potencial de R$ ${conversation.potential_value?.toLocaleString()} precisa de atendimento especializado`,
        prioridade: 'critica',
        icone: 'trophy',
        timestamp: new Date().toISOString(),
        lida: false,
        fixada: false,
        contexto: {
          cliente: conversation.client_name || conversation.client_phone,
          telefone: conversation.client_phone,
          valorPotencial: conversation.potential_value,
          probabilidadeConversao: 70
        },
        acao: {
          tipo: 'transferir_vendedor',
          dados: { conversationId: conversation.id }
        }
      };
    }

    return null;
  }, []);

  const fetchRealNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar conversas ativas que podem gerar notificações
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .in('status', ['bot', 'waiting_human', 'human'])
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const generatedNotifications: RealNotification[] = [];

      conversations?.forEach(conversation => {
        const notification = generateNotificationFromConversation(conversation);
        if (notification) {
          // Verificar se a notificação não foi dispensada
          const contextId = `${conversation.id}-${notification.tipo}`;
          if (!isNotificationDismissed(notification.tipo, contextId)) {
            generatedNotifications.push({
              ...notification,
              id: contextId
            });
          }
        }
      });

      // Ordenar por prioridade e timestamp
      const priorityOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
      generatedNotifications.sort((a, b) => {
        const priorityDiff = priorityOrder[b.prioridade] - priorityOrder[a.prioridade];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('Erro ao buscar notificações reais:', error);
    } finally {
      setLoading(false);
    }
  }, [generateNotificationFromConversation, isNotificationDismissed]);

  useEffect(() => {
    fetchRealNotifications();
    
    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(fetchRealNotifications, 30000);

    // Escutar mudanças em tempo real nas conversações
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Aguardar um pouco antes de recarregar para evitar muitas chamadas
          setTimeout(fetchRealNotifications, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          setTimeout(fetchRealNotifications, 1000);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchRealNotifications]);

  return {
    notifications,
    loading,
    refreshNotifications: fetchRealNotifications
  };
};
