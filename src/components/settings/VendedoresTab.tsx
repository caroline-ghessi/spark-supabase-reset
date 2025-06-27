
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Clock, 
  TrendingUp,
  Users,
  DollarSign,
  Target
} from 'lucide-react';
import { mockVendedores, Vendedor } from '../../data/configData';

interface VendedoresTabProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const VendedoresTab = ({ onUnsavedChanges }: VendedoresTabProps) => {
  const [vendedores, setVendedores] = useState(mockVendedores);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditVendedor = (vendedor: Vendedor) => {
    setSelectedVendedor(vendedor);
    setIsEditModalOpen(true);
  };

  const handleSaveVendedor = () => {
    // Simular salvamento
    console.log('Saving vendedor:', selectedVendedor);
    setIsEditModalOpen(false);
    onUnsavedChanges(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Vendedores</h2>
          <p className="text-gray-600">Gerencie sua equipe de vendas e suas configurações</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Vendedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Vendedor</DialogTitle>
            </DialogHeader>
            {/* Modal de cadastro aqui */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Vendedores</p>
                <p className="text-xl font-bold">{vendedores.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-xl font-bold">
                  {vendedores.filter(v => v.status === 'ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Conversão Média</p>
                <p className="text-xl font-bold">
                  {Math.round(vendedores.reduce((acc, v) => acc + v.metricas.taxaConversao, 0) / vendedores.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Vendas Total/Mês</p>
                <p className="text-xl font-bold">
                  {formatCurrency(vendedores.reduce((acc, v) => acc + v.metricas.vendasMes, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendedores List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vendedores.map((vendedor) => (
          <Card key={vendedor.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={vendedor.foto}
                    alt={vendedor.nome}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <CardTitle className="text-lg">{vendedor.nome}</CardTitle>
                    <p className="text-sm text-gray-600">{vendedor.cargo}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(vendedor.status)}>
                  {vendedor.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{vendedor.whatsapp}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{vendedor.email}</span>
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {vendedor.especialidades.slice(0, 2).map((esp, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {esp}
                    </Badge>
                  ))}
                  {vendedor.especialidades.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{vendedor.especialidades.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Conversão</p>
                  <p className="font-semibold">{vendedor.metricas.taxaConversao}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Score Qualidade</p>
                  <p className="font-semibold">{vendedor.metricas.scoreQualidade}</p>
                </div>
                <div>
                  <p className="text-gray-600">Clientes Ativos</p>
                  <p className="font-semibold">
                    {vendedor.metricas.clientesAtivos}/{vendedor.configuracoes.maxClientesSimultaneos}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Vendas/Mês</p>
                  <p className="font-semibold">{formatCurrency(vendedor.metricas.vendasMes)}</p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {vendedor.configuracoes.horarioTrabalho.inicio} - {vendedor.configuracoes.horarioTrabalho.fim}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditVendedor(vendedor)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Vendedor: {selectedVendedor?.nome}</DialogTitle>
          </DialogHeader>
          
          {selectedVendedor && (
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" defaultValue={selectedVendedor.nome} />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" defaultValue={selectedVendedor.cargo} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={selectedVendedor.email} />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" defaultValue={selectedVendedor.whatsapp} />
                </div>
              </div>

              <Separator />

              {/* Configurações de Trabalho */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Configurações de Trabalho</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="maxClientes">Máx. Clientes Simultâneos</Label>
                    <Input 
                      id="maxClientes" 
                      type="number" 
                      defaultValue={selectedVendedor.configuracoes.maxClientesSimultaneos} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="horarioInicio">Horário Início</Label>
                    <Input 
                      id="horarioInicio" 
                      type="time" 
                      defaultValue={selectedVendedor.configuracoes.horarioTrabalho.inicio} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="horarioFim">Horário Fim</Label>
                    <Input 
                      id="horarioFim" 
                      type="time" 
                      defaultValue={selectedVendedor.configuracoes.horarioTrabalho.fim} 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Especialidades */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Especialidades</h3>
                <Textarea 
                  placeholder="Digite as especialidades separadas por vírgula"
                  defaultValue={selectedVendedor.especialidades.join(', ')}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveVendedor} className="bg-orange-500 hover:bg-orange-600">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
