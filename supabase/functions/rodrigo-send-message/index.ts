import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('🤖 Rodri.GO Send Message Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`📤 [${requestId}] ${req.method} ${req.url}`)

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
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

    // Buscar dados do Rodri.GO
    const { data: rodrigo, error: rodrigoError } = await supabase
      .from('sellers')
      .select('*')
      .eq('whatsapp_number', '5194916150')
      .single()

    if (rodrigoError || !rodrigo) {
      throw new Error('Rodri.GO não encontrado na base de dados')
    }

    if (!rodrigo.whapi_token) {
      throw new Error('Token Whapi não configurado para Rodri.GO')
    }

    console.log(`🤖 [${requestId}] Enviando mensagem via Rodri.GO para: ${to_number}`)
    console.log(`📋 [${requestId}] Contexto: ${context_type}`)

    // Preparar dados para Whapi
    const whapiData: any = {
      to: to_number,
      body: message
    }

    if (message_type === 'media' && media_url) {
      whapiData.media_url = media_url
      whapiData.caption = message
      delete whapiData.body
    }

    // Enviar via Whapi
    const whapiResponse = await fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rodrigo.whapi_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whapiData)
    })

    if (!whapiResponse.ok) {
      const errorText = await whapiResponse.text()
      throw new Error(`Erro Whapi: ${whapiResponse.status} - ${errorText}`)
    }

    const whapiResult = await whapiResponse.json()
    console.log(`✅ [${requestId}] Mensagem enviada via Rodri.GO:`, whapiResult.id)

    // Salvar log da comunicação
    const communicationLog = {
      sender_id: rodrigo.id,
      sender_name: 'Rodri.GO',
      recipient_number: to_number,
      message_content: message,
      message_type: message_type,
      context_type: context_type,
      whapi_message_id: whapiResult.id,
      metadata: {
        ...metadata,
        sent_at: new Date().toISOString(),
        request_id: requestId
      },
      status: 'sent'
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
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})