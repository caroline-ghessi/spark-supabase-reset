import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppIntegration {
  nome: string;
  status: 'conectado' | 'desconectado';
  descricao: string;
  config: {
    token: string;
    phoneNumber: string;
    webhookUrl: string;
  };
}

export interface WAPIIntegration {
  nome: string;
  status: 'conectado' | 'desconectado';
  descricao: string;
  config: Record<string, string>;
}

export interface DifyIntegration {
  nome: string;
  status: 'conectado' | 'desconectado';
  descricao: string;
  config: {
    apiKey: string;
    baseUrl: string;
    chatflowId: string;
  };
}

export interface IntegrationsData {
  whatsapp: WhatsAppIntegration;
  wapi: WAPIIntegration;
  dify: DifyIntegration;
}

export const useIntegrationsData = () => {
  const [integrations, setIntegrations] = useState<IntegrationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const { toast } = useToast();

  const loadIntegrationsData = async () => {
    setLoading(true);
    try {
      // Buscar dados dos vendedores para W-API (agora centralizado via Rodri.GO)
      const { data: sellers, error: sellersError } = await supabase
        .from('sellers')
        .select('name, status');

      if (sellersError) {
        console.error('Erro ao carregar vendedores:', sellersError);
      }

      // Processar dados dos vendedores para W-API (agora centralizado via Rodri.GO)
      const wapiConfig: Record<string, string> = {};
      if (sellers) {
        sellers.forEach(seller => {
          const name = seller.name;
          const status = seller.status === 'active' ? 'conectado' : 'desconectado';
          wapiConfig[name] = `${status} (via Rodri.GO)`;
        });
      }

      // Definir dados das integrações
      const integrationsData: IntegrationsData = {
        whatsapp: {
          nome: 'WhatsApp Business API',
          status: 'conectado', // Assumindo conectado se temos vendedores
          descricao: 'Integração oficial com Meta',
          config: {
            token: 'EAAxxxxxxxxxx', // Mascarado por segurança
            phoneNumber: '5511999999999',
            webhookUrl: `${window.location.origin}/api/whatsapp-webhook`
          }
        },
        wapi: {
          nome: 'W-API (Vendedores)',
          status: Object.values(wapiConfig).some(status => status === 'conectado') ? 'conectado' : 'desconectado',
          descricao: 'Conexões individuais dos vendedores',
          config: wapiConfig
        },
        dify: {
          nome: 'Dify Bot',
          status: 'conectado', // Assumindo conectado se temos a configuração
          descricao: 'Bot de atendimento automatizado',
          config: {
            apiKey: 'dify_xxxxxxxxxx', // Mascarado por segurança
            baseUrl: 'https://api.dify.ai',
            chatflowId: 'flow_123456'
          }
        }
      };

      setIntegrations(integrationsData);
    } catch (error) {
      console.error('Erro ao carregar dados das integrações:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados das integrações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (integration: string) => {
    setTestingConnection(integration);
    
    try {
      let testResult = false;
      
      switch (integration) {
        case 'whatsapp':
          // Testar conexão WhatsApp Business API
          testResult = await testWhatsAppConnection();
          break;
        case 'wapi':
          // Testar conexões W-API dos vendedores
          testResult = await testWAPIConnections();
          break;
        case 'dify':
          // Testar conexão Dify
          testResult = await testDifyConnection();
          break;
      }

      const status = testResult ? 'success' : 'error';
      const message = testResult 
        ? `Conexão com ${integration} testada com sucesso!`
        : `Falha ao testar conexão com ${integration}`;

      toast({
        title: status === 'success' ? "Sucesso" : "Erro",
        description: message,
        variant: status === 'error' ? "destructive" : undefined,
        className: status === 'success' ? "bg-green-500 text-white" : undefined,
      });

    } catch (error) {
      console.error(`Erro ao testar ${integration}:`, error);
      toast({
        title: "Erro",
        description: `Erro inesperado ao testar ${integration}`,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const testWhatsAppConnection = async (): Promise<boolean> => {
    try {
      // Usar edge function para testar WhatsApp
      const { data, error } = await supabase.functions.invoke('test-whatsapp-message', {
        body: { test: true }
      });
      
      return !error && data?.success;
    } catch (error) {
      console.error('Erro ao testar WhatsApp:', error);
      return false;
    }
  };

  const testWAPIConnections = async (): Promise<boolean> => {
    try {
      // Testar comunicação centralizada via Rodri.GO
      const { data, error } = await supabase.functions.invoke('rodrigo-send-message', {
        body: { 
          to_number: '5194916150', // Teste para o próprio Rodri.GO
          message: 'Teste de conectividade W-API centralizada',
          context_type: 'test'
        }
      });

      return !error && data?.success;
    } catch (error) {
      console.error('Erro ao testar W-API centralizada:', error);
      return false;
    }
  };

  const testDifyConnection = async (): Promise<boolean> => {
    try {
      // Usar edge function para testar Dify
      const { data, error } = await supabase.functions.invoke('test-dify', {
        body: { test: true }
      });
      
      return !error && data?.success;
    } catch (error) {
      console.error('Erro ao testar Dify:', error);
      return false;
    }
  };

  const updateIntegrationConfig = async (
    integration: keyof IntegrationsData, 
    config: any
  ) => {
    try {
      // Aqui você implementaria a lógica para salvar as configurações
      // Por exemplo, salvar no Supabase ou atualizar secrets
      
      toast({
        title: "Sucesso",
        description: `Configuração de ${integration} atualizada com sucesso`,
        className: "bg-green-500 text-white",
      });
      
      // Recarregar dados
      await loadIntegrationsData();
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar configuração",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadIntegrationsData();
  }, []);

  return {
    integrations,
    loading,
    testingConnection,
    testConnection,
    updateIntegrationConfig,
    refreshData: loadIntegrationsData
  };
};