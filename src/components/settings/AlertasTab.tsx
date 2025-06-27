
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Users, 
  TrendingDown,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { mockTiposAlerta, mockContatosEscalacao, TipoAlerta, ContatoEscalacao } from '../../data/configData';

interface AlertasTabProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const AlertasTab = ({ onUnsavedChanges }: AlertasTabProps) => {
  const [alertas, setAlertas] = useState(mockTiposAlerta);
  const [contatos, setContatos] = useState(mockContatosEscalacao);

  const toggleAlerta = (index: number) => {
    const updated = [...alertas];
    updated[index].ativo = !updated[index].ativo;
    setAlertas(updated);
    onUnsavedChanges(true);
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return AlertTriangle;
      case 'alta': return Bell;
      case 'media': return Clock;
      case 'baixa': return TrendingDown;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Alertas e Escalação</h2>
        <p className="text-gray-600">Configure notificações automáticas e níveis de escalação</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Alertas Configurados</p>
                <p className="text-xl font-bold">{alertas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
                <p className="text-xl font-bold">{alertas.filter(a => a.ativo).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Contatos Escalação</p>
                <p className="text-xl font-bold">{contatos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Níveis Escalação</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração de Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Tipos de Alerta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertas.map((alerta, index) => {
              const PrioridadeIcon = getPrioridadeIcon(alerta.prioridade);
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <PrioridadeIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{alerta.nome}</h4>
                        <p className="text-sm text-gray-600">{alerta.condicao}</p>
                      </div>
                    </div>
                    <Switch
                      checked={alerta.ativo}
                      onCheckedChange={() => toggleAlerta(index)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Destinatário:</p>
                      <p className="font-medium">{alerta.destinatario}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Canal:</p>
                      <p className="font-medium">{alerta.canal}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Badge className={getPrioridadeColor(alerta.prioridade)}>
                      {alerta.prioridade.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Contatos de Escalação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Contatos de Escalação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contatos.map((contato, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{contato.nome}</h4>
                    <p className="text-sm text-gray-600">{contato.cargo}</p>
                  </div>
                  <Badge variant="outline">
                    Nível {contato.nivelEscalacao}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{contato.whatsapp}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{contato.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Disponível: {contato.horarioAtendimento}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full">
              Adicionar Novo Contato
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Configurações Avançadas de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="intervalo-verificacao">Intervalo de Verificação (minutos)</Label>
              <Input id="intervalo-verificacao" type="number" defaultValue={5} />
            </div>
            <div>
              <Label htmlFor="limite-alertas">Limite de Alertas por Hora</Label>
              <Input id="limite-alertas" type="number" defaultValue={10} />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Canais de Notificação</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span>WhatsApp</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Email</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span>Dashboard</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
