import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🧪 Test Rodrigo Integration Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🧪 [${requestId}] ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { test_number } = await req.json()
    
    if (!test_number) {
      throw new Error('Parâmetro obrigatório: test_number')
    }

    console.log(`🧪 [${requestId}] Testando integração Rodrigo para número: ${test_number}`)

    const results = {
      request_id: requestId,
      test_number: test_number,
      timestamp: new Date().toISOString(),
      tests: []
    }

    // Teste 1: Verificar Rodri.GO na base
    try {
      const { data: rodrigo, error: rodrigoError } = await supabase
        .from('sellers')
        .select('id, name, whatsapp_number')
        .eq('whatsapp_number', '5551981155622')
        .single()

      if (rodrigoError || !rodrigo) {
        results.tests.push({
          name: 'rodrigo_database_check',
          status: 'failed',
          error: rodrigoError?.message || 'Rodri.GO não encontrado na base',
          details: { searched_number: '5551981155622' }
        })
      } else {
        results.tests.push({
          name: 'rodrigo_database_check',
          status: 'passed',
          details: {
            id: rodrigo.id,
            name: rodrigo.name,
            number: rodrigo.whatsapp_number
          }
        })
      }
    } catch (error) {
      results.tests.push({
        name: 'rodrigo_database_check',
        status: 'error',
        error: error.message
      })
    }

    // Teste 2: Verificar token Rodrigo
    const rodrigoToken = Deno.env.get('RODRIGO_WHAPI_TOKEN')
    if (!rodrigoToken) {
      results.tests.push({
        name: 'rodrigo_token_check',
        status: 'failed',
        error: 'RODRIGO_WHAPI_TOKEN não configurado nos secrets'
      })
    } else {
      results.tests.push({
        name: 'rodrigo_token_check',
        status: 'passed',
        details: {
          token_start: rodrigoToken.substring(0, 10) + '...',
          token_length: rodrigoToken.length
        }
      })
    }

    // Teste 3: Chamar função rodrigo-send-message
    try {
      console.log(`📞 [${requestId}] Testando envio via rodrigo-send-message...`)
      
      const testMessage = `🧪 TESTE DE INTEGRAÇÃO\n\nTeste automatizado ${requestId}\nData: ${new Date().toLocaleString('pt-BR')}\n\nSe você recebeu esta mensagem, a integração está funcionando! ✅`
      
      const { data: sendResult, error: sendError } = await supabase.functions.invoke('rodrigo-send-message', {
        body: {
          to_number: test_number,
          message: testMessage,
          context_type: 'test',
          metadata: {
            test_id: requestId,
            test_timestamp: new Date().toISOString()
          }
        }
      })

      if (sendError) {
        results.tests.push({
          name: 'rodrigo_send_message_test',
          status: 'failed',
          error: sendError.message,
          details: { send_error: sendError }
        })
      } else {
        results.tests.push({
          name: 'rodrigo_send_message_test',
          status: 'passed',
          details: sendResult
        })
      }
    } catch (error) {
      results.tests.push({
        name: 'rodrigo_send_message_test',
        status: 'error',
        error: error.message
      })
    }

    // Teste 4: Verificar conectividade Whapi direta
    if (rodrigoToken) {
      try {
        console.log(`🌐 [${requestId}] Testando conectividade Whapi direta...`)
        
        const whapiResponse = await fetch('https://gate.whapi.cloud/health', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${rodrigoToken}`
          }
        })

        if (whapiResponse.ok) {
          const healthData = await whapiResponse.json()
          results.tests.push({
            name: 'whapi_connectivity_test',
            status: 'passed',
            details: {
              whapi_status: whapiResponse.status,
              health_data: healthData
            }
          })
        } else {
          results.tests.push({
            name: 'whapi_connectivity_test',
            status: 'failed',
            error: `HTTP ${whapiResponse.status}: ${await whapiResponse.text()}`,
            details: { status: whapiResponse.status }
          })
        }
      } catch (error) {
        results.tests.push({
          name: 'whapi_connectivity_test',
          status: 'error',
          error: error.message
        })
      }
    }

    // Calcular resultado geral
    const totalTests = results.tests.length
    const passedTests = results.tests.filter(t => t.status === 'passed').length
    const failedTests = results.tests.filter(t => t.status === 'failed').length
    const errorTests = results.tests.filter(t => t.status === 'error').length

    results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      errors: errorTests,
      success_rate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
      overall_status: failedTests === 0 && errorTests === 0 ? 'success' : 'failure'
    }

    console.log(`🧪 [${requestId}] Teste concluído:`, results.summary)

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro no teste:`, error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      request_id: requestId
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})