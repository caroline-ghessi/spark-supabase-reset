
import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Bot, 
  UserCheck, 
  Bell, 
  Link, 
  Settings as SettingsIcon,
  BarChart3
} from 'lucide-react';
import { RealSellersPanel } from '../sellers/RealSellersPanel';
import { IAPromptsTab } from './IAPromptsTab';
import { ClientesTab } from './ClientesTab';
import { AlertasTab } from './AlertasTab';
import { IntegracoesTab } from './IntegracoesTab';
import { ConfigAvancadasTab } from './ConfigAvancadasTab';

export const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard Geral',
      icon: BarChart3,
      description: 'Visão geral das configurações'
    },
    {
      id: 'vendedores',
      label: 'Gestão de Vendedores',
      icon: Users,
      description: 'Gerenciar equipe de vendas'
    },
    {
      id: 'ia-prompts',
      label: 'IA & Prompts',
      icon: Bot,
      description: 'Configurar agentes de IA'
    },
    {
      id: 'clientes',
      label: 'Gestão de Clientes',
      icon: UserCheck,
      description: 'Base de clientes'
    },
    {
      id: 'alertas',
      label: 'Alertas e Escalação',
      icon: Bell,
      description: 'Configurar notificações'
    },
    {
      id: 'integracoes',
      label: 'Integrações',
      icon: Link,
      description: 'APIs e conexões'
    },
    {
      id: 'avancadas',
      label: 'Configurações Avançadas',
      icon: SettingsIcon,
      description: 'Configurações do sistema'
    }
  ];

  const handleSaveChanges = () => {
    // Simular salvamento
    console.log('Saving changes...');
    setHasUnsavedChanges(false);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard de Configurações</h2>
        <p className="text-gray-600">Visão geral do status das configurações da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              De 5 vendedores cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes de IA</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Todos ativos e funcionando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Configurados</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              6 ativos, 2 inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrações</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              WhatsApp, W-API, Dify
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Online</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Última atualização: hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status das Configurações</CardTitle>
          <CardDescription>Verificação rápida do status de cada módulo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tabs.slice(1).map((tab) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">{tab.label}</p>
                      <p className="text-sm text-gray-600">{tab.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Configurado
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'vendedores':
        return <RealSellersPanel />;
      case 'ia-prompts':
        return <IAPromptsTab onUnsavedChanges={setHasUnsavedChanges} />;
      case 'clientes':
        return <ClientesTab onUnsavedChanges={setHasUnsavedChanges} />;
      case 'alertas':
        return <AlertasTab onUnsavedChanges={setHasUnsavedChanges} />;
      case 'integracoes':
        return <IntegracoesTab onUnsavedChanges={setHasUnsavedChanges} />;
      case 'avancadas':
        return <ConfigAvancadasTab onUnsavedChanges={setHasUnsavedChanges} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Centro de controle administrativo da plataforma</p>
          </div>
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Alterações não salvas
              </Badge>
              <Button onClick={handleSaveChanges} className="bg-orange-500 hover:bg-orange-600">
                Salvar Alterações
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-orange-50 text-orange-600 border border-orange-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <ScrollArea className="h-full">
            <div className="p-6">
              {renderTabContent()}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
