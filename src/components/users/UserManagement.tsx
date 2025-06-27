
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers, accessLevels, type User } from '@/data/usersData';
import { UserPlus, Search, Edit, Shield, Activity, Clock } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (nivel: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      supervisor: 'bg-orange-100 text-orange-800',
      vendedor: 'bg-green-100 text-green-800'
    };
    return colors[nivel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'ativo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const formatLastAccess = (timestamp: string) => {
    const date = new Date(timestamp.replace(' ', 'T'));
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'Online agora';
    if (diffInMinutes < 60) return `Online há ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Online há ${Math.floor(diffInMinutes / 60)}h`;
    return `Último acesso: ${date.toLocaleDateString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
          <p className="text-gray-600">Gerencie usuários e permissões da plataforma</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold">{users.filter(u => u.nivel === 'admin').length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendedores</p>
                <p className="text-2xl font-bold">{users.filter(u => u.nivel === 'vendedor').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Online Agora</p>
                <p className="text-2xl font-bold">{users.filter(u => u.ultimoAcesso.includes('14:30')).length}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar usuários por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.foto} alt={user.nome} />
                  <AvatarFallback>{user.nome.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.nome}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Status and Level */}
              <div className="flex items-center justify-between">
                <Badge className={getLevelColor(user.nivel)}>
                  {accessLevels[user.nivel]?.nome || user.nivel}
                </Badge>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
              </div>

              {/* Last Access */}
              <div className="text-sm text-gray-600">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatLastAccess(user.ultimoAcesso)}
              </div>

              {/* Specialties for Sellers */}
              {user.especialidades && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.especialidades.slice(0, 2).map((especialidade, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {especialidade}
                      </Badge>
                    ))}
                    {user.especialidades.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.especialidades.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics for Sellers */}
              {user.metricas && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Clientes</p>
                      <p className="font-semibold text-sm">{user.metricas.clientesAtivos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Conversões</p>
                      <p className="font-semibold text-sm">{user.metricas.conversaoMes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Ticket</p>
                      <p className="font-semibold text-sm">
                        R$ {(user.metricas.ticketMedio / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Shield className="w-4 h-4 mr-1" />
                  Permissões
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
