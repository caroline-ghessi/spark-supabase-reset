import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  console.log(`🧪 Test Webhook Dify iniciado: ${req.method} ${req.url}`)
  
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
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    console.log(`🔍 Verificando credenciais:`)
    console.log(`   - Dify API Key: ${difyApiKey ? '✅ Configurada' : '❌ Ausente'}`)
    console.log(`   - Dify Base URL: ${difyBaseUrl}`)
    console.log(`   - WhatsApp Token: ${whatsappToken ? '✅ Configurado' : '❌ Ausente'}`)
    console.log(`   - Phone Number ID: ${phoneNumberId ? '✅ Configurado' : '❌ Ausente'}`)

    if (req.method === 'GET') {
      // Teste básico de conectividade
      return new Response(JSON.stringify({
        status: 'webhook_function_working',
        timestamp: new Date().toISOString(),
        credentials: {
          dify_api_key: !!difyApiKey,
          dify_base_url: difyBaseUrl,
          whatsapp_token: !!whatsappToken,
          phone_number_id: !!phoneNumberId
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      console.log(`📱 Simulando webhook com body:`, JSON.stringify(body, null, 2))

      // Testar comunicação com Dify
      if (difyApiKey) {
        console.log(`🤖 Testando comunicação com Dify...`)
        
        try {
          const difyResponse = await fetch(`${difyBaseUrl}/chat-messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${difyApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: {},
              query: 'Teste de conectividade',
              response_mode: 'blocking',
              user: 'test-user'
            })
          })

          const difyData = await difyResponse.text()
          console.log(`🤖 Resposta Dify (${difyResponse.status}):`, difyData.substring(0, 200))

          if (difyResponse.ok) {
            console.log(`✅ Dify funcionando corretamente`)
          } else {
            console.log(`❌ Erro no Dify: ${difyResponse.status}`)
          }
        } catch (error) {
          console.error(`❌ Erro ao conectar com Dify:`, error)
        }
      }

      // Verificar conversas problemáticas
      console.log(`🔍 Verificando conversas sem dify_conversation_id...`)
      
      const { data: problemConversations, error: convError } = await supabaseClient
        .from('conversations')
        .select('*')
        .is('dify_conversation_id', null)
        .eq('source', 'whatsapp')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (convError) {
        console.error(`❌ Erro ao buscar conversas:`, convError)
      } else {
        console.log(`📊 Encontradas ${problemConversations?.length || 0} conversas sem Dify ID`)
        problemConversations?.forEach(conv => {
          console.log(`   - ${conv.client_name} (${conv.client_phone}) - ${conv.created_at}`)
        })
      }

      return new Response(JSON.stringify({
        status: 'test_completed',
        timestamp: new Date().toISOString(),
        dify_test: difyApiKey ? 'attempted' : 'skipped_no_key',
        problem_conversations: problemConversations?.length || 0,
        conversations: problemConversations?.map(c => ({
          id: c.id,
          client_name: c.client_name,
          client_phone: c.client_phone,
          created_at: c.created_at
        })) || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })

  } catch (error) {
    console.error(`❌ Erro crítico no teste:`, error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🧪 Test Webhook Dify Function iniciada!')