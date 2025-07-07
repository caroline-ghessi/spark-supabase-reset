
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Loader2 } from 'lucide-react';
import { 
  Link, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  MessageSquare,
  Bot,
  Phone,
  Key,
  Globe,
  Settings
} from 'lucide-react';
import { useIntegrationsData } from '../../hooks/useIntegrationsData';

interface IntegracoesTabProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const IntegracoesTab = ({ onUnsavedChanges }: IntegracoesTabProps) => {
  const { 
    integrations, 
    loading, 
    testingConnection, 
    testConnection 
  } = useIntegrationsData();

  const getStatusColor = (status: string) => {
    return status === 'conectado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    return status === 'conectado' ? CheckCircle : XCircle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Carregando configurações de integrações...</span>
      </div>
    );
  }

  if (!integrations) {
    return (
      <div className="text-center text-gray-600">
        <p>Erro ao carregar dados das integrações.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integrações</h2>
        <p className="text-gray-600">Configure as conexões com APIs e serviços externos</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Integrações Ativas</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Status Sistema</p>
                <p className="text-xl font-bold text-green-600">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">WhatsApp</p>
                <p className="text-sm font-bold text-green-600">Conectado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Bot Dify</p>
                <p className="text-sm font-bold text-blue-600">Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Business API */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <div>
                <CardTitle>{integrations.whatsapp.nome}</CardTitle>
                <p className="text-sm text-gray-600">{integrations.whatsapp.descricao}</p>
              </div>
            </div>
            <Badge className={getStatusColor(integrations.whatsapp.status)}>
              {integrations.whatsapp.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsapp-token">Token de Acesso</Label>
              <Input 
                id="whatsapp-token" 
                type="password" 
                value={integrations.whatsapp.config.token}
                placeholder="Token da Meta Business"
              />
            </div>
            <div>
              <Label htmlFor="phone-number">Número do Telefone</Label>
              <Input 
                id="phone-number" 
                value={integrations.whatsapp.config.phoneNumber}
                placeholder="5511999999999"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Webhook URL: {integrations.whatsapp.config.webhookUrl}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testConnection('whatsapp')}
              disabled={testingConnection === 'whatsapp'}
            >
              {testingConnection === 'whatsapp' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Testar Conexão'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* W-API Vendedores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>{integrations.wapi.nome}</CardTitle>
                <p className="text-sm text-gray-600">{integrations.wapi.descricao}</p>
              </div>
            </div>
            <Badge className={getStatusColor(integrations.wapi.status)}>
              {integrations.wapi.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(integrations.wapi.config).map(([vendedor, status]) => {
              const StatusIcon = getStatusIcon(status as string);
              return (
                <div key={vendedor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-5 h-5 ${status === 'conectado' ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="font-medium capitalize">{vendedor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(status as string)}>
                      {status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dify Bot */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-purple-600" />
              <div>
                <CardTitle>{integrations.dify.nome}</CardTitle>
                <p className="text-sm text-gray-600">{integrations.dify.descricao}</p>
              </div>
            </div>
            <Badge className={getStatusColor(integrations.dify.status)}>
              {integrations.dify.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dify-api-key">API Key</Label>
              <Input 
                id="dify-api-key" 
                type="password" 
                value={integrations.dify.config.apiKey}
                placeholder="dify_xxxxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="dify-base-url">Base URL</Label>
              <Input 
                id="dify-base-url" 
                value={integrations.dify.config.baseUrl}
                placeholder="https://api.dify.ai"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="chatflow-id">Chatflow ID</Label>
            <Input 
              id="chatflow-id" 
              value={integrations.dify.config.chatflowId}
              placeholder="flow_123456"
            />
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Status do Bot: <span className="font-medium text-green-600">Ativo e Respondendo</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => testConnection('dify')}
              disabled={testingConnection === 'dify'}
            >
              {testingConnection === 'dify' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Testar Bot'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configurações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout de Conexão (segundos)</Label>
              <Input id="timeout" type="number" defaultValue={30} />
            </div>
            <div>
              <Label htmlFor="retry">Tentativas de Reconexão</Label>
              <Input id="retry" type="number" defaultValue={3} />
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Status das Integrações</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>• WhatsApp Business API: Conectado e funcionando</p>
              <p>• W-API Vendedores: 2 de 3 vendedores conectados</p>
              <p>• Dify Bot: Ativo e processando mensagens</p>
              <p>• Última verificação: agora mesmo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
