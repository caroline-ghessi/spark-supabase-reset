
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'seller' | 'supervisor';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Log de tentativas de acesso para auditoria
  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('🔐 Acesso autorizado:', {
          user: user.email,
          role: user.role,
          route: location.pathname,
          timestamp: new Date().toISOString(),
          requiredRole,
          isRealUser: !user.id.startsWith('temp-') && !user.id.startsWith('dev-') && !user.id.startsWith('emergency-')
        });
      } else {
        console.warn('🚫 Acesso negado - usuário não autenticado:', {
          route: location.pathname,
          timestamp: new Date().toISOString(),
          requiredRole
        });
      }
    }
  }, [user, loading, location.pathname, requiredRole]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Bloquear usuários temporários para rotas críticas como WhatsApp
  if (user && (user.id.startsWith('temp-') || user.id.startsWith('dev-') || user.id.startsWith('emergency-'))) {
    if (location.pathname === '/whatsapp') {
      console.warn('🚫 Usuário temporário tentando acessar WhatsApp - redirecionando para login');
      return <Navigate to="/login" state={{ from: location, message: 'Use uma conta real para acessar o WhatsApp' }} replace />;
    }
  }

  // Redirecionar para login se não autenticado
  if (!user) {
    console.warn('🚫 Redirecionando para login - usuário não autenticado');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar role se necessário
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    console.warn('🚫 Acesso negado por role:', {
      user: user.email,
      userRole: user.role,
      requiredRole,
      route: location.pathname
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <h1 className="text-2xl font-bold text-red-800 mb-2">Acesso Negado</h1>
            <p className="text-red-600">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-red-500 mt-2">
              Role necessária: {requiredRole} | Sua role: {user.role}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Voltar à página anterior
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
