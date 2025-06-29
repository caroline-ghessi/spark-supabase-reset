
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { DatabaseUser } from '@/types/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'supervisor';
  seller_id?: string;
  first_login_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: any; message?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
  isSeller: boolean;
  isSupervisor: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// CONFIGURAÇÕES DE DESENVOLVIMENTO E EMERGÊNCIA
const DEV_CONFIG = {
  enabled: import.meta.env.DEV || import.meta.env.VITE_DEV_ACCESS === 'true',
  email: 'caroline@drystore.com.br',
  password: 'DevAccess2024!',
  adminUser: {
    id: 'dev-admin-001',
    email: 'caroline@drystore.com.br',
    name: 'Caroline Ghessi (Dev)',
    role: 'admin' as const,
    first_login_completed: true
  }
};

// Mapeamento de permissões por role
const ROLE_PERMISSIONS = {
  admin: [
    'gerenciar_usuarios',
    'configurar_ia',
    'acessar_todos_relatorios',
    'modificar_configuracoes',
    'gerenciar_biblioteca',
    'acessar_auditoria',
    'fazer_backup',
    'gerenciar_integracao',
    'monitorar_conversas',
    'assumir_controle',
    'transferir_clientes',
    'visualizar_biblioteca_materiais'
  ],
  supervisor: [
    'monitorar_conversas',
    'assumir_controle',
    'transferir_clientes',
    'acessar_relatorios_operacionais',
    'gerenciar_vendedores',
    'visualizar_biblioteca'
  ],
  seller: [
    'acessar_clientes_atribuidos',
    'visualizar_biblioteca_materiais',
    'baixar_materiais',
    'visualizar_metricas_pessoais',
    'receber_recomendacoes_ia',
    'visualizar_historico_conversas'
  ]
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar listener de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // DEPOIS verificar sessão existente
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const checkInitialSession = async () => {
    try {
      // Verificar acesso de emergência primeiro
      if (checkEmergencyAccess()) {
        setLoading(false);
        return;
      }

      // Verificar acesso de desenvolvimento
      if (checkDevAccess()) {
        setLoading(false);
        return;
      }

      // Verificar sessão normal do Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setSession(session);
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('Erro na verificação inicial:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEmergencyAccess = (): boolean => {
    const emergencyAccess = localStorage.getItem('emergency_access');
    const emergencyExpires = localStorage.getItem('emergency_expires');
    
    if (emergencyAccess === 'true' && emergencyExpires) {
      const expiresAt = parseInt(emergencyExpires);
      if (Date.now() < expiresAt) {
        setUser({
          id: 'emergency-admin',
          email: 'emergency@admin.com',
          name: 'Emergency Admin',
          role: 'admin',
          first_login_completed: true
        });
        console.warn('⚠️ Acesso de emergência ativo');
        return true;
      } else {
        // Limpar acesso expirado
        localStorage.removeItem('emergency_access');
        localStorage.removeItem('emergency_expires');
      }
    }
    return false;
  };

  const checkDevAccess = (): boolean => {
    const devAccess = localStorage.getItem('dev_access');
    const devUser = localStorage.getItem('dev_user');
    
    if (DEV_CONFIG.enabled && devAccess === 'true' && devUser) {
      try {
        const userData = JSON.parse(devUser);
        setUser(userData);
        console.log('🔓 Acesso de desenvolvimento ativo para', userData.name);
        return true;
      } catch (error) {
        console.error('Erro ao parsear dados de dev:', error);
        localStorage.removeItem('dev_access');
        localStorage.removeItem('dev_user');
      }
    }
    return false;
  };

  const loadUserData = async (userId: string) => {
    try {
      // Usar query customizada para contornar limitações de tipos
      const { data, error } = await supabase
        .from('users' as any)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        return;
      }

      // Converter de unknown para DatabaseUser de forma segura
      const userData = data as unknown as DatabaseUser;
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        seller_id: userData.seller_id,
        first_login_completed: userData.first_login_completed
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // BYPASS DE DESENVOLVIMENTO - Caroline Dev Access
      if (DEV_CONFIG.enabled && 
          email === DEV_CONFIG.email && 
          password === DEV_CONFIG.password) {
        console.log('🔓 Acesso de desenvolvimento ativado para Caroline');
        setUser(DEV_CONFIG.adminUser);
        
        // Salvar flag de dev access
        localStorage.setItem('dev_access', 'true');
        localStorage.setItem('dev_user', JSON.stringify(DEV_CONFIG.adminUser));
        
        return { 
          success: true, 
          user: DEV_CONFIG.adminUser,
          message: 'Acesso de desenvolvimento' 
        };
      }

      // Login normal via Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Dados do usuário serão carregados pelo listener onAuthStateChange
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name
          }
        }
      });

      if (error) throw error;

      // Se o usuário foi criado, criar perfil
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users' as any)
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            role: 'admin', // Primeiro usuário é sempre admin
            first_login_completed: false
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro no signup:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao criar conta' 
      };
    }
  };

  const signOut = async () => {
    try {
      // Limpar acessos especiais
      localStorage.removeItem('dev_access');
      localStorage.removeItem('dev_user');
      localStorage.removeItem('emergency_access');
      localStorage.removeItem('emergency_expires');
      
      // Se for usuário real do Supabase, fazer logout
      if (session && user?.id && !user.id.startsWith('dev-') && !user.id.startsWith('emergency-')) {
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
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
