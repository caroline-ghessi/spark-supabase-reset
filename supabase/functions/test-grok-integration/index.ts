import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🚀 Test Grok Integration Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const grokApiKey = Deno.env.get('GROK_API_KEY')
    
    console.log(`🔍 [${requestId}] Grok API Key: ${grokApiKey ? '✅ Configurado' : '❌ Ausente'}`)

    if (!grokApiKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'grok_not_configured',
        message: 'GROK_API_KEY não está configurado nos secrets do Supabase'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Teste simples com Grok AI
    const testPrompt = 'Diga apenas "Grok AI funcionando!" como resposta de teste.'
    
    console.log(`🤖 [${requestId}] Testando Grok API...`)

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [
          { role: 'system', content: 'Você é um assistente de teste.' },
          { role: 'user', content: testPrompt }
        ],
        max_tokens: 50,
        temperature: 0.1,
        stream: false
      })
    })

    console.log(`🤖 [${requestId}] Status da resposta Grok: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ [${requestId}] Erro Grok:`, errorText)
      
      return new Response(JSON.stringify({
        success: false,
        error: 'grok_api_error',
        status: response.status,
        message: errorText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Resposta Grok recebida:`, data.choices[0].message.content)

    return new Response(JSON.stringify({
      success: true,
      message: 'Grok AI integração funcionando perfeitamente!',
      response: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      model: 'grok-3-latest'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'integration_test_failed',
      message: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})