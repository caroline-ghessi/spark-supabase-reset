import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('🚀 Whapi Webhook Function iniciada!')

// Headers CORS para permitir requisições do frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🌐 [${requestId}] ${req.method} ${req.url}`)

  // Tratar requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight request`)
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  // Extrair seller da URL
  const url = new URL(req.url)
  const sellerParam = url.searchParams.get('seller')
  console.log(`👤 [${requestId}] Seller param: ${sellerParam}`)

  if (req.method === 'GET') {
    // Verificação de webhook (se necessário)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === Deno.env.get('WHAPI_VERIFY_TOKEN')) {
      console.log(`✅ [${requestId}] Webhook verificado para seller: ${sellerParam}`)
      return new Response(challenge, { 
        status: 200,
        headers: corsHeaders
      })
    }

    return new Response('Forbidden', { 
      status: 403,
      headers: corsHeaders
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const body = await req.json()
    console.log(`📱 [${requestId}] Webhook recebido para seller ${sellerParam}:`, JSON.stringify(body, null, 2))

    // Processar dados do Whapi
    if (body.messages && body.messages.length > 0) {
      for (const message of body.messages) {
        await processWhapiMessage(requestId, message, sellerParam)
      }
      return new Response(JSON.stringify({ processed: 'messages', count: body.messages.length, seller: sellerParam }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (body.statuses && body.statuses.length > 0) {
      for (const status of body.statuses) {
        await processWhapiStatus(requestId, status, sellerParam)
      }
      return new Response(JSON.stringify({ processed: 'statuses', count: body.statuses.length, seller: sellerParam }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`⚠️ [${requestId}] Webhook sem dados reconhecidos para seller: ${sellerParam}`)
    return new Response(JSON.stringify({ processed: 'none', seller: sellerParam }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro para seller ${sellerParam}:`, error)
    return new Response(JSON.stringify({ error: error.message, seller: sellerParam }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function processWhapiMessage(requestId: string, message: any, sellerParam?: string) {
  console.log(`📨 [${requestId}] Processando mensagem para seller ${sellerParam}:`, message.id)

  try {
    // Validar dados básicos da mensagem
    if (!message.id) {
      console.error(`❌ [${requestId}] Mensagem sem ID`)
      return
    }

    // Determinar números de telefone corrigido
    let clientPhone = ''
    let sellerPhone = ''
    
    if (message.from_me) {
      // Mensagem enviada pelo vendedor
      sellerPhone = cleanPhone(message.from || '')
      clientPhone = cleanPhone(message.to || '')
    } else {
      // Mensagem recebida do cliente
      clientPhone = cleanPhone(message.from || '')
      sellerPhone = cleanPhone(message.to || '')
    }

    // Para mensagens de grupo, usar chat_id para determinar contexto
    if (message.chat_id && message.chat_id.includes('@g.us')) {
      console.log(`👥 [${requestId}] Mensagem de grupo detectada: ${message.chat_id}`)
      // Para grupos, o client_phone será o número de quem enviou
      if (!message.from_me) {
        clientPhone = cleanPhone(message.from || '')
        // Tentar determinar vendedor pelo parâmetro ou pelo contexto
        if (sellerParam) {
          const { data: seller } = await supabase
            .from('sellers')
            .select('*')
            .ilike('name', `%${sellerParam}%`)
            .single()
          
          if (seller) {
            sellerPhone = seller.whatsapp_number
          }
        }
      }
    }

    console.log(`🔍 [${requestId}] Telefones determinados - Cliente: ${clientPhone}, Vendedor: ${sellerPhone}`)

    // Validar se temos dados suficientes
    if (!clientPhone) {
      console.error(`❌ [${requestId}] Não foi possível determinar telefone do cliente`)
      return
    }

    // Buscar vendedor
    let seller = null
    
    // Primeiro tentar pelo número do vendedor (se temos)
    if (sellerPhone) {
      const { data: sellerByPhone } = await supabase
        .from('sellers')
        .select('*')
        .eq('whatsapp_number', sellerPhone)
        .single()
      
      if (sellerByPhone) {
        seller = sellerByPhone
        console.log(`✅ [${requestId}] Vendedor encontrado por número: ${seller.name}`)
      }
    }
    
    // Se não encontrou, tentar pelo parâmetro
    if (!seller && sellerParam) {
      const { data: sellerByParam } = await supabase
        .from('sellers')
        .select('*')
        .ilike('name', `%${sellerParam}%`)
        .single()

      if (sellerByParam) {
        seller = sellerByParam
        console.log(`✅ [${requestId}] Vendedor encontrado por parâmetro: ${seller.name}`)
      }
    }

    if (!seller) {
      console.log(`⚠️ [${requestId}] Vendedor não encontrado - Param: ${sellerParam}, Phone: ${sellerPhone}`)
      return
    }

    // Buscar ou criar conversa
    const conversationId = await findOrCreateConversation(requestId, {
      sellerId: seller.id,
      clientPhone: clientPhone,
      clientName: message.contact?.name || message.from_name || null,
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
      client_phone: clientPhone,
      message_type: message.type || 'text',
      text_content: message.body || message.text?.body || message.caption || null,
      caption: message.caption || null,
      sent_at: new Date((message.timestamp || Date.now() / 1000) * 1000).toISOString(),
      status: 'received',
      forwarded: message.forwarded || false,
      quoted_message_id: message.quoted?.id || null,
      whatsapp_context: message.context || {}
    }

    // Processar mídia se houver
    if (message.type && ['image', 'video', 'audio', 'document', 'sticker', 'voice'].includes(message.type)) {
      // Para mensagens de voz
      if (message.voice) {
        messageData.media_url = message.voice.link || null
        messageData.media_mime_type = message.voice.mime_type || null
        messageData.media_size = message.voice.file_size || null
        messageData.media_duration = message.voice.seconds || null
      }
      // Para outros tipos de mídia
      else if (message.image) {
        messageData.media_url = message.image.link || null
        messageData.media_mime_type = message.image.mime_type || null
        messageData.media_size = message.image.file_size || null
        messageData.thumbnail_url = message.image.preview || null
      }
      else if (message.video) {
        messageData.media_url = message.video.link || null
        messageData.media_mime_type = message.video.mime_type || null
        messageData.media_size = message.video.file_size || null
        messageData.media_duration = message.video.seconds || null
        messageData.thumbnail_url = message.video.preview || null
      }
      else if (message.audio) {
        messageData.media_url = message.audio.link || null
        messageData.media_mime_type = message.audio.mime_type || null
        messageData.media_size = message.audio.file_size || null
        messageData.media_duration = message.audio.seconds || null
      }
      else if (message.document) {
        messageData.media_url = message.document.link || null
        messageData.media_mime_type = message.document.mime_type || null
        messageData.media_size = message.document.file_size || null
      }
      else if (message.sticker) {
        messageData.media_url = message.sticker.link || null
        messageData.media_mime_type = message.sticker.mime_type || null
        messageData.media_size = message.sticker.file_size || null
      }
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
          message: `${message.contact?.name || message.from_name || clientPhone}: ${messageData.text_content?.substring(0, 100) || '[Mídia]'}`,
          context: {
            conversation_id: conversationId,
            seller_id: seller.id,
            message_id: savedMessage.id,
            seller_name: seller.name
          },
          priority: 'normal'
        })
    }

    console.log(`✅ [${requestId}] Mensagem processada para ${seller.name}: ${savedMessage.id}`)

  } catch (error) {
    console.error(`❌ [${requestId}] Erro ao processar mensagem:`, error)
  }
}

async function processWhapiStatus(requestId: string, status: any, sellerParam?: string) {
  console.log(`📱 [${requestId}] Processando status para seller ${sellerParam}:`, status.id, status.status)

  try {
    if (!status.id || !status.status) {
      console.error(`❌ [${requestId}] Status sem ID ou status válido`)
      return
    }

    const updateData: any = {}
    
    if (status.status === 'delivered') {
      updateData.delivered_at = new Date((status.timestamp || Date.now() / 1000) * 1000).toISOString()
      updateData.status = 'delivered'
    } else if (status.status === 'read') {
      updateData.read_at = new Date((status.timestamp || Date.now() / 1000) * 1000).toISOString()
      updateData.status = 'read'
    } else if (status.status === 'played') {
      // Para mensagens de áudio que foram reproduzidas
      updateData.read_at = new Date((status.timestamp || Date.now() / 1000) * 1000).toISOString()
      updateData.status = 'read'
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('vendor_whatsapp_messages')
        .update(updateData)
        .eq('whapi_message_id', status.id)

      if (error) {
        console.error(`❌ [${requestId}] Erro ao atualizar status:`, error)
      } else {
        console.log(`✅ [${requestId}] Status atualizado para mensagem ${status.id} (seller: ${sellerParam})`)
      }
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro ao processar status:`, error)
  }
}

async function findOrCreateConversation(requestId: string, data: any) {
  const clientPhone = data.clientPhone
  
  if (!clientPhone) {
    throw new Error('Client phone is required')
  }

  // Buscar conversa existente
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('client_phone', clientPhone)
    .eq('assigned_seller_id', data.sellerId)
    .eq('status', 'manual')
    .single()

  if (existing) {
    console.log(`🔍 [${requestId}] Conversa existente encontrada: ${existing.id}`)
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

function cleanPhone(phone: string): string {
  if (!phone) return ''
  // Remove tudo que não é número e mantém apenas os dígitos
  const cleaned = phone.replace(/\D/g, '')
  console.log(`📞 Telefone limpo: ${phone} -> ${cleaned}`)
  return cleaned
}
