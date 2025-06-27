
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationConfig, mockNotifications, mockNotificationConfigs } from '@/data/notificationsData';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  config: NotificationConfig;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  updateConfig: (newConfig: NotificationConfig) => void;
  togglePin: (id: number) => void;
  playNotificationSound: (soundFile?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [config, setConfig] = useState<NotificationConfig>(mockNotificationConfigs.carol);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.lida).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast if enabled
    if (config.inApp.toast) {
      const bgColor = 
        newNotification.prioridade === 'critica' ? 'bg-red-500' :
        newNotification.prioridade === 'alta' ? 'bg-orange-500' :
        newNotification.prioridade === 'media' ? 'bg-blue-500' : 'bg-gray-500';

      toast({
        title: newNotification.titulo,
        description: newNotification.mensagem,
        className: `${bgColor} text-white border-0`,
      });
    }

    // Play sound if enabled
    if (config.inApp.sons && newNotification.som) {
      playNotificationSound(newNotification.som);
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, lida: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, lida: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const updateConfig = (newConfig: NotificationConfig) => {
    setConfig(newConfig);
  };

  const togglePin = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id 
          ? { ...notification, fixada: !notification.fixada } 
          : notification
      )
    );
  };

  const playNotificationSound = (soundFile: string = 'notification.mp3') => {
    if (config.inApp.sons) {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.7;
      audio.play().catch(console.error);
    }
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvents = [
        {
          tipo: "nova_mensagem",
          prioridade: "alta" as const,
          titulo: "Nova Mensagem",
          mensagem: "Cliente enviou uma nova mensagem",
          lida: false,
          fixada: false,
          destinatario: "carol",
          icone: "message-circle",
          cor: "blue",
          canais: ["inApp"],
          contexto: { cliente: "Cliente Simulado" }
        },
        {
          tipo: "recomendacao_ia",
          prioridade: "media" as const,
          titulo: "Recomendação da IA",
          mensagem: "IA sugere enviar material específico",
          lida: false,
          fixada: false,
          destinatario: "carol",
          icone: "lightbulb",
          cor: "purple",
          canais: ["inApp"],
          contexto: { probabilidade: 85 }
        }
      ];

      if (Math.random() > 0.8) { // 20% chance every interval
        const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addNotification(randomEvent);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [config]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        config,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        updateConfig,
        togglePin,
        playNotificationSound
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
