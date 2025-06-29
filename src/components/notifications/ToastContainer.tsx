
import React, { useState, useEffect } from 'react';
import { ToastNotification } from './ToastNotification';
import { useNotifications } from '@/contexts/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { notifications, config } = useNotifications();
  const [activeToasts, setActiveToasts] = useState<any[]>([]);

  useEffect(() => {
    if (!config.inApp.toast) return;

    // Show toast for new critical and high priority notifications
    const newNotifications = notifications.filter(
      n => !n.lida && ['critica', 'alta'].includes(n.prioridade)
    );

    // Only show the latest 3 toasts to avoid overwhelming the user
    const toastsToShow = newNotifications.slice(0, 3);
    
    // Add new toasts that aren't already active
    toastsToShow.forEach(notification => {
      if (!activeToasts.find(toast => toast.id === notification.id)) {
        setActiveToasts(prev => [...prev, notification]);
      }
    });
  }, [notifications, config.inApp.toast, activeToasts]);

  const handleRemoveToast = (id: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleToastAction = (action: any) => {
    console.log('Toast action:', action);
    // Implement action handling here
    // This could navigate to different parts of the app
  };

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none max-w-sm">
      {activeToasts.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{ 
            transform: `translateY(${index * 10}px)`,
            zIndex: 100 - index 
          }}
        >
          <ToastNotification
            notification={notification}
            onClose={() => handleRemoveToast(notification.id)}
            onAction={handleToastAction}
          />
        </div>
      ))}
    </div>
  );
};
