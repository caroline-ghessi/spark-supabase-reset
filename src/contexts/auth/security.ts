
import type { LoginAttempt } from './types';

// Controle de rate limiting mais inteligente
const LOGIN_ATTEMPTS = new Map<string, LoginAttempt>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const LOCKOUT_DURATION = 15 * 60 * 1000; // Reduzido para 15 minutos

// Utilitário para log de segurança
export const logSecurityEvent = (event: string, details: any) => {
  console.warn(`🔒 Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Função para limpar estado local (nova funcionalidade)
export const clearLocalAuthState = () => {
  console.log('🧹 Limpando estado local de autenticação...');
  
  // Limpar rate limiting
  LOGIN_ATTEMPTS.clear();
  
  // Limpar localStorage
  const keysToRemove = [
    'login_attempts_count',
    'login_attempts',
    'login_blocked_until',
    'dev_access',
    'dev_user',
    'emergency_access',
    'emergency_expires',
    'emergency_token'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpar sessionStorage também
  sessionStorage.removeItem('reload_count');
  sessionStorage.removeItem('session_start');
  
  console.log('✅ Estado local limpo com sucesso');
};

export const checkRateLimit = (email: string): { allowed: boolean; message?: string } => {
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
  
  // Reset counter se passou da janela de tempo - CORRIGIDO
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
    
    logSecurityEvent('ACCOUNT_LOCKED', { 
      email, 
      blockedUntil,
      duration: Math.ceil(LOCKOUT_DURATION / 60000) + ' minutos'
    });
    
    return { 
      allowed: false, 
      message: `Muitas tentativas de login. Conta bloqueada por 15 minutos.`
    };
  }
  
  // Incrementar tentativas
  LOGIN_ATTEMPTS.set(email, { count: attempts.count + 1, lastAttempt: now });
  return { allowed: true };
};

export const clearRateLimit = (email: string) => {
  LOGIN_ATTEMPTS.delete(email);
  console.log(`✅ Rate limit limpo para: ${email}`);
};

export const validateEmergencyToken = (token: string): boolean => {
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

// Nova função para debug de rate limiting
export const debugRateLimit = (email: string) => {
  const attempts = LOGIN_ATTEMPTS.get(email);
  console.log(`🔍 Debug Rate Limit para ${email}:`, {
    attempts: attempts?.count || 0,
    lastAttempt: attempts?.lastAttempt ? new Date(attempts.lastAttempt).toISOString() : 'nunca',
    blockedUntil: attempts?.blockedUntil ? new Date(attempts.blockedUntil).toISOString() : 'não bloqueado',
    isBlocked: attempts?.blockedUntil ? Date.now() < attempts.blockedUntil : false
  });
};
