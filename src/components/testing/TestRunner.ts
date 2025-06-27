
import { supabase } from '@/integrations/supabase/client';
import { TestResult, TableName } from './types';

export class TestRunner {
  private updateTestStatus: (testName: string, status: TestResult['status'], message?: string) => void;

  constructor(updateTestStatus: (testName: string, status: TestResult['status'], message?: string) => void) {
    this.updateTestStatus = updateTestStatus;
  }

  // Teste 1: Conexão Supabase
  async testSupabaseConnection(): Promise<boolean> {
    this.updateTestStatus('Conexão Supabase', 'running');
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      this.updateTestStatus('Conexão Supabase', 'success', 'Conectado com sucesso');
      return true;
    } catch (error: any) {
      this.updateTestStatus('Conexão Supabase', 'error', `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 2: Verificar se todas as tabelas existem
  async testTablesExist(): Promise<boolean> {
    this.updateTestStatus('Verificar Tabelas', 'running');
    const requiredTables: TableName[] = [
      'conversations', 'messages', 'sellers', 'clients', 
      'materials', 'notifications', 'ai_recommendations',
      'quality_scores', 'escalations', 'audit_logs'
    ];
    
    try {
      let tablesFound = 0;
      
      for (const table of requiredTables) {
        try {
          const { error } = await supabase
            .from(table)
            .select('count')
            .limit(1);
            
          if (!error) tablesFound++;
        } catch (tableError) {
          console.error(`Erro na tabela ${table}:`, tableError);
        }
      }
      
      if (tablesFound === requiredTables.length) {
        this.updateTestStatus('Verificar Tabelas', 'success', `${tablesFound}/10 tabelas encontradas`);
        return true;
      } else {
        this.updateTestStatus('Verificar Tabelas', 'error', `Apenas ${tablesFound}/10 tabelas encontradas`);
        return false;
      }
    } catch (error: any) {
      this.updateTestStatus('Verificar Tabelas', 'error', `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 3: Verificar dados de vendedores
  async testSellersData(): Promise<boolean> {
    this.updateTestStatus('Dados de Vendedores', 'running');
    try {
      const { data: sellers, error } = await supabase
        .from('sellers')
        .select('*');
      
      if (error) throw error;
      
      if (sellers && sellers.length > 0) {
        this.updateTestStatus('Dados de Vendedores', 'success', `${sellers.length} vendedores encontrados`);
        return true;
      } else {
        this.updateTestStatus('Dados de Vendedores', 'error', 'Nenhum vendedor encontrado');
        return false;
      }
    } catch (error: any) {
      this.updateTestStatus('Dados de Vendedores', 'error', `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 4: Real-time subscriptions
  async testRealTime(): Promise<boolean> {
    this.updateTestStatus('Real-time Subscriptions', 'running');
    
    return new Promise<boolean>((resolve) => {
      try {
        const channel = supabase
          .channel('health-check-channel')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'conversations'
          }, () => {
            // Real-time funcionando
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.updateTestStatus('Real-time Subscriptions', 'success', 'Real-time ativado');
              supabase.removeChannel(channel);
              resolve(true);
            } else if (status === 'CHANNEL_ERROR') {
              this.updateTestStatus('Real-time Subscriptions', 'error', 'Erro na subscription');
              resolve(false);
            }
          });
        
        // Timeout após 5 segundos
        setTimeout(() => {
          supabase.removeChannel(channel);
          this.updateTestStatus('Real-time Subscriptions', 'error', 'Timeout na subscription');
          resolve(false);
        }, 5000);
        
      } catch (error: any) {
        this.updateTestStatus('Real-time Subscriptions', 'error', `Erro: ${error.message}`);
        resolve(false);
      }
    });
  }

  // Teste 5: Edge Function Webhook
  async testWebhookFunction(): Promise<boolean> {
    this.updateTestStatus('Edge Function Webhook', 'running');
    try {
      const testToken = 'test-token-12345';
      const response = await fetch(
        `https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=${testToken}&hub.challenge=12345`,
        { method: 'GET' }
      );
      
      if (response.ok) {
        const result = await response.text();
        this.updateTestStatus('Edge Function Webhook', 'success', 'Webhook respondendo');
        return true;
      } else {
        this.updateTestStatus('Edge Function Webhook', 'error', `Status: ${response.status}`);
        return false;
      }
    } catch (error: any) {
      this.updateTestStatus('Edge Function Webhook', 'error', `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 6: Criar conversa de teste
  async testCreateConversation(): Promise<boolean> {
    this.updateTestStatus('Criar Conversa Teste', 'running');
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          client_phone: '555199999999',
          client_name: 'Cliente Teste HealthCheck',
          status: 'bot',
          lead_temperature: 'warm',
          source: 'test'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Salvar ID para limpeza posterior
      (window as any).__testConversationId = data.id;
      
      this.updateTestStatus('Criar Conversa Teste', 'success', 'Conversa criada com sucesso');
      return true;
    } catch (error: any) {
      this.updateTestStatus('Criar Conversa Teste', 'error', `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 7: Sistema de notificações
  async testNotifications(): Promise<boolean> {
    this.updateTestStatus('Sistema de Notificações', 'running');
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: 'health_check',
          title: 'Teste de Sistema',
          message: 'Sistema de notificações funcionando corretamente',
          priority: 'normal'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Salvar ID para limpeza posterior
      (window as any).__testNotificationId = data.id;
      
      this.updateTestStatus('Sistema de Notificações', 'success', 'Notificação criada');
      return true;
    } catch (error: any) {
      this.updateTestStatus('Sistema de Notificações', 'error', `Erro: ${error.message}`);
      return false;
    }
  }

  // Teste 8: Limpeza de dados de teste
  async cleanupTestData(): Promise<boolean> {
    this.updateTestStatus('Limpeza de Dados Teste', 'running');
    try {
      const conversationId = (window as any).__testConversationId;
      const notificationId = (window as any).__testNotificationId;
      
      let cleanupCount = 0;
      
      if (conversationId) {
        await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);
        cleanupCount++;
      }
      
      if (notificationId) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);
        cleanupCount++;
      }
      
      this.updateTestStatus('Limpeza de Dados Teste', 'success', `${cleanupCount} registros removidos`);
      return true;
    } catch (error: any) {
      this.updateTestStatus('Limpeza de Dados Teste', 'error', `Erro: ${error.message}`);
      return false;
    }
  }

  getAllTestFunctions() {
    return [
      this.testSupabaseConnection.bind(this),
      this.testTablesExist.bind(this),
      this.testSellersData.bind(this),
      this.testRealTime.bind(this),
      this.testWebhookFunction.bind(this),
      this.testCreateConversation.bind(this),
      this.testNotifications.bind(this),
      this.cleanupTestData.bind(this)
    ];
  }
}
