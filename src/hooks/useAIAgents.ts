
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface AIAgent {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  version: string;
  prompt: string;
  configuration: any;
  created_at: string;
  updated_at: string;
}

// Type alias for the database AI agent type
type DatabaseAIAgent = Database['public']['Tables']['ai_agents_config']['Row'];

// Helper function to convert database AI agent to AIAgent
const convertDatabaseAIAgentToAIAgent = (dbAgent: DatabaseAIAgent): AIAgent => {
  return {
    id: dbAgent.id,
    agent_id: dbAgent.agent_id,
    name: dbAgent.name,
    description: dbAgent.description || '',
    status: (dbAgent.status as 'active' | 'inactive') || 'active',
    version: dbAgent.version || '1.0',
    prompt: dbAgent.prompt,
    configuration: dbAgent.configuration || {},
    created_at: dbAgent.created_at || '',
    updated_at: dbAgent.updated_at || ''
  };
};

export const useAIAgents = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAgents = async () => {
    console.log('🤖 Carregando agentes de IA...');
    
    try {
      const { data, error } = await supabase
        .from('ai_agents_config')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao carregar agentes:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar agentes de IA",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Agentes carregados:', data?.length || 0);
      const convertedAgents = (data || []).map(convertDatabaseAIAgentToAIAgent);
      setAgents(convertedAgents);
    } catch (error) {
      console.error('❌ Erro na busca de agentes:', error);
      toast({
        title: "Erro",
        description: "Erro de conexão ao carregar agentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAgentStatus = async (agentId: string, status: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('ai_agents_config')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('agent_id', agentId);

      if (error) {
        console.error('❌ Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Falha ao atualizar status do agente",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: `Agente ${status === 'active' ? 'ativado' : 'desativado'} com sucesso`,
        className: "bg-green-500 text-white",
      });

      await loadAgents();
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar agente:', error);
      return false;
    }
  };

  const getAgentByType = (agentId: string) => {
    return agents.find(agent => agent.agent_id === agentId);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return {
    agents,
    loading,
    loadAgents,
    updateAgentStatus,
    getAgentByType
  };
};
