
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavigableSidebar } from './NavigableSidebar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const sidebarItems = [
    {
      title: 'Dashboard',
      icon: 'BarChart3',
      href: '/',
      description: 'Visão geral da plataforma'
    },
    {
      title: 'WhatsApp',
      icon: 'MessageCircle',
      href: '/whatsapp',
      description: 'Gestão de conversas WhatsApp'
    },
    {
      title: 'Monitoramento',
      icon: 'Eye',
      href: '/monitoring',
      description: 'Monitoramento dos vendedores',
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Configurações',
      icon: 'Settings',
      href: '/settings',
      description: 'Configurações da plataforma'
    }
  ];

  // Filter items based on user role
  const filteredItems = sidebarItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <NavigableSidebar items={filteredItems} />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b px-4 py-2 flex justify-between items-center flex-shrink-0 h-12">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Plataforma de Gestão WhatsApp
            </h1>
            <p className="text-xs text-gray-600">
              Bem-vindo, {user.name}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <NotificationCenter />
          </div>
        </header>
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
