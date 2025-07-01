
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/components/users/AuthenticatedUserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export const AuthDebugPanel: React.FC = () => {
  const auth = useAuth();
  const userContext = useUser();

  const handleResetAuth = () => {
    if (auth.resetAuthState) {
      console.log('🔄 Resetando estado de autenticação...');
      auth.resetAuthState();
    }
  };

  const authStatus = auth.user ? 'authenticated' : 'not_authenticated';
  const userContextStatus = userContext.currentUser ? 'loaded' : 'not_loaded';

  return (
    <Card className="mb-4 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Debug de Autenticação</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Status Geral:</span>
          <Badge className={authStatus === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {authStatus === 'authenticated' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Autenticado
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-1" />
                Não Autenticado
              </>
            )}
          </Badge>
        </div>

        {/* Detalhes do AuthContext */}
        <div className="space-y-2">
          <h4 className="font-medium">AuthContext:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Loading: <Badge>{auth.loading ? 'true' : 'false'}</Badge></div>
            <div>User ID: <Badge>{auth.user?.id ? auth.user.id.slice(0, 8) + '...' : 'null'}</Badge></div>
            <div>Email: <Badge>{auth.user?.email || 'null'}</Badge></div>
            <div>Role: <Badge>{auth.user?.role || 'null'}</Badge></div>
            <div>Session: <Badge>{auth.session ? 'ativa' : 'null'}</Badge></div>
            <div>Seller ID: <Badge>{auth.user?.seller_id ? auth.user.seller_id.slice(0, 8) + '...' : 'null'}</Badge></div>
          </div>
        </div>

        {/* Detalhes do UserContext */}
        <div className="space-y-2">
          <h4 className="font-medium">UserContext:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Status: <Badge>{userContextStatus}</Badge></div>
            <div>Name: <Badge>{userContext.currentUser?.nome || 'null'}</Badge></div>
            <div>Level: <Badge>{userContext.currentUser?.nivel || 'null'}</Badge></div>
          </div>
        </div>

        {/* Permissões */}
        <div className="space-y-2">
          <h4 className="font-medium">Permissões:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Ver Conversas: <Badge>{auth.hasPermission('monitorar_conversas') ? 'Sim' : 'Não'}</Badge></div>
            <div>Assumir Controle: <Badge>{auth.hasPermission('assumir_controle') ? 'Sim' : 'Não'}</Badge></div>
            <div>Admin: <Badge>{auth.isAdmin ? 'Sim' : 'Não'}</Badge></div>
            <div>Supervisor: <Badge>{auth.isSupervisor ? 'Sim' : 'Não'}</Badge></div>
          </div>
        </div>

        {/* Botão de Reset */}
        <div className="pt-2 border-t">
          <Button 
            onClick={handleResetAuth}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Authentication
          </Button>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div>Auth UID: {auth.session?.user?.id || 'null'}</div>
          <div>Timestamp: {new Date().toISOString()}</div>
        </div>
      </CardContent>
    </Card>
  );
};
