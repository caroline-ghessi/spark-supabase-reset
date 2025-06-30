
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
    <div className="flex h-screen bg-gray-50">
      <NavigableSidebar items={filteredItems} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Plataforma de Gestão WhatsApp
            </h1>
            <p className="text-sm text-gray-600">
              Bem-vindo, {user.name}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
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
