
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, validateEmail, validatePassword } from '@/utils/sanitize';
import { checkRateLimit, clearRateLimit, logSecurityEvent } from './security';
import { DEV_CONFIG } from './devConfig';
import type { User } from './types';

export const signIn = async (
  email: string,
  password: string,
  setUser: (user: User | null) => void
) => {
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

    // BYPASS TEMPORÁRIO PARA ADMIN (enquanto não há usuários reais)
    if (cleanEmail === 'admin@whatsapp.local' && cleanPassword === 'admin123') {
      const adminUser: User = {
        id: 'temp-admin-001',
        email: cleanEmail,
        name: 'Administrator',
        role: 'admin',
        first_login_completed: true
      };
      
      logSecurityEvent('TEMP_ADMIN_LOGIN', { email: cleanEmail });
      setUser(adminUser);
      
      // Salvar temporariamente
      localStorage.setItem('temp_admin_access', 'true');
      localStorage.setItem('temp_admin_user', JSON.stringify(adminUser));
      
      return { 
        success: true, 
        user: adminUser,
        message: 'Acesso temporário de administrador' 
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
    clearRateLimit(cleanEmail);
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

export const signUp = async (email: string, password: string, name: string) => {
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

    const passwordValidation = validatePassword(cleanPassword);
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.errors.join(', ') };
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

export const signOut = async (
  user: User | null,
  session: any,
  setUser: (user: User | null) => void,
  setSession: (session: any) => void
) => {
  try {
    console.log('🔓 Fazendo logout do usuário:', user?.email);
    logSecurityEvent('LOGOUT_INITIATED', { userId: user?.id });
    
    // Limpar acessos especiais
    localStorage.removeItem('dev_access');
    localStorage.removeItem('dev_user');
    localStorage.removeItem('emergency_access');
    localStorage.removeItem('emergency_expires');
    localStorage.removeItem('emergency_token');
    localStorage.removeItem('temp_admin_access');
    localStorage.removeItem('temp_admin_user');
    
    // Se for usuário real do Supabase, fazer logout
    if (session && user?.id && !user.id.startsWith('dev-') && !user.id.startsWith('emergency-') && !user.id.startsWith('temp-')) {
      await supabase.auth.signOut();
    }
    
    setUser(null);
    setSession(null);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};
