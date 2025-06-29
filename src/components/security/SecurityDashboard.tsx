
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useAuth } from '@/contexts/AuthContext';

export function SecurityDashboard() {
  const { alerts, metrics, dismissAlert, acknowledgeAlert, clearAllAlerts, clearAcknowledgedAlerts } = useSecurityMonitoring();
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const toggleDetails = (alertId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [alertId]: !prev[alertId]
    }));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Métricas de Segurança */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-bold text-green-600">
                      {metrics.criticalAlerts === 0 ? 'Seguro' : 'Atenção'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Críticos</p>
                    <p className="text-lg font-bold text-red-600">{metrics.criticalAlerts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Altos</p>
                    <p className="text-lg font-bold text-orange-600">{metrics.highAlerts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Médios</p>
                    <p className="text-lg font-bold text-yellow-600">{metrics.mediumAlerts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-bold">{metrics.totalAlerts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Último Alerta */}
          {metrics.lastAlert && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Último Alerta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(metrics.lastAlert.severity)}
                    <div>
                      <p className="font-medium">{metrics.lastAlert.message}</p>
                      <p className="text-sm text-gray-600">
                        {formatTimestamp(metrics.lastAlert.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(metrics.lastAlert.severity)}>
                    {metrics.lastAlert.severity}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          {/* Filtros de Alertas */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
                <Button
                  key={severity}
                  variant={filter === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(severity as any)}
                >
                  {severity === 'all' ? 'Todos' : severity.charAt(0).toUpperCase() + severity.slice(1)}
                  {severity !== 'all' && (
                    <span className="ml-1">
                      ({severity === 'critical' ? metrics.criticalAlerts : 
                        severity === 'high' ? metrics.highAlerts :
                        severity === 'medium' ? metrics.mediumAlerts : metrics.lowAlerts})
                    </span>
                  )}
                </Button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAcknowledgedAlerts}
              >
                Limpar Reconhecidos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearAllAlerts}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar Todos
              </Button>
            </div>
          </div>

          {/* Lista de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança ({filteredAlerts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {filter === 'all' ? 'Nenhum alerta de segurança ativo' : `Nenhum alerta ${filter} encontrado`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.acknowledged ? 'bg-gray-50 opacity-60' : 'bg-white'
                      } ${
                        alert.severity === 'critical' ? 'border-l-red-500' :
                        alert.severity === 'high' ? 'border-l-orange-500' :
                        alert.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getSeverityIcon(alert.severity)}
                          <div>
                            <p className={`font-medium ${alert.acknowledged ? 'line-through' : ''}`}>
                              {alert.message}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatTimestamp(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {alert.details && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleDetails(alert.id)}
                            >
                              {showDetails[alert.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          )}
                          {!alert.acknowledged && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              Reconhecer
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Dispensar
                          </Button>
                        </div>
                      </div>
                      
                      {showDetails[alert.id] && alert.details && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(alert.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          {/* Recomendações de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Autenticação implementada</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Rate limiting ativo</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Sanitização de dados implementada</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Monitoramento de segurança ativo</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">Configure RLS policies no Supabase</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">Implemente Content Security Policy (CSP)</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">Configure backup automático do banco de dados</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Considere implementar 2FA para administradores</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
