
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('🚀 Whapi Send Message Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`📤 [${requestId}] ${req.method} ${req.url}`)

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { seller_id, to_number, message, message_type = 'text', media_url } = await req.json()

    if (!seller_id || !to_number || !message) {
      throw new Error('Parâmetros obrigatórios: seller_id, to_number, message')
    }

    // Buscar dados do vendedor
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', seller_id)
      .single()

    if (sellerError || !seller) {
      throw new Error('Vendedor não encontrado')
    }

    if (!seller.whapi_token) {
      throw new Error('Token Whapi não configurado para este vendedor')
    }

    console.log(`📤 [${requestId}] Enviando mensagem via Whapi para: ${to_number}`)

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
        'Authorization': `Bearer ${seller.whapi_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(whapiData)
    })

    if (!whapiResponse.ok) {
      const errorText = await whapiResponse.text()
      throw new Error(`Erro Whapi: ${whapiResponse.status} - ${errorText}`)
    }

    const whapiResult = await whapiResponse.json()
    console.log(`✅ [${requestId}] Mensagem enviada via Whapi:`, whapiResult.id)

    // Buscar conversa
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_phone', to_number.replace(/\D/g, ''))
      .eq('assigned_seller_id', seller_id)
      .single()

    // Salvar mensagem na base
    const messageData = {
      whapi_message_id: whapiResult.id,
      seller_id: seller_id,
      conversation_id: conversation?.id || null,
      from_number: seller.whatsapp_number,
      to_number: to_number,
      is_from_seller: true,
      client_phone: to_number,
      message_type: message_type,
      text_content: message,
      sent_at: new Date().toISOString(),
      status: 'sent'
    }

    if (media_url) {
      messageData.media_url = media_url
    }

    const { data: savedMessage, error: saveError } = await supabase
      .from('vendor_whatsapp_messages')
      .insert(messageData)
      .select()
      .single()

    if (saveError) {
      console.error(`❌ [${requestId}] Erro ao salvar mensagem:`, saveError)
    } else {
      console.log(`✅ [${requestId}] Mensagem salva: ${savedMessage.id}`)
    }

    return new Response(JSON.stringify({
      success: true,
      whapi_message_id: whapiResult.id,
      saved_message_id: savedMessage?.id
    }))

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
