
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🌐 ${req.method} Request received`)
    console.log(`📋 URL: ${req.url}`)

    // GET - Verificação do webhook pela Meta
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('🔍 Webhook verification:', { mode, token, challenge })

      if (mode === 'subscribe' && token === Deno.env.get('WEBHOOK_VERIFY_TOKEN')) {
        console.log('✅ Webhook verified successfully!')
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        })
      } else {
        console.log('❌ Webhook verification failed')
        return new Response('Forbidden', {
          status: 403,
          headers: corsHeaders
        })
      }
    }

    // POST - Processar mensagens recebidas
    if (req.method === 'POST') {
      const body = await req.json()
      console.log('📱 Webhook payload:', JSON.stringify(body, null, 2))

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              console.log('💬 Processing messages:', change.value)
              await processIncomingMessage(supabaseClient, change.value)
            }
          }
        }
      }

      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    // Método não suportado
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ Error in webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Função para processar mensagens recebidas
async function processIncomingMessage(supabase: any, messageData: any) {
  try {
    const { messages, contacts, metadata } = messageData

    if (!messages || messages.length === 0) {
      console.log('⚠️ No messages in payload')
      return
    }

    for (const message of messages) {
      // Ignorar mensagens enviadas por nós
      if (message.from === metadata?.phone_number_id) {
        console.log('⏭️ Skipping outbound message')
        continue
      }

      const clientPhone = message.from
      const clientName = contacts?.[0]?.profile?.name || 'Cliente'
      const messageContent = extractMessageContent(message)

      console.log(`👤 Processing message from ${clientName} (${clientPhone})`)

      // 1. Buscar ou criar conversa
      const conversation = await findOrCreateConversation(supabase, clientPhone, clientName)
      console.log(`💬 Conversation ID: ${conversation.id}`)

      // 2. Salvar mensagem no banco
      await saveMessageToDatabase(supabase, {
        conversation_id: conversation.id,
        sender_type: 'client',
        sender_name: clientName,
        content: messageContent.text,
        message_type: messageContent.type,
        file_url: messageContent.fileUrl,
        file_name: messageContent.fileName,
        whatsapp_message_id: message.id,
        created_at: new Date(message.timestamp * 1000).toISOString()
      })

      // 3. Atualizar último timestamp da conversa
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id)

      // 4. Processar com Bot Dify (se conversa estiver em modo bot)
      if (conversation.status === 'bot') {
        await processBotResponse(supabase, conversation, messageContent)
      }

      // 5. Criar notificação em tempo real
      await createNotification(supabase, {
        type: 'new_message',
        title: 'Nova Mensagem Recebida',
        message: `${clientName}: ${messageContent.text.substring(0, 50)}...`,
        priority: conversation.lead_temperature === 'hot' ? 'critical' : 'normal',
        context: {
          conversation_id: conversation.id,
          client_name: clientName,
          client_phone: clientPhone,
          message_preview: messageContent.text.substring(0, 100)
        }
      })
    }

  } catch (error) {
    console.error('❌ Error processing message:', error)
    throw error
  }
}

// Extrair conteúdo da mensagem
function extractMessageContent(message: any) {
  switch (message.type) {
    case 'text':
      return {
        text: message.text?.body || '',
        type: 'text',
        fileUrl: null,
        fileName: null
      }
    
    case 'image':
      return {
        text: message.image?.caption || '',
        type: 'image',
        fileUrl: message.image?.id,
        fileName: `image_${message.id}.jpg`
      }
    
    case 'document':
      return {
        text: message.document?.caption || '',
        type: 'document',
        fileUrl: message.document?.id,
        fileName: message.document?.filename || `document_${message.id}`
      }
    
    case 'audio':
      return {
        text: '',
        type: 'audio',
        fileUrl: message.audio?.id,
        fileName: `audio_${message.id}.ogg`
      }
    
    case 'video':
      return {
        text: message.video?.caption || '',
        type: 'video',
        fileUrl: message.video?.id,
        fileName: `video_${message.id}.mp4`
      }
    
    default:
      return {
        text: 'Mensagem não suportada',
        type: 'text',
        fileUrl: null,
        fileName: null
      }
  }
}

// Buscar ou criar conversa
async function findOrCreateConversation(supabase: any, clientPhone: string, clientName: string) {
  try {
    // Buscar conversa existente
    const { data: existingConversation, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .eq('client_phone', clientPhone)
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (findError) {
      console.error('❌ Error finding conversation:', findError)
    }

    if (existingConversation) {
      console.log('📋 Found existing conversation')
      return existingConversation
    }

    // Criar nova conversa
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        client_phone: clientPhone,
        client_name: clientName,
        status: 'bot',
        lead_temperature: 'cold',
        source: 'whatsapp',
        priority: 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {}
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating conversation:', error)
      throw error
    }

    console.log('✨ Created new conversation')
    return newConversation

  } catch (error) {
    console.error('❌ Error in conversation management:', error)
    throw error
  }
}

// Salvar mensagem no banco
async function saveMessageToDatabase(supabase: any, messageData: any) {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        status: 'sent',
        metadata: {}
      })

    if (error) {
      console.error('❌ Error saving message:', error)
      throw error
    }
    console.log('💾 Message saved to database')

  } catch (error) {
    console.error('❌ Error saving message:', error)
    throw error
  }
}

// Processar resposta do Bot Dify
async function processBotResponse(supabase: any, conversation: any, messageContent: any) {
  try {
    console.log('🤖 Processing with Dify bot')

    // Enviar para Dify
    const difyResponse = await sendToDify({
      query: messageContent.text,
      user: conversation.client_phone,
      conversation_id: conversation.dify_conversation_id
    })

    if (difyResponse.success && difyResponse.answer) {
      console.log('✅ Bot generated response')
      
      // Enviar resposta via WhatsApp
      await sendWhatsAppMessage({
        to: conversation.client_phone,
        text: difyResponse.answer
      })

      // Salvar resposta do bot no banco
      await saveMessageToDatabase(supabase, {
        conversation_id: conversation.id,
        sender_type: 'bot',
        sender_name: 'Assistente IA',
        content: difyResponse.answer,
        message_type: 'text',
        created_at: new Date().toISOString()
      })

      // Atualizar conversa com ID do Dify
      await supabase
        .from('conversations')
        .update({
          dify_conversation_id: difyResponse.conversation_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id)

    } else {
      console.log('⚠️ Bot failed, escalating to human')
      await escalateToHuman(supabase, conversation)
    }

  } catch (error) {
    console.error('❌ Error in bot processing:', error)
    await escalateToHuman(supabase, conversation)
  }
}

// Enviar mensagem para Dify
async function sendToDify({ query, user, conversation_id }: any) {
  try {
    const response = await fetch(`${Deno.env.get('DIFY_BASE_URL')}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DIFY_API_KEY')}`,
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
    console.error('❌ Dify API error:', error)
    return { success: false, error: error.message }
  }
}

// Enviar mensagem via WhatsApp
async function sendWhatsAppMessage({ to, text }: any) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('WHATSAPP_ACCESS_TOKEN')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      })
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('📤 WhatsApp message sent successfully')
      return result
    } else {
      throw new Error(result.error?.message || 'Failed to send message')
    }

  } catch (error) {
    console.error('❌ WhatsApp send error:', error)
    throw error
  }
}

// Escalar para humano
async function escalateToHuman(supabase: any, conversation: any) {
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
      context: {
        conversation_id: conversation.id,
        client_phone: conversation.client_phone,
        client_name: conversation.client_name,
        reason: 'Bot não conseguiu processar mensagem'
      }
    })

    console.log('🚨 Escalated to human')

  } catch (error) {
    console.error('❌ Error in escalation:', error)
  }
}

// Criar notificação
async function createNotification(supabase: any, notificationData: any) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        created_at: new Date().toISOString(),
        metadata: {}
      })

    if (error) {
      console.error('❌ Error creating notification:', error)
      throw error
    }
    console.log('🔔 Notification created')

  } catch (error) {
    console.error('❌ Error creating notification:', error)
  }
}
