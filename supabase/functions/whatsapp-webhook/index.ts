
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🌐 [${requestId}] ${req.method} ${req.url}`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight handled`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // GET - Verificação do webhook
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log(`🔍 [${requestId}] Verificação webhook:`, { mode, token, challenge })

      if (mode === 'subscribe' && challenge) {
        console.log(`✅ [${requestId}] Webhook verificado com sucesso!`)
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        })
      }

      console.log(`❌ [${requestId}] Parâmetros de verificação inválidos`)
      return new Response('Missing parameters', {
        status: 400,
        headers: corsHeaders
      })
    }

    // POST - Processar mensagens
    if (req.method === 'POST') {
      let body;
      try {
        body = await req.json()
        console.log(`📱 [${requestId}] Webhook recebido:`, JSON.stringify(body, null, 2))
      } catch (error) {
        console.error(`❌ [${requestId}] Erro ao parsear JSON:`, error)
        return new Response('Invalid JSON', {
          status: 400,
          headers: corsHeaders
        })
      }

      if (body.object === 'whatsapp_business_account') {
        console.log(`📊 [${requestId}] Processando ${body.entry?.length || 0} entries`)
        
        for (const entry of body.entry || []) {
          console.log(`🔍 [${requestId}] Entry ID: ${entry.id}, Changes: ${entry.changes?.length || 0}`)
          
          for (const change of entry.changes || []) {
            console.log(`🔄 [${requestId}] Change field: ${change.field}`)
            
            if (change.field === 'messages') {
              const result = await processMessages(supabaseClient, change.value, requestId)
              console.log(`📝 [${requestId}] Resultado processamento:`, result)
            } else {
              console.log(`ℹ️ [${requestId}] Change field ignorado: ${change.field}`)
            }
          }
        }
      } else {
        console.log(`⚠️ [${requestId}] Object type não suportado: ${body.object}`)
      }

      console.log(`✅ [${requestId}] Webhook processado com sucesso`)
      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    console.log(`❌ [${requestId}] Método não permitido: ${req.method}`)
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no webhook:`, error)
    console.error(`❌ [${requestId}] Stack trace:`, error.stack)
    return new Response(JSON.stringify({ 
      error: error.message,
      requestId: requestId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function processMessages(supabase: any, messageData: any, requestId: string) {
  try {
    console.log(`📊 [${requestId}] Dados recebidos para processamento:`, JSON.stringify(messageData, null, 2))
    
    const { messages, contacts, statuses } = messageData

    // Processar status updates primeiro
    if (statuses && statuses.length > 0) {
      console.log(`📱 [${requestId}] Processando ${statuses.length} status updates`)
      for (const status of statuses) {
        console.log(`📱 [${requestId}] Status update:`, {
          id: status.id,
          status: status.status,
          recipient_id: status.recipient_id
        })
        
        // Atualizar status da mensagem no banco
        const { error: updateError } = await supabase
          .from('messages')
          .update({ status: status.status })
          .eq('whatsapp_message_id', status.id)
        
        if (updateError) {
          console.error(`❌ [${requestId}] Erro ao atualizar status:`, updateError)
        } else {
          console.log(`✅ [${requestId}] Status atualizado para mensagem ${status.id}`)
        }
      }
      return { processed: 'status_updates', count: statuses.length }
    }

    if (!messages || messages.length === 0) {
      console.log(`⚠️ [${requestId}] Nenhuma mensagem no payload`)
      return { processed: 'none', reason: 'no_messages' }
    }

    console.log(`📝 [${requestId}] Processando ${messages.length} mensagens`)

    for (const message of messages) {
      const clientPhone = message.from
      const clientName = contacts?.[0]?.profile?.name || contacts?.[0]?.wa_id || 'Cliente'
      
      console.log(`👤 [${requestId}] Processando mensagem de ${clientName} (${clientPhone})`)
      console.log(`📱 [${requestId}] Dados da mensagem:`, JSON.stringify(message, null, 2))

      // 1. Buscar ou criar conversa
      console.log(`🔍 [${requestId}] Buscando conversa para ${clientPhone}`)
      
      let { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_phone', clientPhone)
        .neq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (convError && convError.code !== 'PGRST116') {
        console.error(`❌ [${requestId}] Erro ao buscar conversa:`, convError)
        continue
      }

      if (!conversation) {
        console.log(`✨ [${requestId}] Criando nova conversa para ${clientPhone}`)
        
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_phone: clientPhone,
            client_name: clientName,
            status: 'bot',
            lead_temperature: 'cold',
            source: 'whatsapp',
            priority: 'normal',
            metadata: {}
          })
          .select()
          .single()

        if (createError) {
          console.error(`❌ [${requestId}] Erro ao criar conversa:`, createError)
          continue
        }

        conversation = newConv
        console.log(`✅ [${requestId}] Nova conversa criada:`, conversation.id)
      } else {
        console.log(`✅ [${requestId}] Conversa encontrada:`, conversation.id)
      }

      // 2. Processar conteúdo da mensagem
      let messageContent = 'Mensagem não suportada'
      let messageType = 'text'
      
      if (message.text?.body) {
        messageContent = message.text.body
        messageType = 'text'
      } else if (message.image) {
        messageContent = message.image.caption || 'Imagem enviada'
        messageType = 'image'
      } else if (message.document) {
        messageContent = message.document.caption || `Documento: ${message.document.filename || 'arquivo'}`
        messageType = 'document'
      } else if (message.audio) {
        messageContent = 'Áudio enviado'
        messageType = 'audio'
      } else if (message.video) {
        messageContent = message.video.caption || 'Vídeo enviado'
        messageType = 'video'
      }
      
      console.log(`📝 [${requestId}] Conteúdo processado: "${messageContent}" (tipo: ${messageType})`)

      // 3. Salvar mensagem
      console.log(`💾 [${requestId}] Salvando mensagem no banco...`)
      
      const messageData = {
        conversation_id: conversation.id,
        sender_type: 'client',
        sender_name: clientName,
        content: messageContent,
        message_type: messageType,
        whatsapp_message_id: message.id,
        status: 'received',
        metadata: {}
      }
      
      console.log(`💾 [${requestId}] Dados da mensagem para salvar:`, JSON.stringify(messageData, null, 2))

      const { data: savedMessage, error: msgError } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (msgError) {
        console.error(`❌ [${requestId}] Erro ao salvar mensagem:`, msgError)
        console.error(`❌ [${requestId}] Dados que causaram erro:`, JSON.stringify(messageData, null, 2))
        continue
      }

      console.log(`✅ [${requestId}] Mensagem salva com ID:`, savedMessage.id)

      // 4. Atualizar conversa
      console.log(`🔄 [${requestId}] Atualizando conversa...`)
      
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversation.id)

      if (updateError) {
        console.error(`❌ [${requestId}] Erro ao atualizar conversa:`, updateError)
      } else {
        console.log(`✅ [${requestId}] Conversa atualizada`)
      }

      // 5. Criar notificação
      console.log(`🔔 [${requestId}] Criando notificação...`)
      
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          type: 'new_message',
          title: 'Nova Mensagem',
          message: `${clientName}: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
          priority: 'normal',
          context: {
            conversation_id: conversation.id,
            client_name: clientName,
            client_phone: clientPhone,
            message_id: savedMessage.id
          },
          metadata: {}
        })

      if (notifError) {
        console.error(`❌ [${requestId}] Erro ao criar notificação:`, notifError)
      } else {
        console.log(`✅ [${requestId}] Notificação criada`)
      }
    }

    return { processed: 'messages', count: messages.length }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no processamento:`, error)
    console.error(`❌ [${requestId}] Stack trace:`, error.stack)
    return { processed: 'error', error: error.message }
  }
}

console.log('🚀 WhatsApp Webhook Function iniciada com logging detalhado!')
