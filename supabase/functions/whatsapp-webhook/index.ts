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

    // Verificar credenciais no início
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    console.log(`🔍 [${requestId}] Verificando credenciais:`)
    console.log(`   - Dify API Key: ${difyApiKey ? '✅ Configurada' : '❌ Ausente'}`)
    console.log(`   - Dify Base URL: ${difyBaseUrl}`)
    console.log(`   - WhatsApp Token: ${whatsappToken ? '✅ Configurado' : '❌ Ausente'}`)
    console.log(`   - Phone Number ID: ${phoneNumberId ? '✅ Configurado' : '❌ Ausente'}`)

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
              const result = await processMessages(supabaseClient, change.value, requestId, {
                difyApiKey,
                difyBaseUrl,
                whatsappToken,
                phoneNumberId
              })
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

async function processMessages(supabase: any, messageData: any, requestId: string, credentials: any) {
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

      // 3. Salvar mensagem do cliente
      console.log(`💾 [${requestId}] Salvando mensagem do cliente no banco...`)
      
      const clientMessageData = {
        conversation_id: conversation.id,
        sender_type: 'client',
        sender_name: clientName,
        content: messageContent,
        message_type: messageType,
        whatsapp_message_id: message.id,
        status: 'received',
        metadata: {}
      }
      
      console.log(`💾 [${requestId}] Dados da mensagem para salvar:`, JSON.stringify(clientMessageData, null, 2))

      const { data: savedMessage, error: msgError } = await supabase
        .from('messages')
        .insert(clientMessageData)
        .select()
        .single()

      if (msgError) {
        console.error(`❌ [${requestId}] Erro ao salvar mensagem:`, msgError)
        continue
      }

      console.log(`✅ [${requestId}] Mensagem do cliente salva com ID:`, savedMessage.id)

      // 4. Verificar credenciais antes de chamar Dify
      if (!credentials.difyApiKey) {
        console.error(`❌ [${requestId}] DIFY_API_KEY não configurada! Pulando chamada para Dify.`)
        
        // Criar notificação de erro
        await supabase
          .from('notifications')
          .insert({
            type: 'integration_error',
            title: 'Erro na Integração Dify',
            message: 'DIFY_API_KEY não está configurada. Configure nas variáveis de ambiente.',
            priority: 'high',
            context: {
              conversation_id: conversation.id,
              error: 'missing_dify_api_key'
            }
          })
        
        continue
      }

      // 5. Chamar Dify para gerar resposta
      console.log(`🤖 [${requestId}] Chamando Dify para gerar resposta...`)
      
      try {
        const difyResponse = await callDifyAPI(messageContent, conversation.dify_conversation_id, requestId, credentials)
        
        if (difyResponse && difyResponse.answer) {
          console.log(`✅ [${requestId}] Resposta do Dify recebida:`, difyResponse.answer)
          
          // 6. Salvar resposta do bot
          const botMessageData = {
            conversation_id: conversation.id,
            sender_type: 'bot',
            sender_name: 'Dify Bot',
            content: difyResponse.answer,
            message_type: 'text',
            status: 'sent',
            metadata: { dify_response: difyResponse }
          }

          const { data: botMessage, error: botMsgError } = await supabase
            .from('messages')
            .insert(botMessageData)
            .select()
            .single()

          if (botMsgError) {
            console.error(`❌ [${requestId}] Erro ao salvar mensagem do bot:`, botMsgError)
          } else {
            console.log(`✅ [${requestId}] Mensagem do bot salva com ID:`, botMessage.id)
          }

          // 7. Atualizar conversa com dify_conversation_id se necessário
          if (difyResponse.conversation_id && !conversation.dify_conversation_id) {
            const { error: updateConvError } = await supabase
              .from('conversations')
              .update({ 
                dify_conversation_id: difyResponse.conversation_id,
                updated_at: new Date().toISOString(),
                last_message_at: new Date().toISOString()
              })
              .eq('id', conversation.id)

            if (updateConvError) {
              console.error(`❌ [${requestId}] Erro ao atualizar conversa com dify_conversation_id:`, updateConvError)
            } else {
              console.log(`✅ [${requestId}] Conversa atualizada com dify_conversation_id:`, difyResponse.conversation_id)
            }
          } else {
            // Apenas atualizar timestamps
            const { error: updateError } = await supabase
              .from('conversations')
              .update({ 
                updated_at: new Date().toISOString(),
                last_message_at: new Date().toISOString()
              })
              .eq('id', conversation.id)

            if (updateError) {
              console.error(`❌ [${requestId}] Erro ao atualizar conversa:`, updateError)
            }
          }

          // 8. Enviar resposta via WhatsApp
          console.log(`📤 [${requestId}] Enviando resposta via WhatsApp...`)
          
          const whatsappResult = await sendWhatsAppMessage(clientPhone, difyResponse.answer, requestId, credentials)
          
          if (whatsappResult.success) {
            console.log(`✅ [${requestId}] Mensagem enviada via WhatsApp com sucesso`)
            
            // Atualizar status da mensagem do bot
            await supabase
              .from('messages')
              .update({ 
                status: 'sent',
                whatsapp_message_id: whatsappResult.message_id 
              })
              .eq('id', botMessage.id)
          } else {
            console.error(`❌ [${requestId}] Erro ao enviar mensagem via WhatsApp:`, whatsappResult.error)
            
            // Atualizar status da mensagem do bot como falhada
            await supabase
              .from('messages')
              .update({ status: 'failed' })
              .eq('id', botMessage.id)
          }
        } else {
          console.error(`❌ [${requestId}] Resposta inválida do Dify:`, difyResponse)
          
          // Criar notificação de erro
          await supabase
            .from('notifications')
            .insert({
              type: 'bot_error',
              title: 'Erro no Bot Dify',
              message: 'O bot não conseguiu gerar uma resposta válida.',
              priority: 'high',
              context: {
                conversation_id: conversation.id,
                message_content: messageContent,
                dify_response: difyResponse
              }
            })
        }
      } catch (difyError) {
        console.error(`❌ [${requestId}] Erro ao chamar Dify:`, difyError)
        
        // Criar notificação de erro crítico
        await supabase
          .from('notifications')
          .insert({
            type: 'critical_error',
            title: 'Erro Crítico na Integração Dify',
            message: `Falha na comunicação com Dify: ${difyError.message}`,
            priority: 'critical',
            context: {
              conversation_id: conversation.id,
              error: difyError.message,
              stack: difyError.stack
            }
          })
      }

      // 9. Criar notificação de nova mensagem
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

async function callDifyAPI(message: string, conversationId: string | null, requestId: string, credentials: any) {
  try {
    const { difyApiKey, difyBaseUrl } = credentials
    
    console.log(`🤖 [${requestId}] Configurações Dify:`)
    console.log(`   - Base URL: ${difyBaseUrl}`)
    console.log(`   - API Key: ${difyApiKey ? `${difyApiKey.substring(0, 10)}...` : 'AUSENTE'}`)
    console.log(`   - Conversation ID: ${conversationId || 'Nova conversa'}`)

    // CORREÇÃO: Remover duplicação de /v1 na URL
    const url = `${difyBaseUrl}/chat-messages`
    
    const requestBody: any = {
      inputs: {},
      query: message,
      response_mode: 'blocking',
      user: 'whatsapp-user'
    }

    // Se já temos um conversation_id do Dify, incluir na requisição
    if (conversationId) {
      requestBody.conversation_id = conversationId
    }

    console.log(`🤖 [${requestId}] Enviando para Dify:`, { url, body: requestBody })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`🤖 [${requestId}] Status da resposta Dify: ${response.status}`)
    console.log(`🤖 [${requestId}] Headers da resposta:`, Object.fromEntries(response.headers.entries()))

    // Verificar se a resposta é JSON antes de tentar fazer parse
    const contentType = response.headers.get('content-type')
    console.log(`🤖 [${requestId}] Content-Type da resposta: ${contentType}`)

    const responseText = await response.text()
    console.log(`🤖 [${requestId}] Resposta bruta do Dify (primeiros 500 chars):`, responseText.substring(0, 500))

    if (!response.ok) {
      console.error(`❌ [${requestId}] Erro HTTP ${response.status} na API do Dify`)
      console.error(`❌ [${requestId}] Resposta completa:`, responseText)
      return null
    }

    // Verificar se a resposta é HTML (indica erro)
    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
      console.error(`❌ [${requestId}] Dify retornou HTML em vez de JSON - URL pode estar incorreta`)
      console.error(`❌ [${requestId}] URL usada: ${url}`)
      console.error(`❌ [${requestId}] Resposta HTML:`, responseText.substring(0, 200))
      return null
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro ao fazer parse JSON da resposta:`, parseError)
      console.error(`❌ [${requestId}] Resposta que causou erro:`, responseText.substring(0, 200))
      return null
    }

    console.log(`🤖 [${requestId}] Resposta JSON do Dify:`, JSON.stringify(responseData, null, 2))

    if (!responseData.answer) {
      console.error(`❌ [${requestId}] Resposta do Dify sem campo 'answer':`, responseData)
      return null
    }

    console.log(`✅ [${requestId}] Resposta válida do Dify recebida`)
    return responseData
  } catch (error) {
    console.error(`❌ [${requestId}] Erro na requisição para Dify:`, error)
    console.error(`❌ [${requestId}] Stack trace:`, error.stack)
    return null
  }
}

async function sendWhatsAppMessage(to: string, message: string, requestId: string, credentials: any) {
  try {
    const { phoneNumberId, whatsappToken } = credentials
    
    console.log(`📤 [${requestId}] Configurações WhatsApp:`)
    console.log(`   - Phone Number ID: ${phoneNumberId}`)
    console.log(`   - Access Token: ${whatsappToken ? `${whatsappToken.substring(0, 20)}...` : 'AUSENTE'}`)
    
    if (!phoneNumberId || !whatsappToken) {
      console.error(`❌ [${requestId}] Credenciais do WhatsApp não configuradas`)
      return { success: false, error: 'Credenciais não configuradas' }
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    const messageData = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message
      }
    }

    console.log(`📤 [${requestId}] Enviando mensagem WhatsApp:`, { url, data: messageData })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()
    
    console.log(`📤 [${requestId}] Status resposta WhatsApp: ${response.status}`)
    console.log(`📤 [${requestId}] Resposta completa WhatsApp API:`, JSON.stringify(result, null, 2))

    if (response.ok && result.messages && result.messages[0]) {
      console.log(`✅ [${requestId}] Mensagem enviada com sucesso! ID: ${result.messages[0].id}`)
      return { 
        success: true, 
        message_id: result.messages[0].id 
      }
    } else {
      console.error(`❌ [${requestId}] Erro ao enviar mensagem WhatsApp:`, result)
      return { 
        success: false, 
        error: result.error?.message || 'Erro desconhecido' 
      }
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro na requisição WhatsApp:`, error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

console.log('🚀 WhatsApp Webhook Function com integração Dify CORRIGIDA iniciada!')
