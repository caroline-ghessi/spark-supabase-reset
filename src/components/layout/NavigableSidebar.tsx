
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, BarChart3, Eye, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';

interface MenuItem {
  title: string;
  icon: string;
  href: string;
  description: string;
  roles?: string[];
}

interface NavigableSidebarProps {
  items: MenuItem[];
}

export const NavigableSidebar: React.FC<NavigableSidebarProps> = ({ items }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<{ className?: string }> } = {
      BarChart3,
      MessageCircle,
      Eye,
      Settings
    };
    return icons[iconName] || MessageCircle;
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">WhatsApp Sales</h1>
            <p className="text-sm text-gray-500">Gestão Inteligente</p>
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <nav className="p-4 space-y-2 flex-1">
        {items.map((item) => {
          const Icon = getIcon(item.icon);
          const isActive = location.pathname === item.href;
          
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                isActive
                  ? 'bg-orange-100 text-orange-900 border border-orange-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-orange-600' : 'text-gray-400'
                )} />
                <span className="font-medium">{item.title}</span>
              </div>
              
              {item.href === '/notifications' && unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Status */}
      <div className="p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">Sistema Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
