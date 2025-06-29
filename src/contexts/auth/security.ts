
import type { LoginAttempt } from './types';

// Controle de rate limiting
const LOGIN_ATTEMPTS = new Map<string, LoginAttempt>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutos de bloqueio

// Utilitário para log de segurança
export const logSecurityEvent = (event: string, details: any) => {
  console.warn(`🔒 Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
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

export const clearRateLimit = (email: string) => {
  LOGIN_ATTEMPTS.delete(email);
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
