
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { checkEmergencyAccess } from './emergencyAccess';
import { checkDevAccess } from './devAccess';
import { loadUserData } from './userOperations';
import { clearLocalAuthState } from './security';
import type { User } from './types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const checkInitialSession = useCallback(async () => {
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
  }, []);

  const resetAuthState = useCallback(() => {
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
  }, [checkInitialSession]);

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
  }, [initialized, checkInitialSession]);

  return {
    user,
    session,
    loading,
    setUser,
    setSession,
    resetAuthState
  };
};
