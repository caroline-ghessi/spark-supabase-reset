
import { MessageCircle, Users, BarChart3, Settings, Bot } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: MessageCircle, label: 'Conversas Ativas', id: 'conversations', active: true },
  { icon: Users, label: 'Painel Vendedores', id: 'salespeople' },
  { icon: BarChart3, label: 'Métricas', id: 'metrics' },
  { icon: Settings, label: 'Configurações', id: 'settings' },
];

export const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('conversations');

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
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
