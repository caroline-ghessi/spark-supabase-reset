
import { logSecurityEvent, validateEmergencyToken } from './security';
import type { User } from './types';

export const checkEmergencyAccess = (setUser: (user: User | null) => void): boolean => {
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
