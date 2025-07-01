
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
      
      // Primeiro, verificar sessão normal do Supabase (PRIORIDADE)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Erro ao verificar sessão:', error);
      } else if (session?.user) {
        console.log('📋 Sessão real do Supabase encontrada:', session.user.email);
        setSession(session);
        setTimeout(() => {
          loadUserData(session.user.id, setUser, setLoading);
        }, 100);
        return;
      }

      console.log('📋 Nenhuma sessão real encontrada, verificando acessos temporários...');
      
      // Verificar acesso temporário de admin apenas se não houver sessão real
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
      
      // Verificar acesso de emergência
      if (checkEmergencyAccess(setUser)) {
        setLoading(false);
        return;
      }

      // Verificar acesso de desenvolvimento (apenas em DEV)
      if (checkDevAccess(setUser)) {
        setLoading(false);
        return;
      }

      // Se chegou até aqui, não há usuário autenticado
      console.log('🚫 Nenhum usuário autenticado encontrado');
      setLoading(false);
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
    if (initialized) return; // Evitar múltiplas inicializações

    console.log('🔄 AuthProvider: Inicializando sistema de autenticação...');
    
    let isActive = true;

    // Configurar listener de autenticação ANTES de verificar sessão inicial
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isActive) return;
        
        console.log('🔑 Auth event:', event, session?.user?.email || 'no session');
        
        setSession(session);
        
        if (session?.user) {
          console.log('📊 Usuário real detectado, carregando dados:', session.user.email);
          // Limpar acessos temporários quando usuário real faz login
          localStorage.removeItem('temp_admin_access');
          localStorage.removeItem('temp_admin_user');
          localStorage.removeItem('dev_access');
          localStorage.removeItem('dev_user');
          localStorage.removeItem('emergency_access');
          
          setTimeout(() => {
            if (isActive) {
              loadUserData(session.user.id, setUser, setLoading);
            }
          }, 100);
        } else {
          console.log('🚫 Sem sessão real, limpando dados do usuário');
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Verificar sessão inicial
    checkInitialSession();
    setInitialized(true);

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
