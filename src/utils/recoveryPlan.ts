import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function executeRecoveryPlan() {
  console.log('🚀 Iniciando plano de recuperação...');
  
  try {
    // 1. Primeiro executar health check
    console.log('🏥 Executando health check...');
    const { data: healthData, error: healthError } = await supabase.functions.invoke('webhook-health-check');
    
    if (healthError) {
      console.error('❌ Erro no health check:', healthError);
      toast.error('Erro no health check');
      return false;
    }
    
    console.log('🏥 Health check concluído:', healthData?.status);
    
    // 2. Se o health check passou, executar reprocessamento
    if (healthData?.status === 'healthy' || healthData?.status === 'warning') {
      console.log('🔄 Executando reprocessamento de mensagens perdidas...');
      
      const { data: reprocessData, error: reprocessError } = await supabase.functions.invoke('reprocess-lost-messages');
      
      if (reprocessError) {
        console.error('❌ Erro no reprocessamento:', reprocessError);
        toast.error('Erro no reprocessamento');
        return false;
      }
      
      console.log('✅ Reprocessamento concluído:', reprocessData);
      
      if (reprocessData?.summary?.successful > 0) {
        toast.success(`✅ Plano de recuperação concluído! ${reprocessData.summary.successful} mensagens reprocessadas`);
      } else {
        toast.info('ℹ️ Nenhuma mensagem precisou ser reprocessada');
      }
      
      return true;
    } else {
      console.warn('⚠️ Sistema ainda com problemas:', healthData?.issues);
      toast.warning('Sistema ainda apresenta problemas. Verifique a configuração do Dify.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro crítico no plano de recuperação:', error);
    toast.error('Erro crítico no plano de recuperação');
    return false;
  }
}

export async function testDifyConnection() {
  console.log('🧪 Testando conectividade com Dify...');
  
  try {
    const { data, error } = await supabase.functions.invoke('test-webhook-dify', {
      body: {
        test_message: 'Teste pós-recuperação do pagamento',
        timestamp: new Date().toISOString()
      }
    });
    
    if (error) {
      console.error('❌ Erro no teste Dify:', error);
      return false;
    }
    
    console.log('✅ Teste Dify concluído:', data);
    return data?.status === 'test_completed';
    
  } catch (error) {
    console.error('❌ Erro crítico no teste Dify:', error);
    return false;
  }
}