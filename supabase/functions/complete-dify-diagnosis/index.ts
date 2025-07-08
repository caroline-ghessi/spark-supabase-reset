import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔍 [${requestId}] Diagnóstico Completo Dify iniciado`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. VERIFICAR CREDENCIAIS CRÍTICAS
    console.log(`🔑 [${requestId}] Verificando credenciais...`)
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'
    const difyAppId = Deno.env.get('DIFY_APP_ID')
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    const credentialsCheck = {
      dify_api_key: !!difyApiKey,
      dify_base_url: difyBaseUrl,
      dify_app_id: !!difyAppId,
      whatsapp_token: !!whatsappToken,
      phone_number_id: !!phoneNumberId
    }
    
    console.log(`🔑 [${requestId}] Status credenciais:`, credentialsCheck)

    // 2. TESTE CONECTIVIDADE DIFY REAL
    console.log(`🤖 [${requestId}] Testando conectividade Dify REAL...`)
    let difyConnectivityTest = {
      status: 'failed',
      responseTime: 0,
      httpStatus: 0,
      error: null,
      response: null
    }

    if (difyApiKey) {
      try {
        const difyStartTime = Date.now();
        
        // Teste 1: Verificar se a API responde
        const healthUrl = `${difyBaseUrl}/ping` // Endpoint de saúde
        console.log(`🧪 [${requestId}] Testando URL de saúde: ${healthUrl}`)
        
        const healthResponse = await fetch(healthUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${difyApiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'WhatsApp-Platform/1.0'
          }
        });
        
        console.log(`🧪 [${requestId}] Status resposta saúde: ${healthResponse.status}`)
        
        // Teste 2: Tentar chamada real de chat
        const chatUrl = `${difyBaseUrl}/chat-messages`
        console.log(`💬 [${requestId}] Testando chat URL: ${chatUrl}`)
        
        const chatResponse = await fetch(chatUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${difyApiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'WhatsApp-Platform/1.0'
          },
          body: JSON.stringify({
            inputs: {},
            query: 'Teste de diagnóstico completo - responda apenas "OK"',
            response_mode: 'blocking',
            user: 'diagnostic-test'
          })
        });
        
        difyConnectivityTest.responseTime = Date.now() - difyStartTime;
        difyConnectivityTest.httpStatus = chatResponse.status;
        
        const responseText = await chatResponse.text();
        console.log(`💬 [${requestId}] Resposta Dify (${chatResponse.status}):`, responseText.substring(0, 200))
        
        if (chatResponse.ok) {
          try {
            const responseData = JSON.parse(responseText);
            difyConnectivityTest.status = 'success';
            difyConnectivityTest.response = responseData;
            console.log(`✅ [${requestId}] Dify respondeu corretamente!`)
          } catch (parseError) {
            difyConnectivityTest.status = 'parse_error';
            difyConnectivityTest.error = `Erro ao fazer parse JSON: ${parseError.message}`;
            console.error(`❌ [${requestId}] Erro parse JSON:`, parseError)
          }
        } else {
          difyConnectivityTest.status = 'http_error';
          difyConnectivityTest.error = `HTTP ${chatResponse.status}: ${responseText}`;
          console.error(`❌ [${requestId}] Erro HTTP Dify:`, chatResponse.status, responseText)
        }
        
      } catch (error) {
        difyConnectivityTest.status = 'connection_error';
        difyConnectivityTest.error = error.message;
        console.error(`❌ [${requestId}] Erro conectividade Dify:`, error)
      }
    } else {
      difyConnectivityTest.error = 'API Key não configurada';
    }

    // 3. ANALISAR CONVERSAS PROBLEMÁTICAS
    console.log(`📊 [${requestId}] Analisando conversas problemáticas...`)
    
    const { data: problemConversations, error: convError } = await supabaseClient
      .from('conversations')
      .select('id, client_name, client_phone, created_at, status, source, dify_conversation_id')
      .is('dify_conversation_id', null)
      .eq('source', 'whatsapp')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    if (convError) {
      console.error(`❌ [${requestId}] Erro ao buscar conversas:`, convError)
    }

    const problemCount = problemConversations?.length || 0;
    console.log(`📊 [${requestId}] ${problemCount} conversas sem Dify ID encontradas`)

    // 4. VERIFICAR MENSAGENS SEM RESPOSTA BOT
    console.log(`💬 [${requestId}] Verificando mensagens sem resposta bot...`)
    let conversationsWithoutBotResponse = 0;
    const detailedProblems = [];

    if (problemConversations && problemConversations.length > 0) {
      for (const conv of problemConversations) {
        const { data: messages } = await supabaseClient
          .from('messages')
          .select('sender_type, content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        const hasClientMessage = messages?.some(m => m.sender_type === 'client');
        const hasBotResponse = messages?.some(m => m.sender_type === 'bot');
        
        if (hasClientMessage && !hasBotResponse) {
          conversationsWithoutBotResponse++;
          detailedProblems.push({
            conversation: conv,
            lastClientMessage: messages?.find(m => m.sender_type === 'client')?.content || 'N/A',
            messageCount: messages?.length || 0
          });
        }
      }
    }

    // 5. TESTE WEBHOOK WHATSAPP
    console.log(`📱 [${requestId}] Testando webhook WhatsApp...`)
    let webhookTest = { status: 'not_tested', error: null };
    
    try {
      const webhookUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/whatsapp-webhook`;
      const webhookResponse = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      });
      
      webhookTest.status = webhookResponse.ok ? 'working' : 'http_error';
      if (!webhookResponse.ok) {
        webhookTest.error = `HTTP ${webhookResponse.status}`;
      }
    } catch (error) {
      webhookTest.status = 'connection_error';
      webhookTest.error = error.message;
    }

    // 6. CALCULAR STATUS GERAL E RECOMENDAÇÕES
    let overallStatus = 'healthy';
    const criticalIssues = [];
    const recommendations = [];
    
    if (!credentialsCheck.dify_api_key) {
      overallStatus = 'critical';
      criticalIssues.push('DIFY_API_KEY não configurada');
      recommendations.push('Configure a DIFY_API_KEY nas configurações do projeto');
    }
    
    if (difyConnectivityTest.status === 'connection_error') {
      overallStatus = 'critical';
      criticalIssues.push('Dify não responde - erro de conectividade');
      recommendations.push('Verifique se o serviço Dify está funcionando');
    }
    
    if (difyConnectivityTest.status === 'http_error') {
      overallStatus = 'critical';
      criticalIssues.push(`Dify retorna erro HTTP ${difyConnectivityTest.httpStatus}`);
      recommendations.push('Verifique as credenciais do Dify e limites de quota');
    }
    
    if (problemCount > 0) {
      if (overallStatus === 'healthy') overallStatus = 'warning';
      criticalIssues.push(`${problemCount} conversas sem Dify ID`);
      recommendations.push('Execute reprocessamento de mensagens perdidas');
    }
    
    if (conversationsWithoutBotResponse > 0) {
      if (overallStatus === 'healthy') overallStatus = 'degraded';
      criticalIssues.push(`${conversationsWithoutBotResponse} conversas sem resposta do bot`);
      recommendations.push('Execute função de recuperação urgente de mensagens');
    }

    // 7. RESULTADOS DETALHADOS
    const result = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      requestId,
      
      // Credenciais
      credentials: credentialsCheck,
      
      // Teste Dify
      dify_connectivity: difyConnectivityTest,
      
      // Webhook WhatsApp
      webhook_test: webhookTest,
      
      // Análise conversas
      problem_analysis: {
        total_conversations_without_dify_id: problemCount,
        conversations_without_bot_response: conversationsWithoutBotResponse,
        sample_problems: detailedProblems.slice(0, 5)
      },
      
      // Problemas críticos
      critical_issues: criticalIssues,
      
      // Recomendações
      recommendations: [
        ...recommendations,
        overallStatus === 'healthy' ? 'Sistema funcionando normalmente' : 'Execute plano de recuperação completo'
      ],
      
      // Próximos passos
      next_steps: generateNextSteps(overallStatus, difyConnectivityTest.status, problemCount)
    };

    console.log(`📋 [${requestId}] Diagnóstico completo concluído: ${overallStatus}`)
    console.log(`📋 [${requestId}] Problemas críticos: ${criticalIssues.length}`)

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no diagnóstico:`, error)
    return new Response(JSON.stringify({ 
      status: 'critical_error',
      error: error.message,
      requestId: requestId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateNextSteps(overallStatus: string, difyStatus: string, problemCount: number): string[] {
  const steps = [];
  
  if (difyStatus === 'connection_error' || difyStatus === 'http_error') {
    steps.push('1. URGENTE: Corrigir conectividade com Dify');
    steps.push('2. Verificar e atualizar credenciais DIFY_API_KEY');
    steps.push('3. Testar nova configuração');
  }
  
  if (problemCount > 0) {
    steps.push(`4. Reprocessar ${problemCount} conversas perdidas`);
    steps.push('5. Gerar respostas automáticas para clientes afetados');
  }
  
  steps.push('6. Implementar monitoramento contínuo');
  steps.push('7. Configurar alertas para falhas futuras');
  
  return steps;
}

console.log('🔍 Complete Dify Diagnosis Function iniciada!')