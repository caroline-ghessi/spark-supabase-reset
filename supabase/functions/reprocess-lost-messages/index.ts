import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🔄 [${requestId}] Reprocessamento de mensagens perdidas iniciado`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar credenciais
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    if (!difyApiKey || !whatsappToken || !phoneNumberId) {
      throw new Error('Credenciais não configuradas completamente')
    }

    // Buscar conversas sem dify_conversation_id das últimas 24h
    console.log(`🔍 [${requestId}] Buscando conversas problemáticas...`)
    
    const { data: problemConversations, error: convError } = await supabaseClient
      .from('conversations')
      .select('*')
      .is('dify_conversation_id', null)
      .eq('source', 'whatsapp')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (convError) {
      throw new Error(`Erro ao buscar conversas: ${convError.message}`)
    }

    console.log(`📊 [${requestId}] Encontradas ${problemConversations?.length || 0} conversas para reprocessar`)

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const conversation of problemConversations || []) {
      try {
        processedCount++;
        console.log(`🔄 [${requestId}] Processando conversa ${processedCount}/${problemConversations?.length}: ${conversation.client_name}`)

        // Buscar mensagens do cliente para esta conversa
        const { data: clientMessages, error: msgError } = await supabaseClient
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .eq('sender_type', 'client')
          .order('created_at', { ascending: true })
          .limit(1)

        if (msgError) {
          console.error(`❌ [${requestId}] Erro ao buscar mensagens:`, msgError)
          errorCount++;
          continue;
        }

        if (!clientMessages || clientMessages.length === 0) {
          console.log(`⚠️ [${requestId}] Nenhuma mensagem encontrada para ${conversation.client_name}`)
          continue;
        }

        const firstMessage = clientMessages[0];
        console.log(`📨 [${requestId}] Primeira mensagem: "${firstMessage.content?.substring(0, 50)}..."`)

        // Chamar Dify para gerar resposta
        const difyResponse = await callDifyAPI(firstMessage.content || 'Olá', null, requestId, {
          difyApiKey,
          difyBaseUrl,
          whatsappToken,
          phoneNumberId
        });

        if (difyResponse && difyResponse.answer) {
          console.log(`✅ [${requestId}] Resposta do Dify recebida para ${conversation.client_name}`)
          
          // Salvar resposta do bot
          const { error: botMsgError } = await supabaseClient
            .from('messages')
            .insert({
              conversation_id: conversation.id,
              sender_type: 'bot',
              sender_name: 'Dify Bot',
              content: difyResponse.answer,
              message_type: 'text',
              status: 'sent',
              metadata: { 
                dify_response: difyResponse,
                reprocessed: true,
                reprocessed_at: new Date().toISOString()
              }
            })

          if (botMsgError) {
            console.error(`❌ [${requestId}] Erro ao salvar resposta do bot:`, botMsgError)
            errorCount++;
            continue;
          }

          // Atualizar conversa com dify_conversation_id
          const { error: updateError } = await supabaseClient
            .from('conversations')
            .update({ 
              dify_conversation_id: difyResponse.conversation_id,
              updated_at: new Date().toISOString(),
              last_message_at: new Date().toISOString()
            })
            .eq('id', conversation.id)

          if (updateError) {
            console.error(`❌ [${requestId}] Erro ao atualizar conversa:`, updateError)
            errorCount++;
            continue;
          }

          // Enviar resposta via WhatsApp
          const whatsappResult = await sendWhatsAppMessage(
            conversation.client_phone, 
            difyResponse.answer, 
            requestId, 
            { phoneNumberId, whatsappToken }
          );

          if (whatsappResult.success) {
            console.log(`✅ [${requestId}] Mensagem enviada via WhatsApp para ${conversation.client_name}`)
            successCount++;
          } else {
            console.error(`❌ [${requestId}] Erro ao enviar WhatsApp:`, whatsappResult.error)
            errorCount++;
          }

        } else {
          console.error(`❌ [${requestId}] Resposta inválida do Dify para ${conversation.client_name}`)
          errorCount++;
        }

        // Pequena pausa entre processamentos
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ [${requestId}] Erro ao processar conversa ${conversation.client_name}:`, error)
        errorCount++;
      }
    }

    console.log(`📊 [${requestId}] Reprocessamento concluído: ${successCount} sucessos, ${errorCount} erros de ${processedCount} processadas`)

    return new Response(JSON.stringify({
      status: 'completed',
      timestamp: new Date().toISOString(),
      summary: {
        total_found: problemConversations?.length || 0,
        processed: processedCount,
        successful: successCount,
        errors: errorCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico:`, error)
    return new Response(JSON.stringify({ 
      error: error.message,
      requestId: requestId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function callDifyAPI(message: string, conversationId: string | null, requestId: string, credentials: any) {
  try {
    const { difyApiKey, difyBaseUrl } = credentials
    
    const url = `${difyBaseUrl}/chat-messages`
    
    const requestBody: any = {
      inputs: {},
      query: message,
      response_mode: 'blocking',
      user: 'whatsapp-user'
    }

    if (conversationId) {
      requestBody.conversation_id = conversationId
    }

    console.log(`🤖 [${requestId}] Enviando para Dify: ${message.substring(0, 50)}...`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error(`❌ [${requestId}] Erro HTTP ${response.status} na API do Dify`)
      return null
    }

    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
      console.error(`❌ [${requestId}] Dify retornou HTML em vez de JSON`)
      return null
    }

    const responseData = JSON.parse(responseText)

    if (!responseData.answer) {
      console.error(`❌ [${requestId}] Resposta do Dify sem campo 'answer'`)
      return null
    }

    return responseData
  } catch (error) {
    console.error(`❌ [${requestId}] Erro na requisição para Dify:`, error)
    return null
  }
}

async function sendWhatsAppMessage(to: string, message: string, requestId: string, credentials: any) {
  try {
    const { phoneNumberId, whatsappToken } = credentials
    
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    })

    const result = await response.json()

    if (response.ok && result.messages && result.messages[0]) {
      return { success: true, message_id: result.messages[0].id }
    } else {
      return { success: false, error: result.error?.message || 'Erro desconhecido' }
    }

  } catch (error) {
    return { success: false, error: error.message }
  }
}

console.log('🔄 Reprocess Lost Messages Function iniciada!')