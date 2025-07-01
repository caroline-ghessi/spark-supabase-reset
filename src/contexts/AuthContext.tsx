
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { checkEmergencyAccess } from './auth/emergencyAccess';
import { checkDevAccess } from './auth/devAccess';
import { loadUserData } from './auth/userOperations';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from './auth/authOperations';
import { hasPermission as checkPermission } from './auth/permissions';
import { clearLocalAuthState } from './auth/security';
import type { AuthContextType, User } from './auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado para controlar se já foi inicializado
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('🔄 AuthProvider: Inicializando sistema de autenticação...');
    
    let isActive = true; // Flag para evitar updates depois que componente desmonta

    // Configurar listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isActive) return;
        
        console.log('🔑 Auth event:', event, session?.user?.email || 'no session');
        
        setSession(session);
        
        if (session?.user) {
          console.log('📊 Usuário detectado, carregando dados:', session.user.email);
          // Usar setTimeout para evitar problemas de sincronização
          setTimeout(() => {
            if (isActive) {
              loadUserData(session.user.id, setUser, setLoading);
            }
          }, 100);
        } else {
          console.log('🚫 Sem sessão, limpando dados do usuário');
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Verificar sessão inicial apenas uma vez
    if (!initialized) {
      checkInitialSession();
      setInitialized(true);
    }

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const checkInitialSession = async () => {
    try {
      console.log('🔍 Verificando sessão inicial...');
      
      // Verificar acesso temporário de admin primeiro
      const tempAdminAccess = localStorage.getItem('temp_admin_access');
      const tempAdminUser = localStorage.getItem('temp_admin_user');
      
      if (tempAdminAccess && tempAdminUser) {
        try {
          const adminUser = JSON.parse(tempAdminUser);
          console.log('👑 Acesso temporário de admin encontrado:', adminUser.email);
          setUser(adminUser);
          setLoading(false);
          return;
        } catch (error) {
          console.error('❌ Erro ao carregar admin temporário:', error);
          localStorage.removeItem('temp_admin_access');
          localStorage.removeItem('temp_admin_user');
        }
      }
      
      // Verificar acesso de emergência (mais seguro)
      if (checkEmergencyAccess(setUser)) {
        setLoading(false);
        return;
      }

      // Verificar acesso de desenvolvimento (apenas em DEV)
      if (checkDevAccess(setUser)) {
        setLoading(false);
        return;
      }

      // Verificar sessão normal do Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        setLoading(false);
        return;
      }

      console.log('📋 Sessão inicial encontrada:', session?.user?.email || 'Nenhuma sessão');

      if (session?.user) {
        setSession(session);
        // Usar setTimeout para evitar problemas de sincronização
        setTimeout(() => {
          loadUserData(session.user.id, setUser, setLoading);
        }, 100);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Erro na verificação inicial:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('📝 Iniciando processo de login para:', email);
    return authSignIn(email, password, setUser);
  };

  const signUp = async (email: string, password: string, name: string) => {
    return authSignUp(email, password, name);
  };

  const signOut = async () => {
    return authSignOut(user, session, setUser, setSession);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return checkPermission(user.role, permission);
  };

  // Nova função para limpar estado e reinicializar
  const resetAuthState = () => {
    console.log('🔄 Resetando estado de autenticação...');
    clearLocalAuthState();
    setUser(null);
    setSession(null);
    setLoading(true);
    setInitialized(false);
    
    // Forçar recheck da sessão
    setTimeout(() => {
      checkInitialSession();
      setInitialized(true);
    }, 100);
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isSupervisor: user?.role === 'supervisor',
    hasPermission,
    resetAuthState // Expor função de reset
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
