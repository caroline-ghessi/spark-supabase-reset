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

    // Formatar número (remover + se presente, manter apenas dígitos)
    const cleanNumber = to_number.replace(/^\+/, '').replace(/\D/g, '')
    
    console.log(`🤖 [${requestId}] Enviando mensagem via Rodri.GO para: ${cleanNumber} (original: ${to_number})`)
    console.log(`📋 [${requestId}] Contexto: ${context_type}`)
    console.log(`🔑 [${requestId}] Token configurado: ${rodrigoWhapiToken ? 'SIM' : 'NÃO'}`)
    console.log(`📞 [${requestId}] Número Rodri.GO: ${rodrigo.whatsapp_number}`)

    // Preparar dados para Whapi
    const whapiData: any = {
      to: cleanNumber,
      body: message
    }

    if (message_type === 'media' && media_url) {
      whapiData.media_url = media_url
      whapiData.caption = message
      delete whapiData.body
    }

    console.log(`📊 [${requestId}] Dados Whapi:`, JSON.stringify(whapiData, null, 2))

    // Enviar via Whapi com timeout de 10 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    let whapiResponse
    try {
      whapiResponse = await fetch(`https://gate.whapi.cloud/messages/text?token=${rodrigoWhapiToken}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer https://gate.whapi.cloud/',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whapiData),
        signal: controller.signal
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error(`❌ [${requestId}] Erro de rede/timeout Whapi:`, fetchError)
      throw new Error(`Falha de conectividade Whapi: ${fetchError.message}`)
    }
    
    clearTimeout(timeoutId)
    
    let responseText = ''
    try {
      responseText = await whapiResponse.text()
    } catch (textError) {
      console.error(`❌ [${requestId}] Erro ao ler resposta:`, textError)
      throw new Error('Erro ao processar resposta da API Whapi')
    }
    
    console.log(`📥 [${requestId}] Resposta Whapi:`, {
      status: whapiResponse.status,
      headers: Object.fromEntries(whapiResponse.headers.entries()),
      body: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
    })

    if (!whapiResponse.ok) {
      console.error(`❌ [${requestId}] Erro HTTP Whapi:`, {
        status: whapiResponse.status,
        statusText: whapiResponse.statusText,
        error: responseText,
        request_data: whapiData
      })

      throw new Error(`Erro Whapi HTTP ${whapiResponse.status}: ${responseText}`)
    }

    // Parse da resposta com validação robusta
    let whapiResult
    try {
      if (!responseText.trim()) {
        throw new Error('Resposta vazia da API Whapi')
      }
      
      whapiResult = JSON.parse(responseText)
      
      if (!whapiResult || typeof whapiResult !== 'object') {
        throw new Error('Resposta não é um objeto JSON válido')
      }
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro JSON parsing:`, {
        error: parseError.message,
        response_text: responseText,
        response_length: responseText.length
      })
      throw new Error(`Resposta Whapi inválida: ${parseError.message}`)
    }
    
    console.log(`✅ [${requestId}] Resposta Whapi parseada:`, whapiResult)
    
    // Validação do message_id com diferentes formatos possíveis
    const messageId = whapiResult.id || whapiResult.message_id || whapiResult.messageId
    
    if (!messageId) {
      console.error(`⚠️ [${requestId}] Resposta sem message_id:`, {
        response: whapiResult,
        available_keys: Object.keys(whapiResult)
      })
      
      // Se tem sent=true ou status=success, considerar como enviado mesmo sem ID
      if (whapiResult.sent === true || whapiResult.status === 'success' || whapiResult.success === true) {
        console.log(`✅ [${requestId}] Mensagem considerada enviada apesar de não ter ID`)
        whapiResult.id = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      } else {
        throw new Error('Resposta Whapi sem identificador de mensagem válido')
      }
    } else {
      // Normalizar o ID para o campo padrão
      whapiResult.id = messageId
    }

    // Salvar log da comunicação com status correto
    const communicationLog = {
      sender_id: rodrigo.id,
      sender_name: 'Rodri.GO',
      recipient_number: cleanNumber,
      message_content: message,
      message_type: message_type,
      context_type: context_type,
      whapi_message_id: whapiResult.id,
      metadata: {
        ...metadata,
        original_number: to_number,
        clean_number: cleanNumber,
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
      clean_number: cleanNumber
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