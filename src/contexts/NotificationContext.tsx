
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRealNotifications } from '@/hooks/useRealNotifications';
import { useDismissedNotifications } from '@/hooks/useDismissedNotifications';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { useToast } from '@/hooks/use-toast';

interface NotificationConfig {
  inApp: {
    sons: boolean;
    toast: boolean;
    badges: boolean;
    modal: boolean;
  };
  whatsapp: {
    ativo: boolean;
    tipos: string[];
    horario: string;
    dias?: string[];
  };
  email: {
    ativo: boolean;
    tipos?: string[];
    frequencia?: string;
  };
}

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  togglePin: (id: string) => void;
  refreshNotifications: () => void;
  config: NotificationConfig;
  updateConfig: (newConfig: NotificationConfig) => void;
}

const defaultConfig: NotificationConfig = {
  inApp: {
    sons: true,
    toast: true,
    badges: true,
    modal: true
  },
  whatsapp: {
    ativo: true,
    tipos: ['novo_cliente', 'recomendacao_ia', 'alerta_tempo', 'meta_atingida'],
    horario: '08:00-18:00',
    dias: ['seg', 'ter', 'qua', 'qui', 'sex']
  },
  email: {
    ativo: false,
    tipos: ['relatorio_diario', 'relatorio_semanal'],
    frequencia: 'diario'
  }
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notifications: realNotifications, loading, refreshNotifications } = useRealNotifications();
  const { dismissNotification } = useDismissedNotifications();
  const { playSound } = useNotificationSound();
  const { toast } = useToast();
  
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [pinnedNotifications, setPinnedNotifications] = useState<Set<string>>(new Set());
  const [previousCount, setPreviousCount] = useState(0);
  const [config, setConfig] = useState<NotificationConfig>(defaultConfig);

  // Combinar notificações reais com estados locais
  const notifications = realNotifications.map(notification => ({
    ...notification,
    lida: readNotifications.has(notification.id),
    fixada: pinnedNotifications.has(notification.id)
  }));

  const unreadCount = notifications.filter(n => !n.lida).length;

  // Tocar som quando novas notificações chegarem
  React.useEffect(() => {
    if (!loading && notifications.length > previousCount && previousCount > 0) {
      const newNotifications = notifications.slice(0, notifications.length - previousCount);
      const hasUrgent = newNotifications.some(n => n.prioridade === 'critica');
      
      if (hasUrgent && config.inApp.sons) {
        playSound();
      }
    }
    setPreviousCount(notifications.length);
  }, [notifications.length, loading, previousCount, playSound, config.inApp.sons]);

  const markAsRead = useCallback((id: string) => {
    setReadNotifications(prev => new Set([...prev, id]));
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  }, [notifications]);

  const removeNotification = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    // Extrair tipo e context_id do ID
    const parts = id.split('-');
    const notificationType = parts[0];
    const contextId = parts.slice(1).join('-');

    const success = await dismissNotification(notificationType, contextId, {
      titulo: notification.titulo,
      dismissed_at: new Date().toISOString()
    });

    if (success) {
      toast({
        title: "Notificação dispensada",
        description: "Esta notificação não aparecerá mais.",
      });
      refreshNotifications();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível dispensar a notificação.",
        variant: "destructive"
      });
    }
  }, [notifications, dismissNotification, refreshNotifications, toast]);

  const togglePin = useCallback((id: string) => {
    setPinnedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const updateConfig = useCallback((newConfig: NotificationConfig) => {
    setConfig(newConfig);
    // Here you could also save to localStorage or send to backend
    localStorage.setItem('notificationConfig', JSON.stringify(newConfig));
  }, []);

  // Load config from localStorage on mount
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('notificationConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading notification config:', error);
      }
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        togglePin,
        refreshNotifications,
        config,
        updateConfig
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
