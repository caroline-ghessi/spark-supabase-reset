import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function executeRecoveryPlan() {
  console.log('🚀 Iniciando plano de recuperação COMPLETO...');
  
  try {
    // FASE 1: DIAGNÓSTICO PROFUNDO
    console.log('🔍 FASE 1: Executando diagnóstico completo...');
    const { data: diagnosisData, error: diagnosisError } = await supabase.functions.invoke('complete-dify-diagnosis');
    
    if (diagnosisError) {
      console.error('❌ Erro no diagnóstico:', diagnosisError);
      toast.error('Erro no diagnóstico completo');
      return false;
    }
    
    console.log('🔍 Diagnóstico concluído:', diagnosisData?.status);
    toast.info(`🔍 Diagnóstico: ${diagnosisData?.status} - ${diagnosisData?.critical_issues?.length || 0} problemas críticos`);
    
    // FASE 2: RECOVERY EMERGENCIAL SE NECESSÁRIO
    if (diagnosisData?.status === 'critical' || diagnosisData?.status === 'degraded') {
      console.log('🚨 FASE 2: Executando recovery emergencial...');
      toast.warning('🚨 Problemas críticos detectados. Iniciando recovery emergencial...');
      
      const { data: recoveryData, error: recoveryError } = await supabase.functions.invoke('emergency-dify-recovery');
      
      if (recoveryError) {
        console.error('❌ Erro no recovery emergencial:', recoveryError);
        toast.error('Erro no recovery emergencial');
        return false;
      }
      
      console.log('🚨 Recovery emergencial concluído:', recoveryData);
      
      if (recoveryData?.stats?.conversationsFixed?.length > 0) {
        toast.success(`✅ Recovery concluído! ${recoveryData.stats.conversationsFixed.length} conversas corrigidas`);
      } else {
        toast.warning('⚠️ Recovery executado mas nenhuma conversa foi corrigida');
      }
      
      return true;
    }
    
    // FASE 3: REPROCESSAMENTO PADRÃO SE STATUS OK
    if (diagnosisData?.status === 'healthy' || diagnosisData?.status === 'warning') {
      console.log('🔄 FASE 3: Executando reprocessamento padrão...');
      
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
        toast.info('ℹ️ Sistema funcionando - nenhuma mensagem precisou ser reprocessada');
      }
      
      return true;
    }
    
    // Se chegou aqui, status desconhecido
    console.warn('⚠️ Status do sistema desconhecido:', diagnosisData?.status);
    toast.warning('⚠️ Status do sistema desconhecido. Verifique os logs.');
    return false;
    
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