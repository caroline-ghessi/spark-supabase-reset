
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  BarChart3, 
  Eye, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface ModernLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  roles?: string[];
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      href: '/',
      description: 'Visão geral da plataforma'
    },
    {
      title: 'WhatsApp',
      icon: MessageCircle,
      href: '/whatsapp',
      description: 'Gestão de conversas WhatsApp'
    },
    {
      title: 'Monitoramento',
      icon: Eye,
      href: '/monitoring',
      description: 'Monitoramento dos vendedores',
      roles: ['admin', 'supervisor']
    },
    {
      title: 'Configurações',
      icon: Settings,
      href: '/settings',
      description: 'Configurações da plataforma'
    }
  ];

  // Filter items based on user role
  const filteredItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setMobileMenuOpen(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 relative",
          sidebarCollapsed ? "w-20" : "w-72",
          "hidden md:flex",
          // Mobile overlay
          "md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="transition-opacity duration-300">
                  <h1 className="font-bold text-slate-100">WhatsApp Sales</h1>
                  <p className="text-xs text-slate-400">Gestão Inteligente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                    isActive
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="transition-opacity duration-300">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Status Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-700">
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-300 font-medium">Sistema Online</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
        <aside className="fixed left-0 top-0 h-full w-72 bg-slate-900 text-slate-100 flex flex-col">
          {/* Mobile Header */}
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-100">WhatsApp Sales</h1>
                <p className="text-xs text-slate-400">Gestão Inteligente</p>
              </div>
            </div>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                      isActive
                        ? "bg-orange-500 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleSidebar}
              className="hidden md:flex w-10 h-10 items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Plataforma de Gestão WhatsApp
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ConnectionStatus />
            <NotificationCenter />
            
            <div className="flex items-center space-x-3">
              <span className="hidden sm:block text-sm text-gray-600">
                Bem-vindo, {user?.name}
              </span>
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name ? getUserInitials(user.name) : 'U'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
