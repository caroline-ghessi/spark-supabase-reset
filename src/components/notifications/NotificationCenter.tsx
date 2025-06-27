
import React, { useState } from 'react';
import { Bell, Settings, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationBadge } from './NotificationBadge';
import { NotificationFilters } from './NotificationFilters';
import { NotificationList } from './NotificationList';

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
                    <NotificationBadge count={unreadCount} type="default" />
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
              
              <NotificationFilters
                filter={filter}
                typeFilter={typeFilter}
                onFilterChange={setFilter}
                onTypeFilterChange={setTypeFilter}
                unreadCount={unreadCount}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>

            {/* Notifications List */}
            <NotificationList
              pinnedNotifications={pinnedNotifications}
              regularNotifications={regularNotifications}
              onNotificationClick={handleNotificationClick}
              onTogglePin={togglePin}
              onRemoveNotification={removeNotification}
            />
          </div>
        </>
      )}
    </div>
  );
};
