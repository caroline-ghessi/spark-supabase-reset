
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Phone, 
  Mail, 
  Building,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';
import { mockClientes, Cliente } from '../../data/configData';

interface ClientesTabProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const ClientesTab = ({ onUnsavedChanges }: ClientesTabProps) => {
  const [clientes, setClientes] = useState(mockClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassificacao, setFilterClassificacao] = useState('todos');

  const getClassificacaoColor = (classificacao: string) => {
    switch (classificacao) {
      case 'quente': return 'bg-red-100 text-red-800';
      case 'morno': return 'bg-yellow-100 text-yellow-800';
      case 'frio': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassificacao = filterClassificacao === 'todos' || cliente.classificacao === filterClassificacao;
    return matchesSearch && matchesClassificacao;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
          <p className="text-gray-600">Base completa de clientes e prospects</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {clientes.filter(c => c.classificacao === 'quente').length}
              </p>
              <p className="text-sm text-gray-600">Leads Quentes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {clientes.filter(c => c.classificacao === 'morno').length}
              </p>
              <p className="text-sm text-gray-600">Leads Mornos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {clientes.filter(c => c.classificacao === 'frio').length}
              </p>
              <p className="text-sm text-gray-600">Leads Frios</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(clientes.reduce((acc, c) => acc + c.valorPotencial, 0))}
              </p>
              <p className="text-sm text-gray-600">Valor Total Pipeline</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterClassificacao}
          onChange={(e) => setFilterClassificacao(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="todos">Todas Classificações</option>
          <option value="quente">Quente</option>
          <option value="morno">Morno</option>
          <option value="frio">Frio</option>
        </select>
      </div>

      {/* Clientes List */}
      <div className="space-y-4">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{cliente.nome}</h3>
                      <p className="text-sm text-gray-600">{cliente.cargo} • {cliente.empresa}</p>
                    </div>
                    <Badge className={getClassificacaoColor(cliente.classificacao)}>
                      {cliente.classificacao.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{cliente.telefone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{cliente.localizacao.cidade}, {cliente.localizacao.estado}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Valor Potencial</p>
                      <p className="text-sm font-semibold">{formatCurrency(cliente.valorPotencial)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vendedor</p>
                      <p className="text-sm font-semibold">{cliente.vendedorAtribuido}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status Negociação</p>
                      <p className="text-sm font-semibold">{cliente.statusNegociacao.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Interações</p>
                      <p className="text-sm font-semibold">{cliente.historico.totalInteracoes}</p>
                    </div>
                  </div>

                  {cliente.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cliente.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {cliente.observacoes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{cliente.observacoes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
