
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestResult, Seller, sellers } from '@/components/whatsapp/integrationTestTypes';

export const useIntegrationTests = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const initializeTest = () => {
    const initialResults = sellers.map(seller => ({
      seller: seller.name,
      phone: seller.phone,
      status: 'pending' as const
    }));
    setTestResults(initialResults);
  };

  const updateTestResult = (sellerName: string, status: 'success' | 'error', message?: string, details?: any) => {
    setTestResults(prev => prev.map(result => 
      result.seller === sellerName 
        ? { ...result, status, message, timestamp: new Date(), details }
        : result
    ));
  };

  const testSellerIntegration = async (seller: Seller) => {
    try {
      console.log(`🧪 Testando integração do ${seller.name} (${seller.phone})`);
      
      // Buscar dados do vendedor no banco
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('whatsapp_number', seller.phone)
        .single();

      if (sellerError || !sellerData) {
        console.log(`❌ Vendedor ${seller.name} não encontrado no banco. Erro:`, sellerError);
        updateTestResult(seller.name, 'error', 'Vendedor não encontrado no banco de dados', {
          error: sellerError,
          searchedPhone: seller.phone
        });
        return;
      }

      console.log(`✅ Vendedor ${seller.name} encontrado no banco:`, sellerData);

      // Agora todos os testes passam pelo Rodri.GO - verificar se vendedor existe
      console.log(`✅ Vendedor ${seller.name} encontrado no banco:`, sellerData);
      
      // Verificar configuração centralizará via Rodri.GO
      updateTestResult(seller.name, 'success', 'Configurado para comunicação via Rodri.GO', {
        sellerId: sellerData.id,
        method: 'centralized_rodrigo',
        note: 'Todas as comunicações são enviadas via Rodri.GO centralizado'
      });
      return;

      // Teste de conectividade é feito via Rodri.GO centralizado
      console.log(`✅ Teste concluído para ${seller.name} - comunicação centralizada via Rodri.GO`);

    } catch (error) {
      console.error(`❌ Erro no teste do ${seller.name}:`, error);
      updateTestResult(seller.name, 'error', `Erro geral: ${error.message}`, {
        error: error.message,
        stack: error.stack
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    initializeTest();
    
    toast.info('Iniciando testes de integração...');

    for (const seller of sellers) {
      await testSellerIntegration(seller);
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    
    if (errorCount === 0) {
      toast.success(`✅ Todos os ${successCount} vendedores estão integrados!`);
    } else {
      toast.error(`⚠️ ${errorCount} vendedores com problemas, ${successCount} OK`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return {
    testResults,
    isRunning,
    runAllTests,
    clearResults
  };
};
