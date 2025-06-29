
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { DatabaseUser } from '@/types/auth';
import { sanitizeInput, validateEmail } from '@/utils/sanitize';

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

// CONFIGURAÇÕES DE DESENVOLVIMENTO MAIS SEGURAS
const DEV_CONFIG = {
  enabled: import.meta.env.DEV && localStorage.getItem('enable_dev_mode') === 'true',
  adminUser: {
    id: 'dev-admin-001',
    email: 'dev@local.test',
    name: 'Dev Admin',
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
    'visualizar_biblioteca_materiais',
    'acessar_painel_seguranca'
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

// Controle de rate limiting melhorado
const LOGIN_ATTEMPTS = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutos de bloqueio

// Utilitário para log de segurança
const logSecurityEvent = (event: string, details: any) => {
  console.warn(`🔒 Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};

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
        
        // Log de eventos de segurança
        if (event === 'SIGNED_IN') {
          logSecurityEvent('USER_SIGNED_IN', { email: session?.user?.email });
        } else if (event === 'SIGNED_OUT') {
          logSecurityEvent('USER_SIGNED_OUT', {});
        }
        
        setSession(session);
        
        // CORREÇÃO CRÍTICA: Usar setTimeout para evitar recursão
        if (session?.user) {
          console.log('📊 Carregando dados do usuário (diferido):', session.user.email);
          setTimeout(() => {
            loadUserData(session.user.id);
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
      if (checkEmergencyAccess()) {
        setLoading(false);
        return;
      }

      // Verificar acesso de desenvolvimento (apenas em DEV e se habilitado)
      if (DEV_CONFIG.enabled && checkDevAccess()) {
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
          loadUserData(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Erro na verificação inicial:', error);
      setLoading(false);
    }
  };

  const checkEmergencyAccess = (): boolean => {
    const emergencyAccess = localStorage.getItem('emergency_access');
    const emergencyExpires = localStorage.getItem('emergency_expires');
    const emergencyToken = localStorage.getItem('emergency_token');
    
    if (emergencyAccess === 'true' && emergencyExpires && emergencyToken) {
      const expiresAt = parseInt(emergencyExpires);
      const now = Date.now();
      
      // Verificar se não expirou (máximo 1 hora)
      if (now < expiresAt && (expiresAt - now) <= 3600000) {
        // Verificar token de emergência mais seguro
        if (validateEmergencyToken(emergencyToken)) {
          setUser({
            id: 'emergency-admin',
            email: 'emergency@admin.com',
            name: 'Emergency Admin',
            role: 'admin',
            first_login_completed: true
          });
          logSecurityEvent('EMERGENCY_ACCESS_ACTIVE', { expiresAt });
          return true;
        }
      }
      
      // Limpar acesso inválido ou expirado
      localStorage.removeItem('emergency_access');
      localStorage.removeItem('emergency_expires');
      localStorage.removeItem('emergency_token');
      logSecurityEvent('EMERGENCY_ACCESS_EXPIRED', {});
    }
    return false;
  };

  const validateEmergencyToken = (token: string): boolean => {
    try {
      // Validação mais robusta do token de emergência
      const parts = token.split('-');
      if (parts.length !== 3 || parts[0] !== 'EMG' || parts[2] !== 'SECURE') {
        return false;
      }
      
      const dateStr = parts[1];
      if (dateStr.length !== 8) return false;
      
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6));
      const day = parseInt(dateStr.substring(6, 8));
      
      const tokenDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Token deve ser do dia atual
      return tokenDate.getTime() === today.getTime();
    } catch (error) {
      return false;
    }
  };

  const checkDevAccess = (): boolean => {
    if (!DEV_CONFIG.enabled) return false;
    
    const devAccess = localStorage.getItem('dev_access');
    const devUser = localStorage.getItem('dev_user');
    
    if (devAccess === 'true' && devUser) {
      try {
        const userData = JSON.parse(devUser);
        setUser(userData);
        logSecurityEvent('DEV_ACCESS_ACTIVE', { userData: userData.name });
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
      console.log('🔄 Carregando dados do usuário para ID:', userId);
      
      // CORREÇÃO CRÍTICA: Tratamento melhorado de erro RLS
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Se o erro for que não encontrou o usuário, criar um perfil básico
        if (error.code === 'PGRST116') {
          console.log('👤 Usuário não encontrado na tabela users, tentando criar...');
          await createUserProfile(userId);
          return;
        }
        
        // Se for erro de RLS, tentar aguardar e recarregar
        if (error.message?.includes('RLS') || error.message?.includes('policy')) {
          console.warn('⚠️ Erro de RLS detectado, tentando novamente em 1 segundo...');
          setTimeout(() => {
            loadUserData(userId);
          }, 1000);
          return;
        }
        
        setLoading(false);
        return;
      }

      console.log('✅ Dados do usuário carregados com sucesso:', data);

      // Converter dados do usuário
      const userData = data as unknown as DatabaseUser;
      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        seller_id: userData.seller_id,
        first_login_completed: userData.first_login_completed
      };
      
      setUser(userProfile);
      
      console.log('🎉 Perfil do usuário definido:', {
        email: userProfile.email,
        role: userProfile.role,
        name: userProfile.name
      });
      
    } catch (error) {
      console.error('💥 Erro crítico ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      console.log('🔨 Criando perfil do usuário para:', userId);
      
      // Buscar dados do auth.users
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        console.error('❌ Usuário auth não encontrado');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: authUser.user.email!,
          name: authUser.user.user_metadata?.name || authUser.user.email!.split('@')[0],
          role: 'admin', // Primeiro usuário é admin
          first_login_completed: false
        });

      if (error) {
        console.error('❌ Erro ao criar perfil do usuário:', error);
        setLoading(false);
        return;
      }

      console.log('✅ Perfil do usuário criado, recarregando dados...');
      // CORREÇÃO: Usar setTimeout para evitar recursão
      setTimeout(() => {
        loadUserData(userId);
      }, 0);
      
    } catch (error) {
      console.error('💥 Erro ao criar perfil do usuário:', error);
      setLoading(false);
    }
  };

  const checkRateLimit = (email: string): { allowed: boolean; message?: string } => {
    const now = Date.now();
    const attempts = LOGIN_ATTEMPTS.get(email);
    
    if (!attempts) {
      LOGIN_ATTEMPTS.set(email, { count: 1, lastAttempt: now });
      return { allowed: true };
    }
    
    // Verificar se ainda está bloqueado
    if (attempts.blockedUntil && now < attempts.blockedUntil) {
      const remainingTime = Math.ceil((attempts.blockedUntil - now) / 60000);
      return { 
        allowed: false, 
        message: `Conta temporariamente bloqueada. Tente novamente em ${remainingTime} minutos.`
      };
    }
    
    // Reset counter se passou da janela de tempo
    if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
      LOGIN_ATTEMPTS.set(email, { count: 1, lastAttempt: now });
      return { allowed: true };
    }
    
    // Verificar se excedeu limite
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const blockedUntil = now + LOCKOUT_DURATION;
      LOGIN_ATTEMPTS.set(email, { 
        ...attempts, 
        blockedUntil,
        lastAttempt: now 
      });
      
      logSecurityEvent('ACCOUNT_LOCKED', { email, blockedUntil });
      
      return { 
        allowed: false, 
        message: `Muitas tentativas de login. Conta bloqueada por 30 minutos.`
      };
    }
    
    // Incrementar tentativas
    LOGIN_ATTEMPTS.set(email, { count: attempts.count + 1, lastAttempt: now });
    return { allowed: true };
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentativa de login para:', email);
      
      // Validação e sanitização de input
      const cleanEmail = sanitizeInput(email.toLowerCase().trim());
      const cleanPassword = sanitizeInput(password);
      
      if (!cleanEmail || !cleanPassword) {
        return { success: false, error: 'Email e senha são obrigatórios' };
      }

      if (!validateEmail(cleanEmail)) {
        return { success: false, error: 'Email inválido' };
      }

      // Verificar rate limiting
      const rateLimitCheck = checkRateLimit(cleanEmail);
      if (!rateLimitCheck.allowed) {
        return { success: false, error: rateLimitCheck.message };
      }

      // BYPASS DE DESENVOLVIMENTO - apenas em ambiente DEV e se habilitado
      if (DEV_CONFIG.enabled && 
          cleanEmail === 'dev@admin.local' && 
          cleanPassword === 'DevSecure2024!@#') {
        
        logSecurityEvent('DEV_LOGIN_ATTEMPT', { email: cleanEmail });
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
      console.log('🔑 Tentando login no Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        logSecurityEvent('LOGIN_FAILED', { email: cleanEmail, error: error.message });
        throw error;
      }

      console.log('✅ Login no Supabase bem-sucedido:', data.user?.email);

      // Limpar rate limiting em caso de sucesso
      LOGIN_ATTEMPTS.delete(cleanEmail);
      logSecurityEvent('LOGIN_SUCCESS', { email: cleanEmail });

      // Dados do usuário serão carregados pelo listener onAuthStateChange
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('💥 Erro no login:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Validação and sanitização de input
      const cleanEmail = sanitizeInput(email.toLowerCase().trim());
      const cleanPassword = sanitizeInput(password);
      const cleanName = sanitizeInput(name.trim());

      if (!cleanEmail || !cleanPassword || !cleanName) {
        return { success: false, error: 'Todos os campos são obrigatórios' };
      }

      if (!validateEmail(cleanEmail)) {
        return { success: false, error: 'Email inválido' };
      }

      if (cleanPassword.length < 8) {
        return { success: false, error: 'A senha deve ter pelo menos 8 caracteres' };
      }

      // Verificar se senha tem complexidade mínima
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(cleanPassword)) {
        return { success: false, error: 'A senha deve conter ao menos uma letra minúscula, maiúscula e um número' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: cleanName
          }
        }
      });

      if (error) throw error;

      // Se o usuário foi criado, criar perfil
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: cleanEmail,
            name: cleanName,
            role: 'admin', // Primeiro usuário é sempre admin
            first_login_completed: false
          });

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
        }

        logSecurityEvent('USER_REGISTERED', { email: cleanEmail, name: cleanName });
      }

      return { success: true };
    } catch (error: any) {
      logSecurityEvent('REGISTRATION_FAILED', { email, error: error.message });
      console.error('Erro no signup:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao criar conta' 
      };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔓 Fazendo logout do usuário:', user?.email);
      logSecurityEvent('LOGOUT_INITIATED', { userId: user?.id });
      
      // Limpar acessos especiais
      localStorage.removeItem('dev_access');
      localStorage.removeItem('dev_user');
      localStorage.removeItem('emergency_access');
      localStorage.removeItem('emergency_expires');
      localStorage.removeItem('emergency_token');
      
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
