
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { 
  Settings, 
  Database, 
  Shield, 
  Palette, 
  Clock,
  HardDrive,
  Globe,
  Bell
} from 'lucide-react';

interface ConfigAvancadasTabProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const ConfigAvancadasTab = ({ onUnsavedChanges }: ConfigAvancadasTabProps) => {
  const [configs, setConfigs] = useState({
    sistema: {
      intervaloAtualizacao: 30,
      limiteRateAPI: 100,
      logLevel: 'info',
      debugMode: false
    },
    backup: {
      autoBackup: true,
      intervaloBackup: 24,
      retencaoDados: 30,
      compressaoBackup: true
    },
    seguranca: {
      autenticacao2FA: false,
      sessaoTimeout: 240,
      logAuditoria: true,
      criptografiaAvancada: true
    },
    interface: {
      logoEmpresa: '',
      corPrimaria: '#f97316',
      corSecundaria: '#6b7280',
      modoEscuro: false
    }
  });

  const handleConfigChange = (section: string, key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
    onUnsavedChanges(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações Avançadas</h2>
        <p className="text-gray-600">Configurações técnicas e personalizações do sistema</p>
      </div>

      {/* Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configurações do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervalo-atualizacao">Intervalo de Atualização (segundos)</Label>
              <Input 
                id="intervalo-atualizacao" 
                type="number" 
                value={configs.sistema.intervaloAtualizacao}
                onChange={(e) => handleConfigChange('sistema', 'intervaloAtualizacao', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="limite-rate">Limite Rate API (req/min)</Label>
              <Input 
                id="limite-rate" 
                type="number" 
                value={configs.sistema.limiteRateAPI}
                onChange={(e) => handleConfigChange('sistema', 'limiteRateAPI', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="log-level">Nível de Log</Label>
              <select 
                id="log-level"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={configs.sistema.logLevel}
                onChange={(e) => handleConfigChange('sistema', 'logLevel', e.target.value)}
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Modo Debug</Label>
              <Switch 
                id="debug-mode"
                checked={configs.sistema.debugMode}
                onCheckedChange={(checked) => handleConfigChange('sistema', 'debugMode', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup e Retenção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Backup e Retenção de Dados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Automático</Label>
              <p className="text-sm text-gray-600">Realizar backup automático dos dados</p>
            </div>
            <Switch 
              checked={configs.backup.autoBackup}
              onCheckedChange={(checked) => handleConfigChange('backup', 'autoBackup', checked)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervalo-backup">Intervalo de Backup (horas)</Label>
              <Input 
                id="intervalo-backup" 
                type="number" 
                value={configs.backup.intervaloBackup}
                onChange={(e) => handleConfigChange('backup', 'intervaloBackup', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="retencao-dados">Retenção de Dados (dias)</Label>
              <Input 
                id="retencao-dados" 
                type="number" 
                value={configs.backup.retencaoDados}
                onChange={(e) => handleConfigChange('backup', 'retencaoDados', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Compressão de Backup</Label>
              <p className="text-sm text-gray-600">Comprimir arquivos de backup para economizar espaço</p>
            </div>
            <Switch 
              checked={configs.backup.compressaoBackup}
              onCheckedChange={(checked) => handleConfigChange('backup', 'compressaoBackup', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Configurações de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Autenticação 2FA</Label>
              <p className="text-sm text-gray-600">Habilitar autenticação de dois fatores</p>
            </div>
            <Switch 
              checked={configs.seguranca.autenticacao2FA}
              onCheckedChange={(checked) => handleConfigChange('seguranca', 'autenticacao2FA', checked)}
            />
          </div>
          
          <div>
            <Label htmlFor="sessao-timeout">Timeout de Sessão (minutos)</Label>
            <Input 
              id="sessao-timeout" 
              type="number" 
              value={configs.seguranca.sessaoTimeout}
              onChange={(e) => handleConfigChange('seguranca', 'sessaoTimeout', parseInt(e.target.value))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Log de Auditoria</Label>
              <p className="text-sm text-gray-600">Registrar todas as ações dos usuários</p>
            </div>
            <Switch 
              checked={configs.seguranca.logAuditoria}
              onCheckedChange={(checked) => handleConfigChange('seguranca', 'logAuditoria', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Criptografia Avançada</Label>
              <p className="text-sm text-gray-600">Usar criptografia AES-256 para dados sensíveis</p>
            </div>
            <Switch 
              checked={configs.seguranca.criptografiaAvancada}
              onCheckedChange={(checked) => handleConfigChange('seguranca', 'criptografiaAvancada', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Personalização da Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Personalização da Interface</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo-empresa">URL do Logo da Empresa</Label>
            <Input 
              id="logo-empresa" 
              type="url" 
              value={configs.interface.logoEmpresa}
              onChange={(e) => handleConfigChange('interface', 'logoEmpresa', e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cor-primaria">Cor Primária</Label>
              <div className="flex space-x-2">
                <Input 
                  id="cor-primaria" 
                  type="color" 
                  value={configs.interface.corPrimaria}
                  onChange={(e) => handleConfigChange('interface', 'corPrimaria', e.target.value)}
                  className="w-16"
                />
                <Input 
                  value={configs.interface.corPrimaria}
                  onChange={(e) => handleConfigChange('interface', 'corPrimaria', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cor-secundaria">Cor Secundária</Label>
              <div className="flex space-x-2">
                <Input 
                  id="cor-secundaria" 
                  type="color" 
                  value={configs.interface.corSecundaria}
                  onChange={(e) => handleConfigChange('interface', 'corSecundaria', e.target.value)}
                  className="w-16"
                />
                <Input 
                  value={configs.interface.corSecundaria}
                  onChange={(e) => handleConfigChange('interface', 'corSecundaria', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Modo Escuro</Label>
              <p className="text-sm text-gray-600">Habilitar tema escuro por padrão</p>
            </div>
            <Switch 
              checked={configs.interface.modoEscuro}
              onCheckedChange={(checked) => handleConfigChange('interface', 'modoEscuro', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5" />
            <span>Status do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-lg font-bold text-green-600">99.9%</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Uso do Banco</p>
              <p className="text-lg font-bold text-blue-600">2.4GB</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Requisições/min</p>
              <p className="text-lg font-bold text-purple-600">847</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
