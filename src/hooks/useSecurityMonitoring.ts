
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'multiple_failures' | 'unusual_activity' | 'rate_limit_exceeded' | 'emergency_access' | 'dev_access' | 'xss_attempt' | 'sql_injection_attempt';
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  acknowledged?: boolean;
}

interface SecurityMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  lastAlert?: SecurityAlert;
}

export function useSecurityMonitoring() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAlerts: 0,
    criticalAlerts: 0,
    highAlerts: 0,
    mediumAlerts: 0,
    lowAlerts: 0
  });

  // Carregar alertas do localStorage na inicialização
  useEffect(() => {
    const savedAlerts = localStorage.getItem('security_alerts');
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts) as SecurityAlert[];
        setAlerts(parsedAlerts);
        updateMetrics(parsedAlerts);
      } catch (error) {
        console.error('Erro ao carregar alertas salvos:', error);
      }
    }
  }, []);

  // Salvar alertas no localStorage sempre que mudarem
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('security_alerts', JSON.stringify(alerts));
      updateMetrics(alerts);
    }
  }, [alerts]);

  useEffect(() => {
    if (user?.role === 'admin') {
      startMonitoring();
    }
    
    return () => {
      setIsMonitoring(false);
    };
  }, [user]);

  const updateMetrics = useCallback((alertsList: SecurityAlert[]) => {
    const metrics: SecurityMetrics = {
      totalAlerts: alertsList.length,
      criticalAlerts: alertsList.filter(a => a.severity === 'critical').length,
      highAlerts: alertsList.filter(a => a.severity === 'high').length,
      mediumAlerts: alertsList.filter(a => a.severity === 'medium').length,
      lowAlerts: alertsList.filter(a => a.severity === 'low').length,
      lastAlert: alertsList[0] // Assumindo que o array está ordenado por data desc
    };
    setMetrics(metrics);
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Monitorar tentativas de login suspeitas
    const checkSuspiciousActivity = () => {
      // Verificar múltiplas tentativas de login
      const loginAttempts = localStorage.getItem('login_attempts');
      if (loginAttempts && parseInt(loginAttempts) > 10) {
        addAlert({
          type: 'multiple_failures',
          message: `${loginAttempts} tentativas de login falharam nas últimas horas`,
          severity: 'high',
          details: { attempts: parseInt(loginAttempts) }
        });
      }

      // Verificar acesso de emergência ativo
      const emergencyAccess = localStorage.getItem('emergency_access');
      if (emergencyAccess === 'true') {
        const expires = localStorage.getItem('emergency_expires');
        addAlert({
          type: 'emergency_access',
          message: 'Acesso de emergência está ativo',
          severity: 'critical',
          details: { 
            expiresAt: expires ? new Date(parseInt(expires)).toISOString() : 'unknown' 
          }
        });
      }

      // Verificar acesso de desenvolvimento
      const devAccess = localStorage.getItem('dev_access');
      if (devAccess === 'true') {
        addAlert({
          type: 'dev_access',
          message: 'Acesso de desenvolvimento está ativo',
          severity: 'medium',
          details: { environment: 'development' }
        });
      }

      // Monitorar padrões de navegação suspeitos
      checkNavigationPatterns();
      
      // Verificar integridade da sessão
      checkSessionIntegrity();
    };

    // Verificar padrões suspeitos de navegação
    const checkNavigationPatterns = () => {
      const navigationHistory = performance.getEntriesByType('navigation');
      if (navigationHistory.length > 0) {
        const nav = navigationHistory[0] as PerformanceNavigationTiming;
        
        // Verificar se a página foi recarregada muitas vezes
        if (nav.type === 'reload') {
          const reloadCount = parseInt(sessionStorage.getItem('reload_count') || '0') + 1;
          sessionStorage.setItem('reload_count', reloadCount.toString());
          
          if (reloadCount > 5) {
            addAlert({
              type: 'unusual_activity',
              message: `Página recarregada ${reloadCount} vezes em sequência`,
              severity: 'low',
              details: { reloadCount }
            });
          }
        }
      }
    };

    // Verificar integridade da sessão
    const checkSessionIntegrity = () => {
      const currentUser = user;
      const sessionStart = sessionStorage.getItem('session_start');
      
      if (currentUser && !sessionStart) {
        sessionStorage.setItem('session_start', Date.now().toString());
      }
      
      if (currentUser && sessionStart) {
        const sessionDuration = Date.now() - parseInt(sessionStart);
        const maxSessionDuration = 8 * 60 * 60 * 1000; // 8 horas
        
        if (sessionDuration > maxSessionDuration) {
          addAlert({
            type: 'unusual_activity',
            message: 'Sessão ativa por mais de 8 horas',
            severity: 'medium',
            details: { 
              sessionDuration: Math.floor(sessionDuration / 60000), // em minutos
              user: currentUser.email 
            }
          });
        }
      }
    };

    // Verificar a cada 30 segundos
    const interval = setInterval(checkSuspiciousActivity, 30000);
    
    // Verificação inicial
    checkSuspiciousActivity();
    
    return () => clearInterval(interval);
  }, [user]);

  const addAlert = useCallback(async (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => {
    // Evitar alertas duplicados
    const isDuplicate = alerts.some(existingAlert => 
      existingAlert.type === alert.type && 
      existingAlert.message === alert.message &&
      (Date.now() - existingAlert.timestamp) < 60000 // Dentro de 1 minuto
    );

    if (isDuplicate) return;

    const newAlert: SecurityAlert = {
      ...alert,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      acknowledged: false
    };
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 100)); // Manter apenas 100 alertas
    
    // SECURITY: Log to database for audit trail
    try {
      await supabase.functions.invoke('log-security-event', {
        body: {
          eventType: alert.type,
          severity: alert.severity,
          message: alert.message,
          details: alert.details
        }
      });
    } catch (error) {
      console.error('Failed to log security event to database:', error);
    }
    
    // Log para auditoria local
    console.warn(`🔒 Security Alert [${alert.severity.toUpperCase()}]:`, {
      ...newAlert,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Notificar administradores (em implementação futura)
    if (alert.severity === 'critical') {
      notifyAdministrators(newAlert);
    }
  }, [alerts]);

  const notifyAdministrators = (alert: SecurityAlert) => {
    // Em uma implementação real, isso enviaria notificações para administradores
    console.error('🚨 CRITICAL SECURITY ALERT:', alert);
    
    // Mostrar notificação do navegador se permitido
    if (Notification.permission === 'granted') {
      new Notification('Alerta de Segurança Crítico', {
        body: alert.message,
        icon: '/favicon.ico',
        requireInteraction: true
      });
    }
  };

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
    localStorage.removeItem('security_alerts');
  }, []);

  const clearAcknowledgedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(alert => !alert.acknowledged));
  }, []);

  // Método público para outros componentes adicionarem alertas
  const reportSecurityEvent = useCallback((
    type: SecurityAlert['type'], 
    message: string, 
    severity: SecurityAlert['severity'] = 'medium',
    details?: Record<string, any>
  ) => {
    addAlert({ type, message, severity, details });
  }, [addAlert]);

  return {
    alerts,
    metrics,
    isMonitoring,
    addAlert,
    dismissAlert,
    acknowledgeAlert,
    clearAllAlerts,
    clearAcknowledgedAlerts,
    reportSecurityEvent
  };
}
