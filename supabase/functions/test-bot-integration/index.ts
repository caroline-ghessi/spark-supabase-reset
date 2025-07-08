import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  console.log(`🧪 Test Bot Integration iniciado: ${req.method} ${req.url}`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar credenciais Dify
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    console.log(`🔍 Verificando credenciais:`)
    console.log(`   - Dify API Key: ${difyApiKey ? '✅ Configurada' : '❌ Ausente'}`)
    console.log(`   - Dify Base URL: ${difyBaseUrl}`)
    console.log(`   - WhatsApp Token: ${whatsappToken ? '✅ Configurado' : '❌ Ausente'}`)
    console.log(`   - Phone Number ID: ${phoneNumberId ? '✅ Configurado' : '❌ Ausente'}`)

    const results = {
      timestamp: new Date().toISOString(),
      credentials_check: {
        dify_api_key: !!difyApiKey,
        dify_base_url: difyBaseUrl,
        whatsapp_token: !!whatsappToken,
        phone_number_id: !!phoneNumberId
      },
      tests: []
    }

    // TESTE 1: Conectividade com Dify
    console.log(`🤖 === TESTE 1: CONECTIVIDADE DIFY ===`)
    
    if (difyApiKey) {
      try {
        const cleanBaseUrl = difyBaseUrl.replace(/\/v1$/, '').replace(/\/$/, '')
        const difyUrl = `${cleanBaseUrl}/v1/chat-messages`
        
        console.log(`🤖 URL Dify: ${difyUrl}`)
        
        const difyResponse = await fetch(difyUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${difyApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: {},
            query: 'Teste de conectividade - responda apenas "OK"',
            response_mode: 'blocking',
            user: 'test-integration'
          })
        })

        const difyText = await difyResponse.text()
        console.log(`🤖 Status Dify: ${difyResponse.status}`)
        console.log(`🤖 Resposta Dify: ${difyText.substring(0, 500)}`)

        if (difyResponse.ok) {
          try {
            const difyData = JSON.parse(difyText)
            
            results.tests.push({
              name: 'dify_connectivity',
              status: 'SUCCESS',
              details: {
                http_status: difyResponse.status,
                has_answer: !!difyData.answer,
                has_conversation_id: !!difyData.conversation_id,
                answer_preview: difyData.answer?.substring(0, 100),
                conversation_id: difyData.conversation_id
              }
            })
            
            console.log(`✅ DIFY FUNCIONANDO: ${difyData.answer}`)
            
          } catch (parseError) {
            results.tests.push({
              name: 'dify_connectivity',
              status: 'PARSE_ERROR',
              error: parseError.message,
              raw_response: difyText.substring(0, 500)
            })
          }
        } else {
          results.tests.push({
            name: 'dify_connectivity',
            status: 'HTTP_ERROR',
            http_status: difyResponse.status,
            error: difyText.substring(0, 500)
          })
        }
        
      } catch (difyError) {
        console.error(`❌ Erro Dify:`, difyError)
        results.tests.push({
          name: 'dify_connectivity',
          status: 'NETWORK_ERROR',
          error: difyError.message
        })
      }
    } else {
      results.tests.push({
        name: 'dify_connectivity',
        status: 'SKIPPED',
        reason: 'API_KEY_MISSING'
      })
    }

    // TESTE 2: Verificar conversas sem dify_conversation_id
    console.log(`🔍 === TESTE 2: CONVERSAS SEM DIFY_CONVERSATION_ID ===`)
    
    try {
      const { data: problemConversations, error: convError } = await supabaseClient
        .from('conversations')
        .select('id, client_name, client_phone, status, dify_conversation_id, created_at')
        .is('dify_conversation_id', null)
        .eq('source', 'whatsapp')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      if (convError) {
        results.tests.push({
          name: 'conversations_without_dify_id',
          status: 'ERROR',
          error: convError.message
        })
      } else {
        results.tests.push({
          name: 'conversations_without_dify_id',
          status: 'SUCCESS',
          count: problemConversations?.length || 0,
          conversations: problemConversations?.map(c => ({
            id: c.id,
            client_name: c.client_name,
            client_phone: c.client_phone,
            status: c.status,
            created_at: c.created_at
          })) || []
        })
        
        console.log(`📊 Encontradas ${problemConversations?.length || 0} conversas sem Dify ID`)
      }
    } catch (error) {
      results.tests.push({
        name: 'conversations_without_dify_id',
        status: 'EXCEPTION',
        error: error.message
      })
    }

    // TESTE 3: Simular processamento de mensagem
    console.log(`📱 === TESTE 3: SIMULAR PROCESSAMENTO ===`)
    
    try {
      // Criar conversa de teste
      const testPhone = `test_${Date.now()}`
      
      const { data: testConv, error: createError } = await supabaseClient
        .from('conversations')
        .insert({
          client_phone: testPhone,
          client_name: 'Teste Bot',
          status: 'bot',
          lead_temperature: 'cold',
          source: 'whatsapp',
          priority: 'normal',
          metadata: { test: true }
        })
        .select()
        .single()

      if (createError) {
        results.tests.push({
          name: 'message_processing_simulation',
          status: 'CONVERSATION_CREATE_ERROR',
          error: createError.message
        })
      } else {
        console.log(`✅ Conversa de teste criada: ${testConv.id}`)
        
        // Simular mensagem de cliente
        const { data: clientMsg, error: msgError } = await supabaseClient
          .from('messages')
          .insert({
            conversation_id: testConv.id,
            sender_type: 'client',
            sender_name: 'Teste Bot',
            content: 'Olá, esta é uma mensagem de teste',
            message_type: 'text',
            whatsapp_message_id: `test_${Date.now()}`,
            status: 'received',
            metadata: { test: true }
          })
          .select()
          .single()

        if (msgError) {
          results.tests.push({
            name: 'message_processing_simulation',
            status: 'MESSAGE_CREATE_ERROR',
            error: msgError.message
          })
        } else {
          results.tests.push({
            name: 'message_processing_simulation',
            status: 'SUCCESS',
            test_conversation_id: testConv.id,
            test_message_id: clientMsg.id,
            note: 'Conversa e mensagem de teste criadas com sucesso'
          })
          
          console.log(`✅ Mensagem de teste criada: ${clientMsg.id}`)
        }
      }
    } catch (error) {
      results.tests.push({
        name: 'message_processing_simulation',
        status: 'EXCEPTION',
        error: error.message
      })
    }

    // TESTE 4: Status geral do sistema
    console.log(`⚙️ === TESTE 4: STATUS GERAL ===`)
    
    try {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const [conversationsResult, messagesResult] = await Promise.all([
        supabaseClient
          .from('conversations')
          .select('id, status, dify_conversation_id')
          .gte('created_at', last24h),
        supabaseClient
          .from('messages')
          .select('id, sender_type, metadata')
          .gte('created_at', last24h)
      ])

      const conversations = conversationsResult.data || []
      const messages = messagesResult.data || []
      
      const stats = {
        total_conversations_24h: conversations.length,
        conversations_with_dify_id: conversations.filter(c => c.dify_conversation_id).length,
        conversations_without_dify_id: conversations.filter(c => !c.dify_conversation_id).length,
        total_messages_24h: messages.length,
        bot_messages_24h: messages.filter(m => m.sender_type === 'bot').length,
        client_messages_24h: messages.filter(m => m.sender_type === 'client').length,
        dify_success_rate: conversations.length > 0 ? 
          (conversations.filter(c => c.dify_conversation_id).length / conversations.length * 100).toFixed(2) + '%' : 'N/A'
      }
      
      results.tests.push({
        name: 'system_status',
        status: 'SUCCESS',
        stats
      })
      
      console.log(`📊 Stats 24h:`, stats)
      
    } catch (error) {
      results.tests.push({
        name: 'system_status',
        status: 'ERROR',
        error: error.message
      })
    }

    // RESULTADO FINAL
    const successfulTests = results.tests.filter(t => t.status === 'SUCCESS').length
    const totalTests = results.tests.length
    
    results.summary = {
      total_tests: totalTests,
      successful_tests: successfulTests,
      success_rate: `${(successfulTests / totalTests * 100).toFixed(1)}%`,
      overall_status: successfulTests === totalTests ? 'ALL_GREEN' : 
                     successfulTests >= totalTests * 0.7 ? 'MOSTLY_GREEN' : 'NEEDS_ATTENTION'
    }

    console.log(`🎯 RESULTADO FINAL:`, results.summary)

    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error(`❌ Erro crítico no teste:`, error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🧪 Test Bot Integration Function iniciada!')