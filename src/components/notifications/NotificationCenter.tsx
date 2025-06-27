
import React, { useState } from 'react';
import { Bell, Settings, Pin, X, Clock, MessageCircle, Lightbulb, Trophy, UserPlus, UserX, Filter } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NotificationBadge } from './NotificationBadge';

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

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    togglePin 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'nao_lidas' | 'criticas' | 'hoje'>('todas');
  const [typeFilter, setTypeFilter] = useState<'todos_tipos' | 'clientes' | 'vendedores' | 'sistema' | 'ia'>('todos_tipos');

  const filteredNotifications = notifications.filter(notification => {
    // Apply priority/read filter
    switch (filter) {
      case 'nao_lidas':
        if (notification.lida) return false;
        break;
      case 'criticas':
        if (notification.prioridade !== 'critica') return false;
        break;
      case 'hoje':
        const today = new Date().toDateString();
        const notificationDate = new Date(notification.timestamp).toDateString();
        if (today !== notificationDate) return false;
        break;
    }

    // Apply type filter
    switch (typeFilter) {
      case 'clientes':
        if (!['nova_mensagem', 'cliente_aguardando', 'novo_cliente'].includes(notification.tipo)) return false;
        break;
      case 'vendedores':
        if (!['vendedor_inativo', 'meta_atingida'].includes(notification.tipo)) return false;
        break;
      case 'sistema':
        if (!['backup_concluido', 'erro_integracao'].includes(notification.tipo)) return false;
        break;
      case 'ia':
        if (!['recomendacao_ia'].includes(notification.tipo)) return false;
        break;
    }

    return true;
  });

  const pinnedNotifications = filteredNotifications.filter(n => n.fixada);
  const regularNotifications = filteredNotifications.filter(n => !n.fixada);

  const handleNotificationClick = (notification: any) => {
    if (!notification.lida) {
      markAsRead(notification.id);
    }
    
    // Handle action based on notification type
    if (notification.acao) {
      console.log('Executing action:', notification.acao);
      // Here you would implement the actual action routing
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <NotificationBadge 
            count={unreadCount} 
            type={notifications.some(n => !n.lida && n.prioridade === 'critica') ? 'urgent' : 'default'}
          />
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                  {unreadCount > 0 && (
                    <NotificationBadge count={unreadCount} type="default" className="position-static" />
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="mt-3 flex space-x-2">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-xs border rounded px-2 py-1 flex-1"
                >
                  <option value="todas">Todas</option>
                  <option value="nao_lidas">Não Lidas</option>
                  <option value="criticas">Críticas</option>
                  <option value="hoje">Hoje</option>
                </select>
                
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="text-xs border rounded px-2 py-1 flex-1"
                >
                  <option value="todos_tipos">Todos</option>
                  <option value="clientes">Clientes</option>
                  <option value="vendedores">Vendedores</option>
                  <option value="sistema">Sistema</option>
                  <option value="ia">IA</option>
                </select>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {/* Pinned Notifications */}
              {pinnedNotifications.length > 0 && (
                <div className="p-2 bg-yellow-50 border-b">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <Pin className="w-3 h-3 mr-1" />
                    Fixadas
                  </h4>
                  {pinnedNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onPin={() => togglePin(notification.id)}
                      onRemove={() => removeNotification(notification.id)}
                    />
                  ))}
                </div>
              )}

              {/* Regular Notifications */}
              <div className="p-2">
                {regularNotifications.length > 0 ? (
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">
                      Hoje ({regularNotifications.filter(n => {
                        const today = new Date().toDateString();
                        const notDate = new Date(n.timestamp).toDateString();
                        return today === notDate;
                      }).length})
                    </h4>
                    {regularNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onPin={() => togglePin(notification.id)}
                        onRemove={() => removeNotification(notification.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: any;
  onClick: () => void;
  onPin: () => void;
  onRemove: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
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
