import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🚨 [${requestId}] Emergency Dify Recovery iniciado`)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Configurações
    const difyApiKey = Deno.env.get('DIFY_API_KEY')
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai'
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    
    let recoveryStats = {
      totalConversationsFound: 0,
      conversationsProcessed: 0,
      difyResponsesGenerated: 0,
      whatsappMessagesSent: 0,
      errors: 0,
      conversationsFixed: [],
      errorDetails: []
    };

    console.log(`🔍 [${requestId}] Buscando conversas problemáticas...`)

    // 1. BUSCAR CONVERSAS SEM DIFY_CONVERSATION_ID
    const { data: problemConversations, error: convError } = await supabaseClient
      .from('conversations')
      .select('id, client_name, client_phone, created_at, status, source')
      .is('dify_conversation_id', null)
      .eq('source', 'whatsapp')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (convError) {
      console.error(`❌ [${requestId}] Erro ao buscar conversas:`, convError)
      throw new Error(`Erro ao buscar conversas: ${convError.message}`)
    }

    recoveryStats.totalConversationsFound = problemConversations?.length || 0;
    console.log(`📊 [${requestId}] ${recoveryStats.totalConversationsFound} conversas encontradas`)

    if (!problemConversations || problemConversations.length === 0) {
      console.log(`ℹ️ [${requestId}] Nenhuma conversa problemática encontrada`)
      return new Response(JSON.stringify({
        status: 'no_issues_found',
        message: 'Nenhuma conversa problemática encontrada',
        stats: recoveryStats,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. PROCESSAR CADA CONVERSA PROBLEMÁTICA
    for (const conversation of problemConversations) {
      try {
        console.log(`🔧 [${requestId}] Processando conversa ${conversation.id} - ${conversation.client_name}`)
        recoveryStats.conversationsProcessed++;

        // 2.1. Buscar última mensagem do cliente
        const { data: lastClientMessage } = await supabaseClient
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conversation.id)
          .eq('sender_type', 'client')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!lastClientMessage) {
          console.log(`⚠️ [${requestId}] Conversa ${conversation.id} sem mensagens do cliente`)
          continue;
        }

        // 2.2. Verificar se já tem resposta do bot
        const { data: existingBotResponse } = await supabaseClient
          .from('messages')
          .select('id')
          .eq('conversation_id', conversation.id)
          .eq('sender_type', 'bot')
          .limit(1)
          .single()

        if (existingBotResponse) {
          console.log(`ℹ️ [${requestId}] Conversa ${conversation.id} já tem resposta do bot`)
          continue;
        }

        // 2.3. Gerar resposta com Dify
        console.log(`🤖 [${requestId}] Gerando resposta Dify para: "${lastClientMessage.content}"`)
        
        if (!difyApiKey) {
          console.error(`❌ [${requestId}] DIFY_API_KEY não configurada`)
          recoveryStats.errors++;
          continue;
        }

        const difyResponse = await callDifyAPI(lastClientMessage.content, null, requestId, {
          difyApiKey,
          difyBaseUrl
        });

        if (!difyResponse || !difyResponse.answer) {
          console.error(`❌ [${requestId}] Falha ao gerar resposta Dify`)
          recoveryStats.errors++;
          recoveryStats.errorDetails.push({
            conversation_id: conversation.id,
            error: 'Falha ao gerar resposta Dify'
          });
          continue;
        }

        console.log(`✅ [${requestId}] Resposta Dify gerada: "${difyResponse.answer.substring(0, 50)}..."`)
        recoveryStats.difyResponsesGenerated++;

        // 2.4. Salvar resposta do bot no banco
        const { data: botMessage, error: botMsgError } = await supabaseClient
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
              emergency_recovery: true,
              recovered_at: new Date().toISOString()
            }
          })
          .select()
          .single()

        if (botMsgError) {
          console.error(`❌ [${requestId}] Erro ao salvar mensagem bot:`, botMsgError)
          recoveryStats.errors++;
          continue;
        }

        // 2.5. Atualizar conversa com dify_conversation_id
        if (difyResponse.conversation_id) {
          const { error: updateConvError } = await supabaseClient
            .from('conversations')
            .update({ 
              dify_conversation_id: difyResponse.conversation_id,
              updated_at: new Date().toISOString(),
              last_message_at: new Date().toISOString()
            })
            .eq('id', conversation.id)

          if (updateConvError) {
            console.error(`❌ [${requestId}] Erro ao atualizar conversa:`, updateConvError)
          } else {
            console.log(`✅ [${requestId}] Conversa atualizada com dify_conversation_id`)
          }
        }

        // 2.6. Enviar mensagem via WhatsApp
        console.log(`📤 [${requestId}] Enviando mensagem via WhatsApp para ${conversation.client_phone}`)
        
        const whatsappResult = await sendWhatsAppMessage(
          conversation.client_phone, 
          difyResponse.answer, 
          requestId, 
          { phoneNumberId, whatsappToken }
        );

        if (whatsappResult.success) {
          console.log(`✅ [${requestId}] Mensagem enviada via WhatsApp`)
          recoveryStats.whatsappMessagesSent++;
          
          // Atualizar status da mensagem
          await supabaseClient
            .from('messages')
            .update({ 
              whatsapp_message_id: whatsappResult.message_id,
              status: 'sent'
            })
            .eq('id', botMessage.id)
            
          // Adicionar à lista de conversas corrigidas
          recoveryStats.conversationsFixed.push({
            conversation_id: conversation.id,
            client_name: conversation.client_name,
            client_phone: conversation.client_phone,
            dify_conversation_id: difyResponse.conversation_id,
            response_sent: true
          });
        } else {
          console.error(`❌ [${requestId}] Erro ao enviar WhatsApp:`, whatsappResult.error)
          recoveryStats.errors++;
          recoveryStats.errorDetails.push({
            conversation_id: conversation.id,
            error: `WhatsApp: ${whatsappResult.error}`
          });
        }

        // Pequena pausa entre processamentos
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ [${requestId}] Erro ao processar conversa ${conversation.id}:`, error)
        recoveryStats.errors++;
        recoveryStats.errorDetails.push({
          conversation_id: conversation.id,
          error: error.message
        });
      }
    }

    // 3. RESULTADO FINAL
    const finalStatus = recoveryStats.conversationsFixed.length > 0 ? 'success' : 
                       recoveryStats.errors > 0 ? 'partial_success' : 'no_changes';

    console.log(`🏁 [${requestId}] Recovery concluído: ${finalStatus}`)
    console.log(`📊 [${requestId}] Estatísticas:`, recoveryStats)

    return new Response(JSON.stringify({
      status: finalStatus,
      message: `Recovery concluído: ${recoveryStats.conversationsFixed.length} conversas corrigidas`,
      stats: recoveryStats,
      timestamp: new Date().toISOString(),
      requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no recovery:`, error)
    return new Response(JSON.stringify({ 
      status: 'critical_error',
      error: error.message,
      stats: recoveryStats,
      requestId: requestId,
      timestamp: new Date().toISOString()
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
      user: 'recovery-user'
    }

    if (conversationId) {
      requestBody.conversation_id = conversationId
    }

    console.log(`🤖 [${requestId}] Chamando Dify API: ${url}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Emergency-Recovery/1.0'
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`🤖 [${requestId}] Dify response status: ${response.status}`)

    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`❌ [${requestId}] Dify erro HTTP ${response.status}:`, responseText)
      return null
    }

    try {
      const responseData = JSON.parse(responseText)
      if (!responseData.answer) {
        console.error(`❌ [${requestId}] Resposta Dify sem campo 'answer'`)
        return null
      }
      return responseData
    } catch (parseError) {
      console.error(`❌ [${requestId}] Erro parse JSON Dify:`, parseError)
      return null
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro conectividade Dify:`, error)
    return null
  }
}

async function sendWhatsAppMessage(to: string, message: string, requestId: string, credentials: any) {
  try {
    const { phoneNumberId, whatsappToken } = credentials
    
    if (!phoneNumberId || !whatsappToken) {
      return { success: false, error: 'Credenciais WhatsApp não configuradas' }
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    const messageData = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    }

    console.log(`📤 [${requestId}] Enviando WhatsApp para ${to}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()
    
    if (response.ok && result.messages && result.messages[0]) {
      return { 
        success: true, 
        message_id: result.messages[0].id 
      }
    } else {
      return { 
        success: false, 
        error: result.error?.message || 'Erro desconhecido' 
      }
    }

  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    }
  }
}

console.log('🚨 Emergency Dify Recovery Function iniciada!')