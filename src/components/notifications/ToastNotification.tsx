
import React, { useEffect, useState } from 'react';
import { X, Clock, MessageCircle, Lightbulb, Trophy, UserPlus, UserX } from 'lucide-react';
import { Notification } from '@/data/notificationsData';

interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  onAction?: (action: any) => void;
}

const getIcon = (iconName: string) => {
  const icons = {
    'clock': Clock,
    'message-circle': MessageCircle,
    'lightbulb': Lightbulb,
    'trophy': Trophy,
    'user-plus': UserPlus,
    'user-x': UserX,
  };
  return icons[iconName as keyof typeof icons] || MessageCircle;
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'critica':
      return {
        border: 'border-l-red-500',
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        button: 'bg-red-500 hover:bg-red-600'
      };
    case 'alta':
      return {
        border: 'border-l-orange-500',
        bg: 'bg-orange-50',
        icon: 'bg-orange-100 text-orange-600',
        button: 'bg-orange-500 hover:bg-orange-600'
      };
    case 'media':
      return {
        border: 'border-l-blue-500',
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        button: 'bg-blue-500 hover:bg-blue-600'
      };
    default:
      return {
        border: 'border-l-gray-500',
        bg: 'bg-gray-50',
        icon: 'bg-gray-100 text-gray-600',
        button: 'bg-gray-500 hover:bg-gray-600'
      };
  }
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  onAction
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const Icon = getIcon(notification.icone);
  const styles = getPriorityStyles(notification.prioridade);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after 8 seconds unless it's critical
    if (notification.prioridade !== 'critica') {
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.prioridade]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAction = () => {
    if (notification.acao && onAction) {
      onAction(notification.acao);
    }
    handleClose();
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${styles.border} ${styles.bg}
      transform transition-all duration-300 ease-out
      ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${notification.prioridade === 'critica' ? 'animate-pulse' : ''}
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.icon}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {notification.titulo}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.mensagem}
                </p>
                
                {notification.contexto && (
                  <div className="mt-2 text-xs text-gray-500">
                    {notification.contexto.cliente && (
                      <div>Cliente: {notification.contexto.cliente}</div>
                    )}
                    {notification.contexto.valorPotencial && (
                      <div>Valor: R$ {notification.contexto.valorPotencial.toLocaleString()}</div>
                    )}
                    {notification.contexto.probabilidadeConversao && (
                      <div>Probabilidade: {notification.contexto.probabilidadeConversao}%</div>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleClose}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-3 flex space-x-2">
              {notification.acao && (
                <button
                  onClick={handleAction}
                  className={`text-xs px-3 py-1 rounded text-white transition-colors ${styles.button}`}
                >
                  Ver Detalhes
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar for auto-close */}
      {notification.prioridade !== 'critica' && (
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full ${styles.button.replace('hover:bg-', 'bg-').replace('bg-', 'bg-')} transition-all duration-[8000ms] ease-linear`}
            style={{ 
              width: isVisible ? '0%' : '100%',
              transition: isVisible ? 'width 8s linear' : 'none'
            }}
          />
        </div>
      )}
    </div>
  );
};
