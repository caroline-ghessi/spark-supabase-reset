
import { MessageCircle, Users, BarChart3, Settings, Bot } from 'lucide-react';
import { useState } from 'react';
import { NotificationBadge } from '../notifications/NotificationBadge';
import { useNotifications } from '@/contexts/NotificationContext';

const menuItems = [
  { icon: MessageCircle, label: 'Conversas Ativas', id: 'conversations', active: true },
  { icon: Users, label: 'Painel Vendedores', id: 'salespeople' },
  { icon: BarChart3, label: 'Métricas', id: 'metrics' },
  { icon: Settings, label: 'Configurações', id: 'settings' },
];

interface SidebarProps {
  onMenuChange?: (menuId: string) => void;
}

export const Sidebar = ({ onMenuChange }: SidebarProps) => {
  const [activeItem, setActiveItem] = useState('conversations');
  const { notifications } = useNotifications();

  // Calculate badges for each menu item
  const getBadgeCount = (menuId: string) => {
    switch (menuId) {
      case 'conversations':
        return notifications.filter(n => 
          !n.lida && ['nova_mensagem', 'cliente_aguardando'].includes(n.tipo)
        ).length;
      case 'salespeople':
        return notifications.filter(n => 
          !n.lida && ['vendedor_inativo', 'recomendacao_ia'].includes(n.tipo)
        ).length;
      case 'metrics':
        return notifications.filter(n => 
          !n.lida && ['meta_atingida', 'relatorio_disponivel'].includes(n.tipo)
        ).length;
      default:
        return 0;
    }
  };

  const getBadgeType = (menuId: string) => {
    switch (menuId) {
      case 'conversations':
        const hasUrgent = notifications.some(n => 
          !n.lida && n.prioridade === 'critica' && ['nova_mensagem', 'cliente_aguardando'].includes(n.tipo)
        );
        return hasUrgent ? 'urgent' : 'default';
      case 'salespeople':
        const hasWarning = notifications.some(n => 
          !n.lida && n.prioridade === 'alta' && ['vendedor_inativo'].includes(n.tipo)
        );
        return hasWarning ? 'warning' : 'default';
      default:
        return 'default';
    }
  };

  const handleMenuClick = (itemId: string) => {
    setActiveItem(itemId);
    onMenuChange?.(itemId);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">WhatsApp Sales</h1>
            <p className="text-sm text-gray-500">Gestão Inteligente</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const badgeCount = getBadgeCount(item.id);
          const badgeType = getBadgeType(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`relative w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {badgeCount > 0 && (
                <NotificationBadge 
                  count={badgeCount} 
                  type={badgeType}
                  className="ml-auto"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Indicators */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status Sistema</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-xs text-gray-500">
            <div>Bot: Online</div>
            <div>API: Conectada</div>
            <div>Conversas: 12 ativas</div>
            <div>IA: Monitorando</div>
          </div>
        </div>
      </div>
    </div>
  );
};
