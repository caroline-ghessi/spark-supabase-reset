
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AuthDebugPanel } from '@/components/whatsapp/AuthDebugPanel';

interface DashboardAlertsProps {
  showDebug: boolean;
  user: any;
  authLoading: boolean;
  rlsTestPassed: boolean | null;
  testingRLS: boolean;
  loading: boolean;
  conversationsLength: number;
  onRetryLoad: () => void;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({
  showDebug,
  user,
  authLoading,
  rlsTestPassed,
  testingRLS,
  loading,
  conversationsLength,
  onRetryLoad
}) => {
  return (
    <>
      {/* Painel de Debug */}
      {showDebug && <AuthDebugPanel />}

      {/* Alerta de não autenticado */}
      {!user && !authLoading && (
        <Alert className="mb-2 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              <strong>Não Autenticado:</strong> Faça login para ver as conversas.
            </span>
            <Button 
              onClick={() => window.location.href = '/login'} 
              size="sm" 
              variant="outline"
              className="ml-4"
            >
              Fazer Login
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de RLS se necessário */}
      {user && rlsTestPassed === false && (
        <Alert className="mb-2 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              <strong>Problema de Autenticação:</strong> Políticas de segurança com erro.
            </span>
            <Button 
              onClick={() => window.location.reload()} 
              size="sm" 
              variant="outline"
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Recarregar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading compacto */}
      {(loading || authLoading) && (
        <Alert className="mb-2 border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription className="text-sm">
            {authLoading ? 'Verificando autenticação...' : 
             testingRLS ? 'Verificando permissões...' : 'Carregando conversas...'}
          </AlertDescription>
        </Alert>
      )}

      {/* Erro compacto */}
      {user && !loading && conversationsLength === 0 && (
        <Alert className="mb-2 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between text-sm">
            <span>Nenhuma conversa encontrada.</span>
            <Button 
              onClick={onRetryLoad} 
              size="sm" 
              variant="outline"
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
