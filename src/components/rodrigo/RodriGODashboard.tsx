import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRodriGOCommunications } from '@/hooks/useRodriGOCommunications';
import { 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Bell,
  Users,
  Activity
} from 'lucide-react';

export const RodriGODashboard: React.FC = () => {
  const {
    communicationLogs,
    alertRules,
    loading,
    sending,
    getStats,
    notifications,
    alerts,
    escalations,
    generalMessages,
    loadCommunicationLogs
  } = useRodriGOCommunications();

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Carregando dados do Rodri.GO...</span>
      </div>
    );
  }

  const getContextIcon = (contextType: string) => {
    switch (contextType) {
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'escalation': return <TrendingUp className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getContextColor = (contextType: string) => {
    switch (contextType) {
      case 'notification': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-orange-100 text-orange-800';
      case 'escalation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🤖 Dashboard Rodri.GO</h1>
          <p className="text-gray-600">Central de comunicações e alertas automatizados</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <Activity className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadCommunicationLogs()}
            disabled={loading}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Mensagens</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Notificações</p>
                <p className="text-2xl font-bold">{stats.byContext.notification || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Alertas</p>
                <p className="text-2xl font-bold">{stats.byContext.alert || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Escalações</p>
                <p className="text-2xl font-bold">{stats.byContext.escalation || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Logs de Comunicação</span>
            <Badge variant="outline">{communicationLogs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {communicationLogs.slice(0, 50).map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getContextIcon(log.context_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getContextColor(log.context_type)}>
                        {log.context_type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Para: {log.recipient_number}</p>
                      <p className="text-gray-600 truncate">{log.message_content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {communicationLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma comunicação registrada ainda</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Regras de Alerta Ativas</span>
            <Badge variant="outline">{alertRules.filter(r => r.is_active).length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertRules
              .filter(rule => rule.is_active)
              .map((rule) => (
                <div key={rule.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{rule.name}</h4>
                    <Badge 
                      className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {rule.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Tipo: <span className="font-medium">{rule.rule_type}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Cooldown: {rule.cooldown_minutes} minutos
                  </p>
                </div>
              ))}
            {alertRules.filter(r => r.is_active).length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma regra de alerta ativa</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats by Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span>Notificações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {notifications.length}
            </div>
            <p className="text-sm text-gray-600">
              Últimas 24h: {notifications.filter(n => 
                new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Alertas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {alerts.length}
            </div>
            <p className="text-sm text-gray-600">
              Últimas 24h: {alerts.filter(a => 
                new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <span>Escalações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mb-2">
              {escalations.length}
            </div>
            <p className="text-sm text-gray-600">
              Últimas 24h: {escalations.filter(e => 
                new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};