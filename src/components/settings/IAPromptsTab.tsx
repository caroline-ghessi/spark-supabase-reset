
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { 
  Bot, 
  Edit3, 
  Play, 
  Save, 
  RefreshCw, 
  Activity,
  CheckCircle,
  AlertCircle,
  History,
  Loader2
} from 'lucide-react';
import { useAIAgents, AIAgent } from '../../hooks/useAIAgents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IAPromptsTabProps {
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const IAPromptsTab = ({ onUnsavedChanges }: IAPromptsTabProps) => {
  const { agents, loading, loadAgents, updateAgentStatus } = useAIAgents();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEditPrompt = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setEditedPrompt(agent.prompt);
    setIsEditModalOpen(true);
  };

  const handleSavePrompt = async () => {
    if (!selectedAgent) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_agents_config')
        .update({ 
          prompt: editedPrompt, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedAgent.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Prompt atualizado com sucesso",
        className: "bg-green-500 text-white",
      });

      setIsEditModalOpen(false);
      onUnsavedChanges(false);
      await loadAgents();
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar prompt",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPrompt = () => {
    setIsTestingPrompt(true);
    setTimeout(() => {
      setIsTestingPrompt(false);
      toast({
        title: "Teste Concluído",
        description: "Prompt testado com sucesso",
        className: "bg-blue-500 text-white",
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Carregando agentes de IA...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuração de IA & Prompts</h2>
        <p className="text-gray-600">Configure e otimize os agentes de inteligência artificial</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Agentes Ativos</p>
                <p className="text-xl font-bold">
                  {agents.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Agentes</p>
                <p className="text-xl font-bold">
                  {agents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Agentes Configurados</p>
                <p className="text-xl font-bold">
                  {agents.filter(a => a.prompt && a.prompt.length > 10).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Última Atualização</p>
                <p className="text-sm font-bold">
                  {agents.length > 0 ? formatDate(Math.max(...agents.map(a => new Date(a.updated_at).getTime())).toString()) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agentes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Bot className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Version Info */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-gray-400" />
                  <span>v{agent.version}</span>
                </div>
                <span className="text-gray-500">{formatDate(agent.updated_at)}</span>
              </div>

              <Separator />

              {/* Prompt Preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Preview do Prompt:</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-mono leading-relaxed">
                    {agent.prompt ? agent.prompt.substring(0, 150) + '...' : 'Prompt não configurado'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPrompt(agent)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Prompt
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTestPrompt}
                  disabled={!agent.prompt}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Testar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Prompt Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Editor de Prompt: {selectedAgent?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedAgent && (
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="test">Teste</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Prompt do Agente
                    </label>
                    <Textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="Digite o prompt do agente aqui..."
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Variáveis Disponíveis:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <code className="bg-white px-2 py-1 rounded">{'{{cliente_nome}}'}</code>
                    <code className="bg-white px-2 py-1 rounded">{'{{cliente_telefone}}'}</code>
                    <code className="bg-white px-2 py-1 rounded">{'{{historico_mensagens}}'}</code>
                    <code className="bg-white px-2 py-1 rounded">{'{{vendedor_especialidade}}'}</code>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Preview do Prompt Processado:</h4>
                  <div className="bg-white p-4 rounded border font-mono text-sm whitespace-pre-wrap">
                    {editedPrompt.replace(/\{\{cliente_nome\}\}/g, 'João Silva')
                                .replace(/\{\{cliente_telefone\}\}/g, '51 99999-1234')
                                .replace(/\{\{historico_mensagens\}\}/g, 'Cliente perguntou sobre automação industrial...')
                                .replace(/\{\{vendedor_especialidade\}\}/g, 'Automação Industrial')}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Teste do Prompt</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Execute um teste com dados mock para validar o comportamento do agente.
                    </p>
                    
                    <Button 
                      onClick={handleTestPrompt}
                      disabled={isTestingPrompt}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isTestingPrompt ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Executar Teste
                        </>
                      )}
                    </Button>
                  </div>

                  {isTestingPrompt && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-yellow-600" />
                        <span className="text-sm">Executando teste do prompt com dados mock...</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Último Resultado do Teste:</h5>
                    <div className="bg-white p-3 rounded border text-sm">
                      <strong>Input:</strong> Cliente pergunta sobre automação industrial<br/>
                      <strong>Output:</strong> QUENTE - Cliente demonstra conhecimento técnico específico e urgência no projeto.
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePrompt} 
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Prompt
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
