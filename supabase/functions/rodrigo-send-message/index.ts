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
      throw new Error('Token Whapi do Rodri.GO não configurado nos secrets')
    }

    // Buscar dados do Rodri.GO para logs
    const { data: rodrigo, error: rodrigoError } = await supabase
      .from('sellers')
      .select('id, name, whatsapp_number')
      .eq('whatsapp_number', '5194916150')
      .single()

    if (rodrigoError || !rodrigo) {
      console.log(`❌ [${requestId}] Erro ao buscar Rodri.GO:`, rodrigoError)
      throw new Error('Rodri.GO não encontrado na base de dados')
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

    // Enviar via Whapi usando token dos secrets
    const whapiResponse = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rodrigoWhapiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whapiData)
    })

    if (!whapiResponse.ok) {
      const errorText = await whapiResponse.text()
      console.error(`❌ [${requestId}] Erro na resposta Whapi:`, {
        status: whapiResponse.status,
        statusText: whapiResponse.statusText,
        error: errorText,
        url: 'https://gate.whapi.cloud/messages/text',
        data: whapiData
      })
      throw new Error(`Erro Whapi: ${whapiResponse.status} - ${errorText}`)
    }

    const whapiResult = await whapiResponse.json()
    console.log(`✅ [${requestId}] Mensagem enviada via Rodri.GO:`, whapiResult)
    
    if (!whapiResult.id) {
      console.error(`⚠️ [${requestId}] Resposta Whapi sem message_id:`, whapiResult)
      throw new Error('Resposta Whapi inválida - sem message_id')
    }

    // Salvar log da comunicação
    const communicationLog = {
      sender_id: rodrigo.id,
      sender_name: 'Rodri.GO',
      recipient_number: formattedNumber, // Usar número formatado
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
        whapi_response: whapiResult
      },
      status: 'delivered'
    }

    const { error: logError } = await supabase
      .from('communication_logs')
      .insert(communicationLog)

    if (logError) {
      console.error(`⚠️ [${requestId}] Erro ao salvar log:`, logError)
    }

    return new Response(JSON.stringify({
      success: true,
      whapi_message_id: whapiResult.id,
      sender: 'Rodri.GO',
      context_type: context_type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})