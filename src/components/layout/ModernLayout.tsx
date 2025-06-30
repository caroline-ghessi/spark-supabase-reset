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
    <div className="flex h-screen bg-gray-50 overflow-hidden w-screen">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 relative flex-shrink-0 h-full",
          sidebarCollapsed ? "w-14" : "w-64",
          "hidden md:flex"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "border-b border-slate-700 flex items-center justify-between transition-all duration-300",
          sidebarCollapsed ? "p-3" : "p-4"
        )}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="transition-opacity duration-300 min-w-0">
                <h1 className="font-bold text-slate-100 text-sm truncate">WhatsApp Sales</h1>
                <p className="text-xs text-slate-400 truncate">Gestão Inteligente</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center rounded-lg text-left transition-all duration-200 group relative",
                    sidebarCollapsed ? "p-3 justify-center" : "p-3 space-x-3",
                    isActive
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="transition-opacity duration-300 min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{item.title}</div>
                      <div className="text-xs opacity-70 truncate">{item.description}</div>
                    </div>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Status Footer */}
        {!sidebarCollapsed && (
          <div className="p-3 border-t border-slate-700">
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-300 font-medium">Sistema Online</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity duration-300" 
          onClick={toggleMobileMenu} 
        />
        <aside className={cn(
          "fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 shadow-2xl",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Mobile Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-100 text-sm">WhatsApp Sales</h1>
                <p className="text-xs text-slate-400">Gestão Inteligente</p>
              </div>
            </div>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200",
                      isActive
                        ? "bg-orange-500 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{item.title}</div>
                      <div className="text-xs opacity-70 truncate">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full">
        {/* Header - Full Width */}
        <header className="bg-white border-b border-gray-200 flex justify-between items-center flex-shrink-0 px-4 py-3">
          <div className="flex items-center space-x-4 min-w-0">
            <button
              onClick={toggleSidebar}
              className="hidden md:flex w-10 h-10 items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 truncate">
                Plataforma de Gestão WhatsApp
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            <ConnectionStatus />
            <NotificationCenter />
            
            <div className="hidden sm:flex items-center space-x-3">
              <span className="text-sm text-gray-600 truncate max-w-32">
                Bem-vindo, {user?.name}
              </span>
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                {user?.name ? getUserInitials(user.name) : 'U'}
              </div>
            </div>
            
            <div className="sm:hidden w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
              {user?.name ? getUserInitials(user.name) : 'U'}
            </div>
          </div>
        </header>
        
        {/* Content Area - Full Width & Height */}
        <main className="flex-1 overflow-hidden w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};
