import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🚀 Test OpenAI Integration Function iniciada!')

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    
    console.log(`🔍 [${requestId}] OpenAI API Key: ${openAIApiKey ? '✅ Configurado' : '❌ Ausente'}`)

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'openai_not_configured',
        message: 'OPENAI_API_KEY não está configurado nos secrets do Supabase'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Teste simples com OpenAI
    const testPrompt = 'Diga apenas "OpenAI funcionando!" como resposta de teste.'
    
    console.log(`🤖 [${requestId}] Testando OpenAI API...`)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente de teste.' },
          { role: 'user', content: testPrompt }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    })

    console.log(`🤖 [${requestId}] Status da resposta OpenAI: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ [${requestId}] Erro OpenAI:`, errorText)
      
      return new Response(JSON.stringify({
        success: false,
        error: 'openai_api_error',
        status: response.status,
        message: errorText
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    console.log(`✅ [${requestId}] Resposta OpenAI recebida:`, data.choices[0].message.content)

    return new Response(JSON.stringify({
      success: true,
      message: 'OpenAI integração funcionando perfeitamente!',
      response: data.choices[0].message.content,
      usage: data.usage
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