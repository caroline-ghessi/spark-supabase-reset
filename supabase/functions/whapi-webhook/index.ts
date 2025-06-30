
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('🚀 Whapi Webhook Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🌐 [${requestId}] ${req.method} ${req.url}`)

  if (req.method === 'GET') {
    // Verificação de webhook (se necessário)
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === Deno.env.get('WHAPI_VERIFY_TOKEN')) {
      console.log(`✅ [${requestId}] Webhook verificado`)
      return new Response(challenge, { status: 200 })
    }

    return new Response('Forbidden', { status: 403 })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    console.log(`📱 [${requestId}] Webhook recebido:`, JSON.stringify(body, null, 2))

    // Processar dados do Whapi
    if (body.messages && body.messages.length > 0) {
      for (const message of body.messages) {
        await processWhapiMessage(requestId, message)
      }
      return new Response(JSON.stringify({ processed: 'messages', count: body.messages.length }))
    }

    if (body.statuses && body.statuses.length > 0) {
      for (const status of body.statuses) {
        await processWhapiStatus(requestId, status)
      }
      return new Response(JSON.stringify({ processed: 'statuses', count: body.statuses.length }))
    }

    console.log(`⚠️ [${requestId}] Webhook sem dados reconhecidos`)
    return new Response(JSON.stringify({ processed: 'none' }))

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

async function processWhapiMessage(requestId: string, message: any) {
  console.log(`📨 [${requestId}] Processando mensagem:`, message.id)

  try {
    // Encontrar vendedor pelo número de telefone
    const phoneNumber = message.from_me ? message.to : message.from
    const { data: seller } = await supabase
      .from('sellers')
      .select('*')
      .eq('whatsapp_number', phoneNumber.replace(/\D/g, ''))
      .single()

    if (!seller) {
      console.log(`⚠️ [${requestId}] Vendedor não encontrado para número: ${phoneNumber}`)
      return
    }

    // Buscar ou criar conversa
    const conversationId = await findOrCreateConversation(requestId, {
      sellerId: seller.id,
      clientPhone: message.from_me ? message.to : message.from,
      clientName: message.contact?.name || null,
      message
    })

    // Preparar dados da mensagem
    const messageData = {
      whapi_message_id: message.id,
      seller_id: seller.id,
      conversation_id: conversationId,
      from_number: message.from || '',
      to_number: message.to || '',
      is_from_seller: message.from_me || false,
      client_phone: message.from_me ? message.to : message.from,
      message_type: message.type || 'text',
      text_content: message.body || message.text || null,
      caption: message.caption || null,
      sent_at: new Date(message.timestamp * 1000).toISOString(),
      status: 'received',
      forwarded: message.forwarded || false,
      quoted_message_id: message.quoted?.id || null,
      whatsapp_context: message.context || {}
    }

    // Processar mídia se houver
    if (message.type && ['image', 'video', 'audio', 'document', 'sticker'].includes(message.type)) {
      if (message.media_url) messageData.media_url = message.media_url
      if (message.mime_type) messageData.media_mime_type = message.mime_type
      if (message.file_size) messageData.media_size = message.file_size
      if (message.duration) messageData.media_duration = message.duration
      if (message.preview) messageData.thumbnail_url = message.preview
    }

    // Salvar mensagem
    const { data: savedMessage, error } = await supabase
      .from('vendor_whatsapp_messages')
      .upsert(messageData, { onConflict: 'whapi_message_id' })
      .select()
      .single()

    if (error) {
      console.error(`❌ [${requestId}] Erro ao salvar mensagem:`, error)
      return
    }

    // Atualizar conversa
    await supabase
      .from('conversations')
      .update({
        last_message_at: messageData.sent_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    // Criar notificação se for mensagem do cliente
    if (!message.from_me) {
      await supabase
        .from('notifications')
        .insert({
          type: 'new_vendor_message',
          title: 'Nova mensagem do cliente',
          message: `${message.contact?.name || message.from}: ${messageData.text_content?.substring(0, 100) || '[Mídia]'}`,
          context: {
            conversation_id: conversationId,
            seller_id: seller.id,
            message_id: savedMessage.id
          },
          priority: 'normal'
        })
    }

    console.log(`✅ [${requestId}] Mensagem processada: ${savedMessage.id}`)

  } catch (error) {
    console.error(`❌ [${requestId}] Erro ao processar mensagem:`, error)
  }
}

async function processWhapiStatus(requestId: string, status: any) {
  console.log(`📱 [${requestId}] Processando status:`, status.id, status.status)

  try {
    const updateData: any = {}
    
    if (status.status === 'delivered') {
      updateData.delivered_at = new Date(status.timestamp * 1000).toISOString()
      updateData.status = 'delivered'
    } else if (status.status === 'read') {
      updateData.read_at = new Date(status.timestamp * 1000).toISOString()
      updateData.status = 'read'
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('vendor_whatsapp_messages')
        .update(updateData)
        .eq('whapi_message_id', status.id)

      console.log(`✅ [${requestId}] Status atualizado para mensagem ${status.id}`)
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro ao processar status:`, error)
  }
}

async function findOrCreateConversation(requestId: string, data: any) {
  const clientPhone = data.clientPhone.replace(/\D/g, '')
  
  // Buscar conversa existente
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('client_phone', clientPhone)
    .eq('assigned_seller_id', data.sellerId)
    .eq('status', 'manual')
    .single()

  if (existing) {
    return existing.id
  }

  // Criar nova conversa
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      client_phone: clientPhone,
      client_name: data.clientName,
      status: 'manual',
      lead_temperature: 'warm',
      assigned_seller_id: data.sellerId,
      source: 'whapi',
      created_at: new Date().toISOString()
    })
    .select('id')
    .single()

  if (error) {
    console.error(`❌ [${requestId}] Erro ao criar conversa:`, error)
    throw error
  }

  console.log(`✅ [${requestId}] Conversa criada: ${newConversation.id}`)
  return newConversation.id
}
