
import { DEV_CONFIG } from './devConfig';
import { logSecurityEvent } from './security';
import type { User } from './types';

export const checkDevAccess = (setUser: (user: User | null) => void): boolean => {
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
