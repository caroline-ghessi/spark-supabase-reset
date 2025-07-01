
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from './auth/authStateManager';
import { useAuthOperations } from './auth/authHooks';
import type { AuthContextType } from './auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    user,
    session,
    loading,
    setUser,
    setSession,
    resetAuthState
  } = useAuthState();

  const authOperations = useAuthOperations(user, session, setUser, setSession);

  const value: AuthContextType = {
    user,
    session,
    loading,
    ...authOperations,
    resetAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Função utilitária para debug (exportada)
export const debugAuthState = () => {
  console.log('🔍 Debug Estado de Autenticação:', {
    localStorage: {
      loginAttempts: localStorage.getItem('login_attempts_count'),
      blockedUntil: localStorage.getItem('login_blocked_until'),
      devAccess: localStorage.getItem('dev_access'),
      emergencyAccess: localStorage.getItem('emergency_access'),
      tempAdminAccess: localStorage.getItem('temp_admin_access')
    },
    sessionStorage: {
      reloadCount: sessionStorage.getItem('reload_count'),
      sessionStart: sessionStorage.getItem('session_start')
    }
  });
};
