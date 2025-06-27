
import React from 'react';
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Bell, 
  Settings,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    {
      id: 'conversations',
      label: 'Conversas',
      icon: MessageSquare,
      description: 'Atendimento WhatsApp'
    },
    {
      id: 'sellers',
      label: 'Vendedores',
      icon: Users,
      description: 'Monitoramento'
    },
    {
      id: 'metrics',
      label: 'Métricas',
      icon: BarChart3,
      description: 'Relatórios'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      description: 'Alertas'
    },
    {
      id: 'health-check',
      label: 'Teste Sistema',
      icon: Activity,
      description: 'Verificação'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'Ajustes'
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">WhatsApp Sales</h1>
            <p className="text-xs text-gray-500">Plataforma de Vendas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-900 border border-orange-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Sistema v1.0.0
        </div>
      </div>
    </div>
  );
};
