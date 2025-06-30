
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

      // Verificar token
      if (!sellerData.whapi_token || sellerData.whapi_token === 'YOUR_RICARDO_WHAPI_TOKEN_HERE') {
        updateTestResult(seller.name, 'error', 'Token Whapi não configurado ou é placeholder', {
          hasToken: !!sellerData.whapi_token,
          tokenValue: sellerData.whapi_token?.substring(0, 10) + '...',
          isPlaceholder: sellerData.whapi_token === 'YOUR_RICARDO_WHAPI_TOKEN_HERE'
        });
        return;
      }

      // Verificar status
      if (sellerData.whapi_status !== 'active') {
        updateTestResult(seller.name, 'error', `Status Whapi: ${sellerData.whapi_status}`, {
          currentStatus: sellerData.whapi_status,
          expectedStatus: 'active'
        });
        return;
      }

      // Verificar webhook com validação melhorada
      const expectedWebhook = `https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=${seller.name.toLowerCase()}`;
      const actualWebhook = sellerData.whapi_webhook_url;
      
      // Normalizar URLs para comparação (remover espaços, converter para lowercase)
      const normalizedExpected = expectedWebhook.trim().toLowerCase();
      const normalizedActual = (actualWebhook || '').trim().toLowerCase();
      
      console.log(`🔍 Comparando webhooks para ${seller.name}:`);
      console.log(`Expected: "${normalizedExpected}"`);
      console.log(`Actual: "${normalizedActual}"`);
      console.log(`Match: ${normalizedExpected === normalizedActual}`);
      
      if (normalizedActual !== normalizedExpected) {
        updateTestResult(seller.name, 'error', 'Webhook URL incorreta', {
          expected: expectedWebhook,
          actual: actualWebhook,
          normalizedExpected,
          normalizedActual,
          difference: `Expected length: ${normalizedExpected.length}, Actual length: ${normalizedActual.length}`
        });
        return;
      }

      // Testar conectividade com Whapi
      try {
        const response = await fetch('https://gate.whapi.cloud/health', {
          headers: {
            'Authorization': `Bearer ${sellerData.whapi_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Health check ${seller.name}:`, data);
          updateTestResult(seller.name, 'success', `Conectado - Status: ${data.status || 'OK'}`, {
            healthStatus: data,
            responseStatus: response.status
          });
        } else {
          const errorText = await response.text();
          updateTestResult(seller.name, 'error', `Erro HTTP: ${response.status}`, {
            httpStatus: response.status,
            errorResponse: errorText,
            headers: Object.fromEntries(response.headers.entries())
          });
        }
      } catch (error) {
        updateTestResult(seller.name, 'error', `Erro de conexão: ${error.message}`, {
          error: error.message,
          stack: error.stack,
          type: error.name
        });
      }

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
