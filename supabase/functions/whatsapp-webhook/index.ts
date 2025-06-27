
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; caption?: string };
  document?: { id: string; filename: string; caption?: string };
  audio?: { id: string };
  video?: { id: string; caption?: string };
}

interface WebhookEntry {
  changes: Array<{
    field: string;
    value: {
      messages?: WhatsAppMessage[];
      contacts?: Array<{ profile?: { name: string } }>;
      metadata: { phone_number_id: string };
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Verificação do webhook (GET)
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      if (mode === 'subscribe' && token === Deno.env.get('WEBHOOK_VERIFY_TOKEN')) {
        console.log('Webhook verificado com sucesso!')
        return new Response(challenge, { status: 200 })
      }

      return new Response('Forbidden', { status: 403 })
    }

    // Processar mensagens recebidas (POST)
    if (req.method === 'POST') {
      const body = await req.json()

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry as WebhookEntry[]) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value.messages) {
              await processIncomingMessages(supabase, change.value)
            }
          }
        }
      }

      return new Response('EVENT_RECEIVED', { status: 200, headers: corsHeaders })
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})

async function processIncomingMessages(supabase: any, messageData: any) {
  const { messages, contacts, metadata } = messageData

  if (!messages || messages.length === 0) return

  for (const message of messages) {
    // Ignorar mensagens enviadas pelo próprio sistema
    if (message.from === metadata.phone_number_id) continue

    const clientPhone = message.from
    const clientName = contacts?.[0]?.profile?.name || 'Cliente'
    const messageContent = extractMessageContent(message)

    try {
      // 1. Buscar ou criar conversa
      const conversation = await findOrCreateConversation(supabase, clientPhone, clientName)

      // 2. Salvar mensagem no banco
      await saveMessageToDatabase(supabase, {
        conversation_id: conversation.id,
        sender_type: 'client',
        sender_name: clientName,
        content: messageContent.text,
        message_type: messageContent.type,
        file_url: messageContent.fileUrl,
        whatsapp_message_id: message.id,
        created_at: new Date(parseInt(message.timestamp) * 1000).toISOString()
      })

      // 3. Processar com Bot Dify se a conversa estiver no modo bot
      if (conversation.status === 'bot') {
        await processBotResponse(supabase, conversation, messageContent)
      }

      // 4. Criar notificação
      await createNotification(supabase, {
        type: 'new_message',
        title: 'Nova Mensagem Recebida',
        message: `${clientName}: ${messageContent.text.substring(0, 50)}...`,
        priority: conversation.lead_temperature === 'hot' ? 'high' : 'normal',
        conversation_id: conversation.id,
        context: {
          client_phone: clientPhone,
          client_name: clientName,
          message_preview: messageContent.text.substring(0, 100)
        }
      })

    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
    }
  }
}

function extractMessageContent(message: WhatsAppMessage) {
  switch (message.type) {
    case 'text':
      return {
        text: message.text?.body || '',
        type: 'text',
        fileUrl: null
      }
    
    case 'image':
      return {
        text: message.image?.caption || '',
        type: 'image',
        fileUrl: message.image?.id
      }
    
    case 'document':
      return {
        text: message.document?.caption || '',
        type: 'document',
        fileUrl: message.document?.id
      }
    
    case 'audio':
      return {
        text: '',
        type: 'audio',
        fileUrl: message.audio?.id
      }
    
    case 'video':
      return {
        text: message.video?.caption || '',
        type: 'video',
        fileUrl: message.video?.id
      }
    
    default:
      return {
        text: 'Mensagem não suportada',
        type: 'text',
        fileUrl: null
      }
  }
}

async function findOrCreateConversation(supabase: any, clientPhone: string, clientName: string) {
  // Buscar conversa existente ativa
  let { data: conversation, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('client_phone', clientPhone)
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (conversation && !error) {
    return conversation
  }

  // Buscar ou criar cliente
  await findOrCreateClient(supabase, clientPhone, clientName)

  // Criar nova conversa
  const { data: newConversation, error: createError } = await supabase
    .from('conversations')
    .insert({
      client_phone: clientPhone,
      client_name: clientName,
      status: 'bot',
      lead_temperature: 'cold',
      source: 'whatsapp'
    })
    .select()
    .single()

  if (createError) throw createError

  return newConversation
}

async function findOrCreateClient(supabase: any, phone: string, name: string) {
  let { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .single()

  if (client && !error) {
    // Atualizar nome se necessário
    if (client.name !== name && name !== 'Cliente') {
      await supabase
        .from('clients')
        .update({ name: name, updated_at: new Date().toISOString() })
        .eq('id', client.id)
    }
    return client
  }

  // Criar novo cliente
  const { data: newClient, error: createError } = await supabase
    .from('clients')
    .insert({
      phone: phone,
      name: name,
      source: 'whatsapp'
    })
    .select()
    .single()

  if (createError) throw createError
  return newClient
}

async function saveMessageToDatabase(supabase: any, messageData: any) {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)

  if (error) throw error
  return data
}

async function processBotResponse(supabase: any, conversation: any, messageContent: any) {
  try {
    // Enviar para Dify
    const difyResponse = await sendToDify({
      query: messageContent.text,
      user: conversation.client_phone,
      conversation_id: conversation.dify_conversation_id
    })

    if (difyResponse.success && difyResponse.answer) {
      // Bot conseguiu responder - enviar mensagem
      await sendWhatsAppMessage({
        to: conversation.client_phone,
        text: difyResponse.answer,
        conversation_id: conversation.id
      })

      // Salvar resposta do bot
      await saveMessageToDatabase(supabase, {
        conversation_id: conversation.id,
        sender_type: 'bot',
        sender_name: 'Assistente IA',
        content: difyResponse.answer,
        message_type: 'text'
      })

      // Atualizar conversa
      await supabase
        .from('conversations')
        .update({
          dify_conversation_id: difyResponse.conversation_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id)

    } else {
      // Bot falhou - escalar para humano
      await escalateToHuman(supabase, conversation, 'Bot não conseguiu processar a mensagem')
    }

  } catch (error) {
    console.error('Erro no processamento do bot:', error)
    await escalateToHuman(supabase, conversation, 'Erro técnico no bot')
  }
}

async function sendToDify({ query, user, conversation_id }: any) {
  try {
    const baseUrl = Deno.env.get('DIFY_BASE_URL')
    const apiKey = Deno.env.get('DIFY_API_KEY')

    const response = await fetch(`${baseUrl}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        user: user,
        conversation_id: conversation_id || ''
      })
    })

    const data = await response.json()

    return {
      success: response.ok,
      answer: data.answer,
      conversation_id: data.conversation_id,
      error: response.ok ? null : data.message
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function sendWhatsAppMessage({ to, text, conversation_id }: any) {
  try {
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    const messageData = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: text
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()

    if (response.ok) {
      return { success: true, message_id: result.messages[0].id }
    } else {
      throw new Error(result.error?.message || 'Erro ao enviar mensagem')
    }

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

async function escalateToHuman(supabase: any, conversation: any, reason: string) {
  try {
    // Atualizar status da conversa
    await supabase
      .from('conversations')
      .update({
        status: 'waiting',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id)

    // Criar notificação crítica
    await createNotification(supabase, {
      type: 'bot_failed',
      title: 'Bot Falhou - Intervenção Necessária',
      message: `Cliente ${conversation.client_name} precisa de atendimento humano`,
      priority: 'critical',
      conversation_id: conversation.id,
      context: {
        client_phone: conversation.client_phone,
        client_name: conversation.client_name,
        reason: reason,
        escalated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro na escalação:', error)
  }
}

async function createNotification(supabase: any, notificationData: any) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)

  if (error) {
    console.error('Erro ao criar notificação:', error)
  }

  return data
}
