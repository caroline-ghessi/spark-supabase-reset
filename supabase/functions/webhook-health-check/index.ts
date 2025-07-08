import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🏥 [${requestId}] Webhook Health Check iniciado: ${req.method}`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar credenciais
    const webhookUrl = Deno.env.get('SUPABASE_URL') ? 
      `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/whatsapp-webhook` : 
      'URL não configurada'
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    console.log(`🔍 [${requestId}] Verificando configuração do webhook...`)
    console.log(`   - Webhook URL: ${webhookUrl}`)
    console.log(`   - Dify API Key: ${difyApiKey ? '✅ Configurada' : '❌ Ausente'}`)
    console.log(`   - WhatsApp Token: ${whatsappToken ? '✅ Configurado' : '❌ Ausente'}`)
    console.log(`   - Phone Number ID: ${phoneNumberId ? '✅ Configurado' : '❌ Ausente'}`)

    // 1. Testar se o webhook principal responde
    console.log(`🧪 [${requestId}] Testando webhook principal...`)
    let webhookStatus = 'error';
    let webhookResponseTime = 0;
    
    try {
      const webhookStartTime = Date.now();
      const webhookTestResponse = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      });
      
      webhookResponseTime = Date.now() - webhookStartTime;
      
      if (webhookTestResponse.ok) {
        webhookStatus = 'working';
        console.log(`✅ [${requestId}] Webhook responde em ${webhookResponseTime}ms`);
      } else {
        webhookStatus = 'http_error';
        console.log(`❌ [${requestId}] Webhook retornou ${webhookTestResponse.status}`);
      }
    } catch (error) {
      console.error(`❌ [${requestId}] Erro ao testar webhook:`, error);
      webhookStatus = 'connection_error';
    }

    // 2. Verificar conversas das últimas 24h sem dify_conversation_id
    console.log(`🔍 [${requestId}] Verificando conversas problemáticas...`)
    
    const { data: problemConversations, error: convError } = await supabaseClient
      .from('conversations')
      .select('id, client_name, client_phone, created_at, status, source')
      .is('dify_conversation_id', null)
      .eq('source', 'whatsapp')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (convError) {
      console.error(`❌ [${requestId}] Erro ao buscar conversas:`, convError)
    }

    const problemCount = problemConversations?.length || 0;
    console.log(`📊 [${requestId}] ${problemCount} conversas sem Dify ID encontradas`)

    // 3. Verificar mensagens recentes sem resposta do bot
    console.log(`🔍 [${requestId}] Verificando mensagens sem resposta do bot...`)
    
    let messagesWithoutBotResponse = 0;
    if (problemConversations && problemConversations.length > 0) {
      for (const conv of problemConversations) {
        const { data: messages } = await supabaseClient
          .from('messages')
          .select('sender_type')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        const hasClientMessage = messages?.some(m => m.sender_type === 'client');
        const hasBotResponse = messages?.some(m => m.sender_type === 'bot');
        
        if (hasClientMessage && !hasBotResponse) {
          messagesWithoutBotResponse++;
        }
      }
    }

    // 4. Testar conectividade com Dify se configurado
    let difyStatus = 'not_configured';
    let difyResponseTime = 0;
    
    if (difyApiKey) {
      console.log(`🤖 [${requestId}] Testando conectividade com Dify...`)
      try {
        const difyStartTime = Date.now();
        const difyResponse = await fetch(`${Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'}/chat-messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${difyApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: {},
            query: 'Health check test',
            response_mode: 'blocking',
            user: 'health-check'
          })
        });
        
        difyResponseTime = Date.now() - difyStartTime;
        
        if (difyResponse.ok) {
          difyStatus = 'working';
          console.log(`✅ [${requestId}] Dify responde em ${difyResponseTime}ms`);
        } else {
          difyStatus = 'error';
          console.log(`❌ [${requestId}] Dify erro: ${difyResponse.status}`);
        }
      } catch (error) {
        difyStatus = 'connection_error';
        console.error(`❌ [${requestId}] Erro ao testar Dify:`, error);
      }
    }

    // 5. Calcular status geral do sistema
    let overallStatus = 'healthy';
    const issues = [];
    
    if (webhookStatus !== 'working') {
      overallStatus = 'critical';
      issues.push('Webhook não está respondendo');
    }
    
    if (difyStatus === 'error' || difyStatus === 'connection_error') {
      overallStatus = overallStatus === 'critical' ? 'critical' : 'degraded';
      issues.push('Dify não está funcionando');
    }
    
    if (problemCount > 0) {
      overallStatus = overallStatus === 'critical' ? 'critical' : 'warning';
      issues.push(`${problemCount} conversas sem resposta do bot`);
    }
    
    if (messagesWithoutBotResponse > 0) {
      overallStatus = overallStatus === 'critical' ? 'critical' : 'warning';
      issues.push(`${messagesWithoutBotResponse} mensagens sem resposta`);
    }

    console.log(`📊 [${requestId}] Health check concluído: ${overallStatus}`)

    // 6. Retornar resultado detalhado
    const result = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      requestId,
      checks: {
        webhook: {
          status: webhookStatus,
          responseTime: webhookResponseTime,
          url: webhookUrl
        },
        dify: {
          status: difyStatus,
          responseTime: difyResponseTime,
          configured: !!difyApiKey
        },
        conversations: {
          problemCount: problemCount,
          withoutBotResponse: messagesWithoutBotResponse,
          conversations: problemConversations?.slice(0, 5).map(c => ({
            id: c.id,
            client_name: c.client_name,
            client_phone: c.client_phone,
            created_at: c.created_at,
            status: c.status
          })) || []
        }
      },
      issues,
      recommendations: generateRecommendations(webhookStatus, difyStatus, problemCount, messagesWithoutBotResponse)
    };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no health check:`, error)
    return new Response(JSON.stringify({ 
      status: 'critical',
      error: error.message,
      requestId: requestId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateRecommendations(webhookStatus: string, difyStatus: string, problemCount: number, messagesWithoutResponse: number): string[] {
  const recommendations = [];
  
  if (webhookStatus !== 'working') {
    recommendations.push('Verifique a configuração do webhook no Meta Developer Console');
    recommendations.push('Confirme se a URL do webhook está correta');
    recommendations.push('Verifique se o verify token está configurado corretamente');
  }
  
  if (difyStatus === 'error' || difyStatus === 'connection_error') {
    recommendations.push('Verifique as credenciais do Dify (API Key e Base URL)');
    recommendations.push('Teste a conectividade com a API do Dify manualmente');
  }
  
  if (problemCount > 0) {
    recommendations.push('Execute o reprocessamento de mensagens perdidas');
    recommendations.push('Verifique se o webhook está recebendo as mensagens do Meta');
  }
  
  if (messagesWithoutResponse > 0) {
    recommendations.push('Execute a função de reprocessamento urgente');
    recommendations.push('Monitore os logs do webhook para identificar falhas');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Sistema funcionando normalmente');
  }
  
  return recommendations;
}

console.log('🏥 Webhook Health Check Function iniciada!')