
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { checkEmergencyAccess } from './auth/emergencyAccess';
import { checkDevAccess } from './auth/devAccess';
import { loadUserData } from './auth/userOperations';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from './auth/authOperations';
import { hasPermission as checkPermission } from './auth/permissions';
import type { AuthContextType, User } from './auth/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider: Inicializando...');
    
    // Configurar listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔑 Auth event:', event, session?.user?.email);
        
        setSession(session);
        
        // CORREÇÃO CRÍTICA: Usar setTimeout para evitar recursão
        if (session?.user) {
          console.log('📊 Carregando dados do usuário (diferido):', session.user.email);
          setTimeout(() => {
            loadUserData(session.user.id, setUser, setLoading);
          }, 0);
        } else {
          console.log('🚫 Sem sessão, limpando dados do usuário');
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Verificar sessão inicial
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const checkInitialSession = async () => {
    try {
      console.log('🔍 Verificando sessão inicial...');
      
      // Verificar acesso de emergência (agora mais seguro)
      if (checkEmergencyAccess(setUser)) {
        setLoading(false);
        return;
      }

      // Verificar acesso de desenvolvimento (apenas em DEV e se habilitado)
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

      console.log('📋 Verificação de sessão inicial:', session?.user?.email || 'Sem sessão');

      if (session?.user) {
        setSession(session);
        // CORREÇÃO: Usar setTimeout para evitar recursão
        setTimeout(() => {
          loadUserData(session.user.id, setUser, setLoading);
        }, 0);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Erro na verificação inicial:', error);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
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
    hasPermission
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
