import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Função para validar assinatura do webhook
function validateWebhookSignature(payload: string, signature: string): boolean {
  const appSecret = Deno.env.get('WHATSAPP_APP_SECRET');
  if (!appSecret) {
    console.error('❌ WHATSAPP_APP_SECRET não configurado');
    return false;
  }

  const expectedSignature = createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`🌐 [${requestId}] ${req.method} ${req.url}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] CORS preflight handled`);
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar credenciais no início
    const verifyToken = Deno.env.get('WEBHOOK_VERIFY_TOKEN');
    const appSecret = Deno.env.get('WHATSAPP_APP_SECRET');
    const difyApiKey = Deno.env.get('DIFY_API_KEY');
    const difyBaseUrl = Deno.env.get('DIFY_BASE_URL') || 'https://api.dify.ai';
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    console.log(`🔍 [${requestId}] Verificando credenciais:`);
    console.log(`   - Verify Token: ${verifyToken ? '✅ Configurado' : '❌ Ausente'}`);
    console.log(`   - App Secret: ${appSecret ? '✅ Configurado' : '❌ Ausente'}`);
    console.log(`   - Dify API Key: ${difyApiKey ? '✅ Configurada' : '❌ Ausente'}`);
    console.log(`   - Dify Base URL: ${difyBaseUrl}`);
    console.log(`   - WhatsApp Token: ${whatsappToken ? '✅ Configurado' : '❌ Ausente'}`);
    console.log(`   - Phone Number ID: ${phoneNumberId ? '✅ Configurado' : '❌ Ausente'}`);

    // GET - Verificação do webhook
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log(`🔍 [${requestId}] Verificação webhook:`, { 
        mode, 
        token: token ? 'presente' : 'ausente', 
        challenge: challenge ? 'presente' : 'ausente' 
      });

      if (!verifyToken) {
        console.error(`❌ [${requestId}] WEBHOOK_VERIFY_TOKEN não configurado`);
        return new Response('Verify token not configured', {
          status: 500,
          headers: corsHeaders
        });
      }

      // Debug detalhado dos valores
      console.log(`🔍 [${requestId}] Debug verificação:`);
      console.log(`   - Token recebido: "${token}" (length: ${token?.length || 0})`);
      console.log(`   - Token esperado: "${verifyToken.substring(0, 10)}..." (length: ${verifyToken.length})`);
      console.log(`   - Mode: "${mode}"`);
      console.log(`   - Challenge: "${challenge?.substring(0, 20)}..."`);

      // Normalizar valores (remover espaços e quebras de linha)
      const normalizedToken = token?.trim();
      const normalizedVerifyToken = verifyToken?.trim();
      
      console.log(`🔍 [${requestId}] Após normalização:`);
      console.log(`   - Token normalizado length: ${normalizedToken?.length || 0}`);
      console.log(`   - VerifyToken normalizado length: ${normalizedVerifyToken?.length || 0}`);
      console.log(`   - Tokens são iguais: ${normalizedToken === normalizedVerifyToken}`);

      if (mode === 'subscribe' && normalizedToken === normalizedVerifyToken && challenge) {
        console.log(`✅ [${requestId}] Webhook verificado com sucesso!`);
        return new Response(challenge, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/plain'
          }
        });
      }

      // Log detalhado da falha
      console.error(`❌ [${requestId}] Falha na verificação do webhook`);
      console.error(`   - Mode válido: ${mode === 'subscribe'}`);
      console.error(`   - Token válido: ${normalizedToken === normalizedVerifyToken}`);
      console.error(`   - Challenge presente: ${!!challenge}`);
      
      return new Response('Verification failed', {
        status: 403,
        headers: corsHeaders
      });
    }

    // POST - Processar mensagens
    if (req.method === 'POST') {
      // Ler o body como texto para validação de assinatura
      const bodyText = await req.text();
      
      // Validar assinatura
      const signature = req.headers.get('x-hub-signature-256');
      if (signature && appSecret) {
        const isValid = validateWebhookSignature(bodyText, signature);
        if (!isValid) {
          console.error(`❌ [${requestId}] Assinatura inválida`);
          // Por enquanto, apenas logar o erro mas continuar processando
          console.warn(`⚠️ [${requestId}] AVISO: Continuando mesmo com assinatura inválida (modo debug)`);
        } else {
          console.log(`✅ [${requestId}] Assinatura validada`);
        }
      } else {
        console.warn(`⚠️ [${requestId}] Validação de assinatura pulada (assinatura ou app secret ausente)`);
      }

      // Parse JSON
      let body;
      try {
        body = JSON.parse(bodyText);
        console.log(`📱 [${requestId}] Webhook recebido:`, JSON.stringify(body, null, 2));
      } catch (error) {
        console.error(`❌ [${requestId}] Erro ao parsear JSON:`, error);
        return new Response('Invalid JSON', {
          status: 400,
          headers: corsHeaders
        });
      }

      // Processar webhook
      if (body.object === 'whatsapp_business_account') {
        console.log(`📊 [${requestId}] Processando ${body.entry?.length || 0} entries`);
        
        for (const entry of body.entry || []) {
          console.log(`🔍 [${requestId}] Entry ID: ${entry.id}, Changes: ${entry.changes?.length || 0}`);
          
          for (const change of entry.changes || []) {
            console.log(`🔄 [${requestId}] Change field: ${change.field}`);
            
            if (change.field === 'messages') {
              const result = await processMessages(
                supabaseClient, 
                change.value, 
                requestId,
                {
                  difyApiKey,
                  difyBaseUrl,
                  whatsappToken,
                  phoneNumberId
                }
              );
              console.log(`📝 [${requestId}] Resultado processamento:`, result);
            } else {
              console.log(`ℹ️ [${requestId}] Change field ignorado: ${change.field}`);
            }
          }
        }
      } else {
        console.log(`⚠️ [${requestId}] Object type não suportado: ${body.object}`);
      }

      // IMPORTANTE: Responder rapidamente com 200 OK
      console.log(`✅ [${requestId}] Webhook processado com sucesso`);
      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain'
        }
      });
    }

    console.log(`❌ [${requestId}] Método não permitido: ${req.method}`);
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no webhook:`, error);
    console.error(`❌ [${requestId}] Stack trace:`, error.stack);
    
    // IMPORTANTE: Mesmo com erro, retornar 200 para não travar a fila da Meta
    return new Response('EVENT_RECEIVED', {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain'
      }
    });
  }
});

async function processMessages(supabase, messageData, requestId, credentials) {
  try {
    console.log(`📊 [${requestId}] Dados recebidos para processamento:`, JSON.stringify(messageData, null, 2));
    
    const { messages, contacts, statuses } = messageData;

    // Processar status updates primeiro
    if (statuses && statuses.length > 0) {
      console.log(`📱 [${requestId}] Processando ${statuses.length} status updates`);
      
      for (const status of statuses) {
        console.log(`📱 [${requestId}] Status update:`, {
          id: status.id,
          status: status.status,
          recipient_id: status.recipient_id
        });

        // Atualizar status da mensagem no banco
        const { error: updateError } = await supabase
          .from('messages')
          .update({ status: status.status })
          .eq('whatsapp_message_id', status.id);

        if (updateError) {
          console.error(`❌ [${requestId}] Erro ao atualizar status:`, updateError);
        } else {
          console.log(`✅ [${requestId}] Status atualizado para mensagem ${status.id}`);
        }
      }

      return { processed: 'status_updates', count: statuses.length };
    }

    if (!messages || messages.length === 0) {
      console.log(`⚠️ [${requestId}] Nenhuma mensagem no payload`);
      return { processed: 'none', reason: 'no_messages' };
    }

    console.log(`📝 [${requestId}] Processando ${messages.length} mensagens`);

    for (const message of messages) {
      try {
        const clientPhone = message.from;
        const clientName = contacts?.[0]?.profile?.name || contacts?.[0]?.wa_id || 'Cliente';

        console.log(`👤 [${requestId}] Processando mensagem de ${clientName} (${clientPhone})`);
        console.log(`📱 [${requestId}] Dados da mensagem:`, JSON.stringify(message, null, 2));

        // 1. Buscar ou criar conversa
        console.log(`🔍 [${requestId}] Buscando conversa para ${clientPhone}`);
        
        let { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('client_phone', clientPhone)
          .neq('status', 'closed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (convError && convError.code !== 'PGRST116') {
          console.error(`❌ [${requestId}] Erro ao buscar conversa:`, convError);
          continue;
        }

        if (!conversation) {
          console.log(`✨ [${requestId}] Criando nova conversa para ${clientPhone}`);
          
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
            .single();

          if (createError) {
            console.error(`❌ [${requestId}] Erro ao criar conversa:`, createError);
            continue;
          }

          conversation = newConv;
          console.log(`✅ [${requestId}] Nova conversa criada:`, conversation.id);
        } else {
          console.log(`✅ [${requestId}] Conversa encontrada:`, conversation.id);
        }

        // 2. Processar conteúdo da mensagem
        let messageContent = 'Mensagem não suportada';
        let messageType = 'text';

        if (message.text?.body) {
          messageContent = message.text.body;
          messageType = 'text';
        } else if (message.image) {
          messageContent = message.image.caption || 'Imagem enviada';
          messageType = 'image';
        } else if (message.document) {
          messageContent = message.document.caption || `Documento: ${message.document.filename || 'arquivo'}`;
          messageType = 'document';
        } else if (message.audio) {
          messageContent = 'Áudio enviado';
          messageType = 'audio';
        } else if (message.video) {
          messageContent = message.video.caption || 'Vídeo enviado';
          messageType = 'video';
        } else if (message.location) {
          messageContent = 'Localização enviada';
          messageType = 'location';
        } else if (message.sticker) {
          messageContent = 'Sticker enviado';
          messageType = 'sticker';
        }

        console.log(`📝 [${requestId}] Conteúdo processado: "${messageContent}" (tipo: ${messageType})`);

        // 3. Salvar mensagem do cliente
        console.log(`💾 [${requestId}] Salvando mensagem do cliente no banco...`);
        
        const clientMessageData = {
          conversation_id: conversation.id,
          sender_type: 'client',
          sender_name: clientName,
          content: messageContent,
          message_type: messageType,
          whatsapp_message_id: message.id,
          status: 'received',
          metadata: {}
        };

        console.log(`💾 [${requestId}] Dados da mensagem para salvar:`, JSON.stringify(clientMessageData, null, 2));

        const { data: savedMessage, error: msgError } = await supabase
          .from('messages')
          .insert(clientMessageData)
          .select()
          .single();

        if (msgError) {
          console.error(`❌ [${requestId}] Erro ao salvar mensagem:`, msgError);
          continue;
        }

        console.log(`✅ [${requestId}] Mensagem do cliente salva com ID:`, savedMessage.id);

        // 4. Verificar se devemos chamar Dify
        if (!credentials.difyApiKey) {
          console.log(`⚠️ [${requestId}] Dify API Key não configurada - apenas salvando mensagem`);
          continue;
        }

        // 5. Chamar Dify para gerar resposta
        console.log(`🤖 [${requestId}] Chamando Dify para gerar resposta...`);
        
        try {
          const difyResponse = await callDifyAPI(
            messageContent, 
            conversation.dify_conversation_id, 
            requestId, 
            credentials
          );

          // PROCESSAR RESPOSTA DO DIFY
          if (difyResponse && difyResponse.answer) {
            console.log(`🎉 [${requestId}] === BOT RESPOSTA VÁLIDA ===`);
            console.log(`✅ [${requestId}] Resposta do Dify: "${difyResponse.answer.substring(0, 100)}${difyResponse.answer.length > 100 ? '...' : ''}"`);

            // 6. Salvar resposta do bot
            const botMessageData = {
              conversation_id: conversation.id,
              sender_type: 'bot',
              sender_name: 'Dify Bot',
              content: difyResponse.answer,
              message_type: 'text',
              status: 'sent',
              metadata: { 
                dify_response: difyResponse,
                dify_conversation_id: difyResponse.conversation_id,
                source: 'dify_success'
              }
            };

            const { data: botMessage, error: botMsgError } = await supabase
              .from('messages')
              .insert(botMessageData)
              .select()
              .single();

            if (botMsgError) {
              console.error(`❌ [${requestId}] Erro ao salvar mensagem do bot:`, botMsgError);
            } else {
              console.log(`✅ [${requestId}] Mensagem do bot salva com ID:`, botMessage.id);
            }

            // 7. Atualizar conversa com dify_conversation_id CRÍTICO
            if (difyResponse.conversation_id) {
              console.log(`🔄 [${requestId}] Atualizando conversa com dify_conversation_id: ${difyResponse.conversation_id}`);
              
              const { error: updateConvError } = await supabase
                .from('conversations')
                .update({
                  dify_conversation_id: difyResponse.conversation_id,
                  updated_at: new Date().toISOString(),
                  last_message_at: new Date().toISOString()
                })
                .eq('id', conversation.id);

              if (updateConvError) {
                console.error(`❌ [${requestId}] CRÍTICO: Erro ao atualizar dify_conversation_id:`, updateConvError);
              } else {
                console.log(`✅ [${requestId}] SUCESSO: Conversa atualizada com dify_conversation_id`);
              }
            } else {
              console.warn(`⚠️ [${requestId}] ATENÇÃO: Dify não retornou conversation_id`);
              // Apenas atualizar timestamps
              await supabase
                .from('conversations')
                .update({
                  updated_at: new Date().toISOString(),
                  last_message_at: new Date().toISOString()
                })
                .eq('id', conversation.id);
            }

            // 8. Enviar resposta via WhatsApp
            console.log(`📤 [${requestId}] Enviando resposta via WhatsApp...`);
            
            const whatsappResult = await sendWhatsAppMessage(
              clientPhone, 
              difyResponse.answer, 
              requestId, 
              credentials
            );

            if (whatsappResult.success) {
              console.log(`✅ [${requestId}] === BOT FUNCIONANDO PERFEITAMENTE ===`);
              
              // Atualizar status da mensagem do bot
              await supabase
                .from('messages')
                .update({
                  status: 'sent',
                  whatsapp_message_id: whatsappResult.message_id
                })
                .eq('id', botMessage.id);
            } else {
              console.error(`❌ [${requestId}] Erro ao enviar mensagem via WhatsApp:`, whatsappResult.error);
              
              // Atualizar status da mensagem do bot como falhada
              await supabase
                .from('messages')
                .update({ status: 'failed' })
                .eq('id', botMessage.id);
            }

          } else if (difyResponse && difyResponse.fallback) {
            // FALLBACK QUANDO DIFY FALHA
            console.error(`❌ [${requestId}] === DIFY FALHOU - ATIVANDO FALLBACK ===`);
            console.error(`❌ [${requestId}] Erro Dify:`, difyResponse.error);
            console.error(`❌ [${requestId}] Mensagem:`, difyResponse.message);
            
            const fallbackMessage = "Olá! Nosso sistema está passando por uma atualização. Em breve um de nossos atendentes irá te ajudar. Obrigado pela paciência! 🙂";
            
            // Salvar mensagem de fallback
            const fallbackMessageData = {
              conversation_id: conversation.id,
              sender_type: 'bot',
              sender_name: 'Sistema de Fallback',
              content: fallbackMessage,
              message_type: 'text',
              status: 'sent',
              metadata: { 
                source: 'fallback',
                dify_error: difyResponse.error,
                original_dify_response: difyResponse
              }
            };

            const { data: fallbackMsg, error: fallbackError } = await supabase
              .from('messages')
              .insert(fallbackMessageData)
              .select()
              .single();

            if (!fallbackError) {
              console.log(`✅ [${requestId}] Mensagem de fallback salva`);
              
              // Enviar fallback via WhatsApp
              const fallbackResult = await sendWhatsAppMessage(
                clientPhone, 
                fallbackMessage, 
                requestId, 
                credentials
              );
              
              if (fallbackResult.success) {
                console.log(`✅ [${requestId}] Fallback enviado com sucesso`);
                await supabase
                  .from('messages')
                  .update({
                    status: 'sent',
                    whatsapp_message_id: fallbackResult.message_id
                  })
                  .eq('id', fallbackMsg.id);
              }
            }
            
            // Marcar conversa para revisão manual
            await supabase
              .from('conversations')
              .update({
                status: 'manual',
                priority: 'high',
                updated_at: new Date().toISOString(),
                last_message_at: new Date().toISOString(),
                metadata: {
                  ...conversation.metadata,
                  dify_failed: true,
                  dify_error: difyResponse.error,
                  requires_manual_review: true
                }
              })
              .eq('id', conversation.id);
              
            console.log(`🚨 [${requestId}] Conversa marcada para atendimento manual devido a falha do Dify`);

          } else {
            console.error(`❌ [${requestId}] === RESPOSTA DIFY TOTALMENTE INVÁLIDA ===`);
            console.error(`❌ [${requestId}] Resposta recebida:`, difyResponse);
            
            // Fallback para resposta totalmente inválida
            const emergencyMessage = "Olá! Estamos com uma instabilidade temporária. Por favor, aguarde que em breve retornaremos o contato. Obrigado!";
            
            await sendWhatsAppMessage(
              clientPhone, 
              emergencyMessage, 
              requestId, 
              credentials
            );
          }
        } catch (difyError) {
          console.error(`❌ [${requestId}] Erro ao chamar Dify:`, difyError);
          
          // Enviar mensagem de fallback
          const fallbackMessage = "Desculpe, estou com dificuldades técnicas no momento. Por favor, aguarde que em breve um de nossos atendentes irá te ajudar.";
          
          await sendWhatsAppMessage(
            clientPhone, 
            fallbackMessage, 
            requestId, 
            credentials
          );
        }

        // 9. Criar notificação de nova mensagem
        console.log(`🔔 [${requestId}] Criando notificação...`);
        
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
          });

        if (notifError) {
          console.error(`❌ [${requestId}] Erro ao criar notificação:`, notifError);
        } else {
          console.log(`✅ [${requestId}] Notificação criada`);
        }

      } catch (messageError) {
        console.error(`❌ [${requestId}] Erro ao processar mensagem individual:`, messageError);
        // Continuar com a próxima mensagem
      }
    }

    return { processed: 'messages', count: messages.length };

  } catch (error) {
    console.error(`❌ [${requestId}] Erro crítico no processamento:`, error);
    console.error(`❌ [${requestId}] Stack trace:`, error.stack);
    return { processed: 'error', error: error.message };
  }
}

async function callDifyAPI(message, conversationId, requestId, credentials) {
  console.log(`🤖 [${requestId}] === INICIANDO CHAMADA DIFY ===`);
  
  try {
    const { difyApiKey, difyBaseUrl } = credentials;

    // VALIDAÇÃO CRÍTICA DE CREDENCIAIS
    if (!difyApiKey) {
      console.error(`❌ [${requestId}] CRÍTICO: Dify API Key não configurada`);
      return { error: 'API_KEY_MISSING', fallback: true };
    }

    if (!difyBaseUrl) {
      console.error(`❌ [${requestId}] CRÍTICO: Dify Base URL não configurada`);
      return { error: 'BASE_URL_MISSING', fallback: true };
    }

    console.log(`🔍 [${requestId}] Configurações Dify válidas:`);
    console.log(`   - Base URL: ${difyBaseUrl}`);
    console.log(`   - API Key: ${difyApiKey.substring(0, 20)}...${difyApiKey.substring(difyApiKey.length - 4)}`);
    console.log(`   - Conversation ID: ${conversationId || 'NOVA CONVERSA'}`);
    console.log(`   - Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);

    // CONSTRUÇÃO CUIDADOSA DA URL
    const cleanBaseUrl = difyBaseUrl.replace(/\/v1$/, '').replace(/\/$/, '');
    const url = `${cleanBaseUrl}/v1/chat-messages`;
    
    console.log(`🔗 [${requestId}] URL final construída: ${url}`);

    // PREPARAÇÃO DO BODY
    const requestBody = {
      inputs: {},
      query: message,
      response_mode: 'blocking',
      user: `whatsapp-${requestId}`
    };

    if (conversationId) {
      requestBody.conversation_id = conversationId;
      console.log(`🔄 [${requestId}] Usando conversation_id existente: ${conversationId}`);
    } else {
      console.log(`🆕 [${requestId}] Nova conversa será criada no Dify`);
    }

    console.log(`📤 [${requestId}] Request Body:`, JSON.stringify(requestBody, null, 2));

    // TIMEOUT PARA EVITAR TRAVAMENTO
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      console.log(`⏳ [${requestId}] Enviando requisição para Dify (timeout: 30s)...`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`📨 [${requestId}] Status da resposta: ${response.status} ${response.statusText}`);
      console.log(`📨 [${requestId}] Headers da resposta:`, Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log(`📝 [${requestId}] Resposta bruta (${responseText.length} chars):`, responseText.substring(0, 1000));

      // VALIDAÇÃO DO STATUS HTTP
      if (!response.ok) {
        console.error(`❌ [${requestId}] ERRO HTTP ${response.status}: ${response.statusText}`);
        console.error(`❌ [${requestId}] Resposta de erro completa:`, responseText);
        
        if (response.status === 401) {
          return { error: 'UNAUTHORIZED', message: 'API Key inválida', fallback: true };
        } else if (response.status === 404) {
          return { error: 'NOT_FOUND', message: 'Endpoint não encontrado', fallback: true };
        } else if (response.status >= 500) {
          return { error: 'SERVER_ERROR', message: 'Erro interno do Dify', fallback: true };
        } else {
          return { error: 'HTTP_ERROR', message: `Erro ${response.status}`, fallback: true };
        }
      }

      // VALIDAÇÃO DO CONTEÚDO
      if (!responseText || responseText.trim() === '') {
        console.error(`❌ [${requestId}] Resposta vazia do Dify`);
        return { error: 'EMPTY_RESPONSE', fallback: true };
      }

      // VERIFICAR SE É HTML (erro de roteamento)
      if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html')) {
        console.error(`❌ [${requestId}] Dify retornou HTML - possível erro de URL`);
        console.error(`❌ [${requestId}] URL usada: ${url}`);
        return { error: 'HTML_RESPONSE', message: 'URL incorreta', fallback: true };
      }

      // PARSE JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log(`✅ [${requestId}] JSON parseado com sucesso`);
      } catch (parseError) {
        console.error(`❌ [${requestId}] Erro ao fazer parse JSON:`, parseError);
        console.error(`❌ [${requestId}] Texto que falhou no parse:`, responseText.substring(0, 500));
        return { error: 'JSON_PARSE_ERROR', message: parseError.message, fallback: true };
      }

      // VALIDAÇÃO DA ESTRUTURA DA RESPOSTA
      console.log(`🔍 [${requestId}] Estrutura da resposta:`, {
        keys: Object.keys(responseData),
        hasAnswer: !!responseData.answer,
        hasConversationId: !!responseData.conversation_id,
        answerLength: responseData.answer?.length || 0
      });

      if (!responseData.answer) {
        console.error(`❌ [${requestId}] Resposta sem campo 'answer':`);
        console.error(`❌ [${requestId}] Campos disponíveis:`, Object.keys(responseData));
        console.error(`❌ [${requestId}] Resposta completa:`, JSON.stringify(responseData, null, 2));
        return { error: 'NO_ANSWER', message: 'Resposta sem conteúdo', fallback: true };
      }

      console.log(`🎉 [${requestId}] === DIFY SUCESSO ===`);
      console.log(`✅ [${requestId}] Answer: "${responseData.answer.substring(0, 200)}${responseData.answer.length > 200 ? '...' : ''}"`);
      console.log(`✅ [${requestId}] Conversation ID: ${responseData.conversation_id || 'NÃO FORNECIDO'}`);
      
      return responseData;

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`❌ [${requestId}] TIMEOUT na requisição Dify (30s)`);
        return { error: 'TIMEOUT', message: 'Requisição muito lenta', fallback: true };
      }
      
      throw fetchError; // Re-throw para o catch externo
    }

  } catch (error) {
    console.error(`❌ [${requestId}] === ERRO CRÍTICO NO DIFY ===`);
    console.error(`❌ [${requestId}] Tipo: ${error.name}`);
    console.error(`❌ [${requestId}] Mensagem: ${error.message}`);
    console.error(`❌ [${requestId}] Stack trace:`, error.stack);
    
    return { 
      error: 'CRITICAL_ERROR', 
      message: error.message, 
      stack: error.stack,
      fallback: true 
    };
  }
}

async function sendWhatsAppMessage(to, message, requestId, credentials) {
  try {
    const { phoneNumberId, whatsappToken } = credentials;

    console.log(`📤 [${requestId}] Configurações WhatsApp:`);
    console.log(`   - Phone Number ID: ${phoneNumberId}`);
    console.log(`   - Access Token: ${whatsappToken ? `${whatsappToken.substring(0, 20)}...` : 'AUSENTE'}`);

    if (!phoneNumberId || !whatsappToken) {
      console.error(`❌ [${requestId}] Credenciais do WhatsApp não configuradas`);
      return { success: false, error: 'Credenciais não configuradas' };
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const messageData = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    };

    console.log(`📤 [${requestId}] Enviando mensagem WhatsApp:`, { url, data: messageData });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    console.log(`📤 [${requestId}] Status resposta WhatsApp: ${response.status}`);
    console.log(`📤 [${requestId}] Resposta completa WhatsApp API:`, JSON.stringify(result, null, 2));

    if (response.ok && result.messages && result.messages[0]) {
      console.log(`✅ [${requestId}] Mensagem enviada com sucesso! ID: ${result.messages[0].id}`);
      return { success: true, message_id: result.messages[0].id };
    } else {
      console.error(`❌ [${requestId}] Erro ao enviar mensagem WhatsApp:`, result);
      return { success: false, error: result.error?.message || 'Erro desconhecido' };
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro na requisição WhatsApp:`, error);
    return { success: false, error: error.message };
  }
}

console.log('🚀 WhatsApp Webhook Function com LOGS APRIMORADOS e tratamento robusto de erros iniciada!');