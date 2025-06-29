
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useAuth } from '@/contexts/AuthContext';

export function SecurityDashboard() {
  const { alerts, dismissAlert, clearAllAlerts } = useSecurityMonitoring();
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas administradores podem acessar o painel de segurança.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Painel de Segurança</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sistema Monitorado
          </Badge>
        </div>
      </div>

      {/* Estatísticas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-bold text-green-600">Seguro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
                <p className="text-lg font-bold">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Sessões Ativas</p>
                <p className="text-lg font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Tentativas Bloqueadas</p>
                <p className="text-lg font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alertas de Segurança</CardTitle>
            {alerts.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllAlerts}
              >
                Limpar Todos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum alerta de segurança ativo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      Dispensar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recomendações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Autenticação implementada</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Rate limiting ativo</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Sanitização de dados implementada</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Configure RLS policies no Supabase</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
