
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Loader2, Edit, Trash2 } from 'lucide-react';
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
import { useAlertsSystem, EscalationContact } from '../../hooks/useAlertsSystem';
import { EscalationContactModal } from './EscalationContactModal';

interface AlertasTabProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const AlertasTab = ({ onUnsavedChanges }: AlertasTabProps) => {
  const { 
    alertTypes, 
    escalationContacts, 
    loading, 
    toggleAlertType,
    addEscalationContact,
    updateEscalationContact,
    deleteEscalationContact
  } = useAlertsSystem();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EscalationContact | null>(null);

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    await toggleAlertType(alertId, isActive);
    onUnsavedChanges(true);
  };

  const handleSaveContact = async (contactData: Omit<EscalationContact, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingContact) {
      await updateEscalationContact(editingContact.id, contactData);
    } else {
      await addEscalationContact(contactData);
    }
    setEditingContact(null);
    onUnsavedChanges(true);
  };

  const handleEditContact = (contact: EscalationContact) => {
    setEditingContact(contact);
    setModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Tem certeza que deseja remover este contato?')) {
      await deleteEscalationContact(contactId);
      onUnsavedChanges(true);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case 'critica': return AlertTriangle;
      case 'alta': return Bell;
      case 'media': return Clock;
      case 'baixa': return TrendingDown;
      default: return Bell;
    }
  };

  const formatWorkSchedule = (schedule: any) => {
    if (!schedule) return '08:00 - 18:00';
    return `${schedule.start || '08:00'} - ${schedule.end || '18:00'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Carregando configurações de alertas...</span>
      </div>
    );
  }

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
                <p className="text-xl font-bold">{alertTypes.length}</p>
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
                <p className="text-xl font-bold">{alertTypes.filter(a => a.is_active).length}</p>
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
                <p className="text-xl font-bold">{escalationContacts.length}</p>
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
            {alertTypes.map((alerta) => {
              const PrioridadeIcon = getPrioridadeIcon(alerta.priority);
              
              return (
                <div key={alerta.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <PrioridadeIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{alerta.name}</h4>
                        <p className="text-sm text-gray-600">{alerta.condition_description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={alerta.is_active}
                      onCheckedChange={(isActive) => handleToggleAlert(alerta.id, isActive)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Destinatário:</p>
                      <p className="font-medium">{alerta.target_role}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Canal:</p>
                      <p className="font-medium">{alerta.channel}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <Badge className={getPrioridadeColor(alerta.priority)}>
                      {alerta.priority.toUpperCase()}
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
            {escalationContacts.map((contato) => (
              <div key={contato.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{contato.name}</h4>
                    <p className="text-sm text-gray-600">{contato.role}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      Nível {contato.escalation_level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditContact(contato)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteContact(contato.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{contato.whatsapp_number}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{contato.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Disponível: {formatWorkSchedule(contato.work_schedule)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" onClick={handleAddContact}>
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

      <EscalationContactModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />
    </div>
  );
};
