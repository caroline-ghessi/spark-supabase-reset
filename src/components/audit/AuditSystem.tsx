
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockAuditLogs, mockBackupConfig, type AuditLog } from '@/data/auditData';
import { 
  Search, 
  Download, 
  Shield, 
  Activity, 
  Database,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  HardDrive
} from 'lucide-react';

export const AuditSystem = () => {
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [backupConfig] = useState(mockBackupConfig);

  const filteredLogs = logs.filter(log =>
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.recurso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (acao: string) => {
    if (acao.includes('upload') || acao.includes('criar')) return 'bg-green-100 text-green-800';
    if (acao.includes('download') || acao.includes('acesso')) return 'bg-blue-100 text-blue-800';
    if (acao.includes('delete') || acao.includes('remover')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (nivel: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      supervisor: 'bg-orange-100 text-orange-800',
      vendedor: 'bg-green-100 text-green-800'
    };
    return colors[nivel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp.replace(' ', 'T'));
    return date.toLocaleString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    if (status === 'sucesso') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'erro') return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Auditoria e Backup</h2>
          <p className="text-gray-600">Monitoramento, logs e backup da plataforma</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Database className="w-4 h-4 mr-2" />
            Fazer Backup
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="backup">Sistema de Backup</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Logs</p>
                    <p className="text-2xl font-bold">{logs.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ações Admin</p>
                    <p className="text-2xl font-bold">
                      {logs.filter(l => l.nivel === 'admin').length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Downloads</p>
                    <p className="text-2xl font-bold">
                      {logs.filter(l => l.acao.includes('download')).length}
                    </p>
                  </div>
                  <Download className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Última Atividade</p>
                    <p className="text-sm font-semibold">Há 2 minutos</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por usuário, ação ou recurso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Logs Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{log.usuario}</TableCell>
                    <TableCell>
                      <Badge className={getLevelColor(log.nivel)}>
                        {log.nivel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.acao)}>
                        {log.acao.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.recurso}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {Object.entries(log.detalhes).map(([key, value]) => (
                        <span key={key} className="block">
                          {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          {/* Backup Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Status do Backup</span>
              </CardTitle>
              <CardDescription>
                Configuração e status dos backups automáticos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(backupConfig.status)}
                  <div>
                    <p className="font-medium">Último Backup</p>
                    <p className="text-sm text-gray-600">
                      {formatTimestamp(backupConfig.ultimoBackup)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Tamanho</p>
                    <p className="text-sm text-gray-600">{backupConfig.tamanho}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium">Frequência</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {backupConfig.frequencia} às {backupConfig.horario}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Backup</CardTitle>
              <CardDescription>
                Configurações detalhadas do sistema de backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Itens Incluídos no Backup:</h4>
                  <div className="space-y-2">
                    {backupConfig.itens.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm capitalize">{item.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Locais de Armazenamento:</h4>
                  <div className="space-y-2">
                    {backupConfig.locais.map((local, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm capitalize">{local.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Retenção:</strong> {backupConfig.retencao} | 
                  <strong> Próximo backup:</strong> Hoje às {backupConfig.horario}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Segurança do Sistema</span>
              </CardTitle>
              <CardDescription>
                Monitoramento de segurança e alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Tentativas de Login</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sucessos (hoje)</span>
                      <Badge className="bg-green-100 text-green-800">127</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Falhas (hoje)</span>
                      <Badge className="bg-red-100 text-red-800">3</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">IPs Bloqueados</span>
                      <Badge className="bg-orange-100 text-orange-800">0</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Atividade Suspeita</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Downloads em massa</span>
                      <Badge className="bg-green-100 text-green-800">0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Acessos fora do horário</span>
                      <Badge className="bg-yellow-100 text-yellow-800">2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alterações não autorizadas</span>
                      <Badge className="bg-green-100 text-green-800">0</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
