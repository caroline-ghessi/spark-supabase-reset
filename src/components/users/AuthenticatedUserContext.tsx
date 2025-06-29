
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers, accessLevels, type User as MockUser } from '@/data/usersData';

// Interface para manter compatibilidade com o sistema atual
interface AuthenticatedUserContextType {
  currentUser: MockUser | null;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  users: MockUser[];
}

const AuthenticatedUserContext = createContext<AuthenticatedUserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(AuthenticatedUserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

// Provider que adapta o novo sistema de auth para o antigo
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user: authUser, hasPermission: authHasPermission, signOut } = useAuth();

  // Converter usuário autenticado para formato mock (compatibilidade)
  const currentUser: MockUser | null = authUser ? {
    id: parseInt(authUser.id.replace(/\D/g, '').slice(-6) || '1'), // Converter UUID para número
    nome: authUser.name,
    email: authUser.email,
    telefone: '51 99999-0000', // Placeholder
    foto: "https://avatar.iran.liara.run/public/girl",
    nivel: authUser.role === 'seller' ? 'vendedor' as const : 
           authUser.role === 'supervisor' ? 'supervisor' as const : 'admin' as const,
    status: 'ativo' as const,
    ultimoAcesso: new Date().toISOString().slice(0, 16).replace('T', ' '),
    criadoEm: "2024-01-01",
    configuracoes: {
      tema: "claro",
      notificacoes: true,
      idioma: "pt-BR"
    }
  } : null;

  const hasPermission = (permission: string): boolean => {
    return authHasPermission(permission);
  };

  // Login mock - redireciona para página de login real
  const login = (email: string, password: string): boolean => {
    console.log('Login chamado via UserProvider - redirecionando para AuthProvider');
    window.location.href = '/login';
    return false;
  };

  const logout = () => {
    signOut();
  };

  return (
    <AuthenticatedUserContext.Provider value={{
      currentUser,
      hasPermission,
      login,
      logout,
      users: mockUsers // Manter usuários mock para compatibilidade
    }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
