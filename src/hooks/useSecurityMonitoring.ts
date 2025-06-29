
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'multiple_failures' | 'unusual_activity';
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function useSecurityMonitoring() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      startMonitoring();
    }
    
    return () => {
      setIsMonitoring(false);
    };
  }, [user]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // Monitorar tentativas de login suspeitas
    const checkSuspiciousActivity = () => {
      const loginAttempts = localStorage.getItem('login_attempts');
      if (loginAttempts && parseInt(loginAttempts) > 10) {
        addAlert({
          type: 'multiple_failures',
          message: 'Múltiplas tentativas de login falharam',
          severity: 'high'
        });
      }
    };

    // Verificar a cada 30 segundos
    const interval = setInterval(checkSuspiciousActivity, 30000);
    
    return () => clearInterval(interval);
  };

  const addAlert = (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => {
    const newAlert: SecurityAlert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Manter apenas 50 alertas
    
    // Log para auditoria
    console.warn('🔒 Security Alert:', newAlert);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts,
    isMonitoring,
    addAlert,
    dismissAlert,
    clearAllAlerts
  };
}
