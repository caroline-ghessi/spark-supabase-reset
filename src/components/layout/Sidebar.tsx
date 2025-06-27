
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  Settings, 
  Bell,
  Monitor,
  BookOpen,
  FileText,
  Phone
} from 'lucide-react';

const navigation = [
  { name: 'WhatsApp', href: '/', icon: Phone, current: false },
  { name: 'Conversas', href: '/conversations', icon: MessageSquare, current: false },
  { name: 'Monitoramento', href: '/monitoring', icon: Monitor, current: false },
  { name: 'Biblioteca', href: '/library', icon: BookOpen, current: false },
  { name: 'Usuários', href: '/users', icon: Users, current: false },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, current: false },
  { name: 'Auditoria', href: '/audit', icon: FileText, current: false },
  { name: 'Notificações', href: '/notifications', icon: Bell, current: false },
  { name: 'Configurações', href: '/settings', icon: Settings, current: false },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">WhatsApp CRM</h1>
            <p className="text-xs text-gray-500">Gestão de Vendas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-orange-100 text-orange-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">C</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Carol</p>
            <p className="text-xs text-gray-500">Supervisora</p>
          </div>
        </div>
      </div>
    </div>
  );
};
