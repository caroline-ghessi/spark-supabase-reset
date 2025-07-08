import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Token do Rodri.GO dos secrets para segurança
const rodrigoWhapiToken = Deno.env.get('RODRIGO_WHAPI_TOKEN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🤖 Rodri.GO Send Message Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`📤 [${requestId}] ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { 
      to_number, 
      message, 
      message_type = 'text', 
      media_url,
      context_type = 'general', // 'alert', 'notification', 'escalation', 'general'
      metadata = {}
    } = await req.json()

    if (!to_number || !message) {
      throw new Error('Parâmetros obrigatórios: to_number, message')
    }

    // Verificar se o token do Rodri.GO está configurado nos secrets
    if (!rodrigoWhapiToken) {
      console.error(`❌ [${requestId}] Token Whapi do Rodri.GO não configurado`)
      throw new Error('Token Whapi do Rodri.GO não configurado nos secrets')
    }

    // CORREÇÃO: Buscar dados do Rodri.GO com o número atualizado
    const { data: rodrigo, error: rodrigoError } = await supabase
      .from('sellers')
      .select('id, name, whatsapp_number')
      .eq('whatsapp_number', '5551981155622') // Número corrigido
      .single()

    if (rodrigoError || !rodrigo) {
      console.error(`❌ [${requestId}] Erro ao buscar Rodri.GO:`, rodrigoError)
      throw new Error('Rodri.GO não encontrado na base de dados com número 5551981155622')
    }

    // Formatar número para padrão internacional (adicionar +55 se necessário)
    let formattedNumber = to_number.replace(/\D/g, '') // Remove caracteres não numéricos
    if (!formattedNumber.startsWith('55')) {
      formattedNumber = '55' + formattedNumber
    }
    formattedNumber = '+' + formattedNumber
    
    console.log(`🤖 [${requestId}] Enviando mensagem via Rodri.GO para: ${formattedNumber} (original: ${to_number})`)
    console.log(`📋 [${requestId}] Contexto: ${context_type}`)
    console.log(`🔑 [${requestId}] Token configurado: ${rodrigoWhapiToken ? 'SIM' : 'NÃO'}`)
    console.log(`📞 [${requestId}] Número Rodri.GO: ${rodrigo.whatsapp_number}`)

    // Preparar dados para Whapi
    const whapiData: any = {
      to: formattedNumber,
      body: message
    }

    if (message_type === 'media' && media_url) {
      whapiData.media_url = media_url
      whapiData.caption = message
      delete whapiData.body
    }

    console.log(`📊 [${requestId}] Dados Whapi:`, JSON.stringify(whapiData, null, 2))

    // Enviar via Whapi usando token dos secrets
    const whapiResponse = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rodrigoWhapiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whapiData)
    })

    const responseText = await whapiResponse.text()
    console.log(`📥 [${requestId}] Resposta Whapi RAW:`, responseText)

    if (!whapiResponse.ok) {
      console.error(`❌ [${requestId}] Erro na resposta Whapi:`, {
        status: whapiResponse.status,
        statusText: whapiResponse.statusText,
        error: responseText,
        url: 'https://gate.whapi.cloud/messages/text',
        data: whapiData,
        token_start: rodrigoWhapiToken?.substring(0, 10) + '...'
      })

      // Criar alerta crítico para falha de envio
      await supabase.functions.invoke('send-management-alert', {
        body: {
          alert_type: 'rodrigo_whapi_failure',
          severity: 'critical',
          message: `Falha no envio via Rodri.GO: ${whapiResponse.status} - ${responseText}`,
          context: {
            to_number: formattedNumber,
            context_type,
            error_status: whapiResponse.status,
            error_message: responseText
          }
        }
      }).catch(e => console.error('Erro ao enviar alerta:', e))

      throw new Error(`Erro Whapi: ${whapiResponse.status} - ${responseText}`)
    }

    let whapiResult
    try {
      whapiResult = JSON.parse(responseText)
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro ao parsear resposta JSON:`, parseError)
      throw new Error('Resposta Whapi inválida - não é JSON válido')
    }
    
    console.log(`✅ [${requestId}] Mensagem enviada via Rodri.GO:`, whapiResult)
    
    if (!whapiResult.id) {
      console.error(`⚠️ [${requestId}] Resposta Whapi sem message_id:`, whapiResult)
      
      // Alerta para resposta sem ID
      await supabase.functions.invoke('send-management-alert', {
        body: {
          alert_type: 'rodrigo_missing_message_id',
          severity: 'high',
          message: `Rodri.GO: Resposta Whapi sem message_id para ${formattedNumber}`,
          context: {
            to_number: formattedNumber,
            context_type,
            whapi_response: whapiResult
          }
        }
      }).catch(e => console.error('Erro ao enviar alerta:', e))

      throw new Error('Resposta Whapi inválida - sem message_id')
    }

    // Salvar log da comunicação com status correto
    const communicationLog = {
      sender_id: rodrigo.id,
      sender_name: 'Rodri.GO',
      recipient_number: formattedNumber,
      message_content: message,
      message_type: message_type,
      context_type: context_type,
      whapi_message_id: whapiResult.id,
      metadata: {
        ...metadata,
        original_number: to_number,
        formatted_number: formattedNumber,
        sent_at: new Date().toISOString(),
        request_id: requestId,
        whapi_response: whapiResult,
        rodrigo_number: rodrigo.whatsapp_number
      },
      status: 'delivered'
    }

    const { error: logError } = await supabase
      .from('communication_logs')
      .insert(communicationLog)

    if (logError) {
      console.error(`⚠️ [${requestId}] Erro ao salvar log:`, logError)
    } else {
      console.log(`📝 [${requestId}] Log salvo com sucesso`)
    }

    return new Response(JSON.stringify({
      success: true,
      whapi_message_id: whapiResult.id,
      sender: 'Rodri.GO',
      sender_number: rodrigo.whatsapp_number,
      context_type: context_type,
      formatted_number: formattedNumber
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    
    // Log do erro na base de dados
    await supabase
      .from('communication_logs')
      .insert({
        sender_name: 'Rodri.GO',
        recipient_number: 'error',
        message_content: `ERRO: ${error.message}`,
        context_type: 'error',
        status: 'failed',
        metadata: {
          error_message: error.message,
          request_id: requestId,
          timestamp: new Date().toISOString()
        }
      })
      .catch(e => console.error('Erro ao salvar log de erro:', e))

    return new Response(JSON.stringify({ 
      error: error.message,
      request_id: requestId
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})