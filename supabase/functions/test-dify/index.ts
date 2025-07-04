
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    
    console.log('🧪 Teste Dify iniciado com mensagem:', message)
    
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'
    const difyAppId = Deno.env.get('DIFY_APP_ID')
    
    console.log('🔍 Verificando credenciais:')
    console.log('  - Dify API Key:', difyApiKey ? `${difyApiKey.substring(0, 10)}...` : 'AUSENTE')
    console.log('  - Dify Base URL:', difyBaseUrl)
    console.log('  - Dify App ID:', difyAppId ? `${difyAppId.substring(0, 10)}...` : 'AUSENTE')
    
    if (!difyApiKey) {
      console.error('❌ DIFY_API_KEY não configurada')
      return new Response(JSON.stringify({
        success: false,
        error: 'DIFY_API_KEY não está configurada nas variáveis de ambiente',
        details: {
          missing_credentials: ['DIFY_API_KEY'],
          base_url: difyBaseUrl,
          app_id: difyAppId ? 'Configurado' : 'Ausente'
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Construir URL correta - remover /v1 duplicado se existir
    const cleanBaseUrl = difyBaseUrl.replace(/\/v1$/, '')
    const url = `${cleanBaseUrl}/v1/chat-messages`
    
    const requestBody = {
      inputs: {},
      query: message || 'Teste de conexão',
      response_mode: 'blocking',
      user: 'test-user'
    }

    console.log('🚀 Enviando requisição para Dify:', { url, body: requestBody })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    let responseData
    const responseText = await response.text()
    
    console.log('📥 Resposta bruta do Dify:', responseText)
    
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Resposta inválida do Dify - não é JSON válido',
        details: {
          status: response.status,
          response_text: responseText.substring(0, 500),
          parse_error: parseError.message
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    console.log('📥 Resposta processada do Dify:')
    console.log('  - Status:', response.status)
    console.log('  - Data:', JSON.stringify(responseData, null, 2))

    if (!response.ok) {
      console.error('❌ Erro na API do Dify:', responseData)
      return new Response(JSON.stringify({
        success: false,
        error: `Erro HTTP ${response.status} na API do Dify`,
        details: {
          status: response.status,
          response: responseData,
          url: url,
          request_body: requestBody
        }
      }), {
        status: 200, // Retornamos 200 mas com success: false
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!responseData.answer) {
      console.error('❌ Resposta sem campo "answer":', responseData)
      return new Response(JSON.stringify({
        success: false,
        error: 'Resposta do Dify não contém o campo "answer"',
        details: {
          received_fields: Object.keys(responseData),
          full_response: responseData
        }
      }), {
        status: 200, // Retornamos 200 mas com success: false
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Teste concluído com sucesso!')
    
    return new Response(JSON.stringify({
      success: true,
      response: responseData.answer,
      details: {
        conversation_id: responseData.conversation_id,
        message_id: responseData.message_id,
        created_at: responseData.created_at,
        url_used: url
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro crítico no teste Dify:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: {
        stack: error.stack,
        name: error.name
      }
    }), {
      status: 200, // Retornamos 200 mas com success: false para evitar erro de parse
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🧪 Função de teste Dify iniciada!')
