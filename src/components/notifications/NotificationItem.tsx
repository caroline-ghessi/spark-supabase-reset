
import React from 'react';
import { Pin, X, Clock, MessageCircle, Lightbulb, Trophy, UserPlus, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critica': return 'border-l-red-500 bg-red-50';
    case 'alta': return 'border-l-orange-500 bg-orange-50';
    case 'media': return 'border-l-blue-500 bg-blue-50';
    default: return 'border-l-gray-500 bg-gray-50';
  }
};

interface NotificationItemProps {
  notification: any;
  onClick: () => void;
  onPin: () => void;
  onRemove: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onClick, 
  onPin, 
  onRemove 
}) => {
  const Icon = getIcon(notification.icone);
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <div className={`
      p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm mb-2
      ${getPriorityColor(notification.prioridade)}
      ${!notification.lida ? 'border-opacity-100' : 'border-opacity-50 opacity-75'}
    `}>
      <div className="flex items-start space-x-3">
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${notification.prioridade === 'critica' ? 'bg-red-100 text-red-600' :
            notification.prioridade === 'alta' ? 'bg-orange-100 text-orange-600' :
            notification.prioridade === 'media' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-600'}
        `}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm ${!notification.lida ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                {notification.titulo}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.mensagem}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {timeAgo}
              </p>
              
              {/* Context info */}
              {notification.contexto && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {notification.contexto.cliente && (
                    <div>👤 {notification.contexto.cliente}</div>
                  )}
                  {notification.contexto.valorPotencial && (
                    <div>💰 R$ {notification.contexto.valorPotencial.toLocaleString()}</div>
                  )}
                  {notification.contexto.probabilidadeConversao && (
                    <div>📊 {notification.contexto.probabilidadeConversao}% prob.</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}
                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                  notification.fixada ? 'text-yellow-600' : 'text-gray-400'
                }`}
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
