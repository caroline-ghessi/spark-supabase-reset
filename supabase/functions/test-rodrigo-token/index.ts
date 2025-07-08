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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🔍 [${requestId}] Testando token e conectividade do Rodri.GO`)

  try {
    const rodrigoWhapiToken = Deno.env.get('RODRIGO_WHAPI_TOKEN')
    
    if (!rodrigoWhapiToken) {
      throw new Error('Token RODRIGO_WHAPI_TOKEN não configurado nos secrets')
    }

    console.log(`🔑 [${requestId}] Token encontrado: ${rodrigoWhapiToken.substring(0, 10)}...`)

    // 1. Verificar dados do Rodri.GO na base
    const { data: rodrigo, error: rodrigoError } = await supabase
      .from('sellers')
      .select('id, name, whatsapp_number')
      .eq('whatsapp_number', '5551981155622')
      .single()

    if (rodrigoError || !rodrigo) {
      throw new Error(`Rodri.GO não encontrado na base com número 5551981155622: ${rodrigoError?.message}`)
    }

    console.log(`👤 [${requestId}] Rodri.GO encontrado:`, rodrigo)

    // 2. Testar conectividade com API Whapi
    console.log(`📡 [${requestId}] Testando conectividade com Whapi...`)
    
    const whapiTestResponse = await fetch('https://gate.whapi.cloud/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${rodrigoWhapiToken}`,
        'Content-Type': 'application/json'
      }
    })

    const whapiTestText = await whapiTestResponse.text()
    console.log(`📥 [${requestId}] Resposta Whapi /me:`, whapiTestText)

    let whapiTestResult
    if (whapiTestResponse.ok) {
      try {
        whapiTestResult = JSON.parse(whapiTestText)
        console.log(`✅ [${requestId}] Conectividade Whapi OK:`, whapiTestResult)
      } catch (parseError) {
        console.error(`❌ [${requestId}] Erro ao parsear resposta:`, parseError)
        throw new Error('Resposta Whapi inválida - não é JSON')
      }
    } else {
      console.error(`❌ [${requestId}] Erro na conectividade Whapi:`, {
        status: whapiTestResponse.status,
        statusText: whapiTestResponse.statusText,
        response: whapiTestText
      })
      throw new Error(`Erro Whapi: ${whapiTestResponse.status} - ${whapiTestText}`)
    }

    // 3. Testar envio de mensagem de teste para número de desenvolvimento
    console.log(`📤 [${requestId}] Testando envio de mensagem...`)
    
    const testMessage = {
      to: '+5551981155622', // Enviar para o próprio Rodri.GO como teste
      body: `🔄 TESTE DE CONECTIVIDADE - ${new Date().toLocaleString('pt-BR')}\n\nSistema Rodri.GO funcionando corretamente! ✅\n\nToken validado e API conectada.`
    }

    const sendResponse = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rodrigoWhapiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    })

    const sendResponseText = await sendResponse.text()
    console.log(`📥 [${requestId}] Resposta envio:`, sendResponseText)

    let sendResult
    if (sendResponse.ok) {
      try {
        sendResult = JSON.parse(sendResponseText)
        console.log(`✅ [${requestId}] Mensagem enviada com sucesso:`, sendResult)
      } catch (parseError) {
        console.error(`❌ [${requestId}] Erro ao parsear resposta de envio:`, parseError)
        throw new Error('Resposta de envio inválida - não é JSON')
      }
    } else {
      console.error(`❌ [${requestId}] Erro no envio:`, {
        status: sendResponse.status,
        statusText: sendResponse.statusText,
        response: sendResponseText
      })
      throw new Error(`Erro no envio: ${sendResponse.status} - ${sendResponseText}`)
    }

    // 4. Salvar log do teste
    await supabase
      .from('communication_logs')
      .insert({
        sender_id: rodrigo.id,
        sender_name: 'Rodri.GO',
        recipient_number: '+5551981155622',
        message_content: 'TESTE DE CONECTIVIDADE - Sistema funcionando',
        context_type: 'test',
        whapi_message_id: sendResult.id,
        status: 'delivered',
        metadata: {
          test_result: 'success',
          whapi_account: whapiTestResult,
          request_id: requestId,
          test_timestamp: new Date().toISOString()
        }
      })

    const result = {
      success: true,
      rodrigo_data: rodrigo,
      whapi_account: whapiTestResult,
      test_message: sendResult,
      token_valid: true,
      connectivity_ok: true,
      message: 'Rodri.GO está funcionando corretamente!',
      request_id: requestId
    }

    console.log(`✅ [${requestId}] Teste concluído com sucesso:`, result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro no teste:`, error)
    
    // Salvar log do erro
    await supabase
      .from('communication_logs')
      .insert({
        sender_name: 'Rodri.GO',
        recipient_number: 'test_error',
        message_content: `ERRO NO TESTE: ${error.message}`,
        context_type: 'test_error',
        status: 'failed',
        metadata: {
          error_message: error.message,
          request_id: requestId,
          test_timestamp: new Date().toISOString()
        }
      })
      .catch(e => console.error('Erro ao salvar log:', e))

    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      request_id: requestId,
      message: 'Teste falhado - verifique o token e configurações'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})