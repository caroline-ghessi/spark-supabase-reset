
import React from 'react';
import { Bell, Pin } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  pinnedNotifications: any[];
  regularNotifications: any[];
  onNotificationClick: (notification: any) => void;
  onTogglePin: (id: number) => void;
  onRemoveNotification: (id: number) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  pinnedNotifications,
  regularNotifications,
  onNotificationClick,
  onTogglePin,
  onRemoveNotification
}) => {
  return (
    <div className="max-h-80 overflow-y-auto hide-scrollbar">
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
              onClick={() => onNotificationClick(notification)}
              onPin={() => onTogglePin(notification.id)}
              onRemove={() => onRemoveNotification(notification.id)}
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
                onClick={() => onNotificationClick(notification)}
                onPin={() => onTogglePin(notification.id)}
                onRemove={() => onRemoveNotification(notification.id)}
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
  );
};
