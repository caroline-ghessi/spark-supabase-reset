
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

console.log('🚀 Transfer to Seller Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`)

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { conversation_id, seller_id, transfer_note } = await req.json()

    if (!conversation_id || !seller_id) {
      throw new Error('Parâmetros obrigatórios: conversation_id, seller_id')
    }

    // Buscar conversa
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .single()

    if (convErr || !conversation) {
      throw new Error('Conversa não encontrada')
    }

    // Buscar vendedor
    const { data: seller, error: sellerErr } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', seller_id)
      .single()

    if (sellerErr || !seller) {
      throw new Error('Vendedor não encontrado')
    }

    console.log(`🔄 [${requestId}] Transferindo conversa ${conversation_id} para vendedor ${seller.name}`)

    // 1. Buscar histórico completo de mensagens da conversa
    const { data: messages, error: messagesErr } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (messagesErr) {
      console.log(`⚠️ [${requestId}] Erro ao buscar mensagens:`, messagesErr)
    }

    // 2. Gerar resumo com IA se OpenAI está configurado e há mensagens
    let aiSummary = ''
    if (openAIApiKey && messages && messages.length > 0) {
      try {
        console.log(`🤖 [${requestId}] Gerando resumo da conversa com IA...`)
        
        const conversationHistory = messages.map(msg => 
          `[${msg.sender_type}] ${msg.sender_name}: ${msg.content}`
        ).join('\n')

        const summaryPrompt = `Você é um assistente especializado em vendas. Analise esta conversa entre um cliente e nossa empresa e gere um resumo executivo para o vendedor que irá assumir o atendimento.

DADOS DO CLIENTE:
- Nome: ${conversation.client_name || 'Não informado'}
- Telefone: ${conversation.client_phone}
- Temperatura do Lead: ${conversation.lead_temperature}
- Valor Potencial: R$ ${conversation.potential_value || 'Não informado'}
- Fonte: ${conversation.source || 'WhatsApp'}

HISTÓRICO DA CONVERSA:
${conversationHistory}

NOTA DA TRANSFERÊNCIA: ${transfer_note || 'Nenhuma nota adicional'}

Gere um resumo estruturado com:
1. **Situação do Cliente**: Principais necessidades e contexto
2. **Interesse Demonstrado**: Produtos/serviços de interesse
3. **Pontos de Dor**: Problemas identificados que podemos resolver
4. **Próximos Passos**: Recomendações de abordagem
5. **Observações Importantes**: Qualquer detalhe relevante

Mantenha o resumo conciso mas informativo, focado em facilitar a continuidade do atendimento pelo vendedor.`

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Você é um especialista em vendas e atendimento ao cliente.' },
              { role: 'user', content: summaryPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        })

        if (aiResponse.ok) {
          const aiData = await aiResponse.json()
          aiSummary = aiData.choices[0].message.content
          console.log(`✅ [${requestId}] Resumo IA gerado com sucesso`)
        } else {
          console.log(`⚠️ [${requestId}] Falha ao gerar resumo IA:`, await aiResponse.text())
        }
      } catch (aiError) {
        console.log(`⚠️ [${requestId}] Erro na geração do resumo IA:`, aiError)
      }
    }

    // 3. Buscar Rodri.GO (assistente de IA)
    const { data: rodrigoBot, error: rodrigoErr } = await supabase
      .from('sellers')
      .select('*')
      .eq('whatsapp_number', '5194916150')
      .single()

    if (rodrigoErr || !rodrigoBot) {
      console.log(`⚠️ [${requestId}] Rodri.GO não encontrado, usando notificação direta`)
    }

    // 4. Atualizar conversa
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        assigned_seller_id: seller_id,
        status: 'manual',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id)

    if (updateError) {
      throw new Error(`Erro ao atualizar conversa: ${updateError.message}`)
    }

    // 5. Enviar notificação via Rodri.GO ou diretamente para o vendedor
    const notificationMessage = `🔔 *NOVO LEAD TRANSFERIDO* 🔔

👤 *Cliente:* ${conversation.client_name || conversation.client_phone}
📱 *Telefone:* ${conversation.client_phone}
🌡️ *Temperatura:* ${conversation.lead_temperature.toUpperCase()}
💰 *Valor Potencial:* ${conversation.potential_value ? `R$ ${conversation.potential_value}` : 'Não informado'}
📍 *Fonte:* ${conversation.source || 'WhatsApp'}

${aiSummary ? `🤖 *RESUMO DA CONVERSA:*\n${aiSummary}\n\n` : ''}

${transfer_note ? `📝 *Nota da Transferência:*\n${transfer_note}\n\n` : ''}

🔗 *Acesse a plataforma para ver o histórico completo e continuar o atendimento.*

_Lead transferido automaticamente pelo sistema de IA._`

    try {
      // Usar Rodri.GO se disponível, senão enviar direto para o vendedor
      const notificationToken = rodrigoBot?.whapi_token || seller.whapi_token
      const notificationTarget = seller.whatsapp_number

      if (notificationToken) {
        const whapiResponse = await fetch('https://gate.whapi.cloud/messages/text', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notificationToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: notificationTarget,
            body: notificationMessage
          })
        })

        if (whapiResponse.ok) {
          const botType = rodrigoBot?.whapi_token === notificationToken ? 'Rodri.GO' : 'vendedor'
          console.log(`📱 [${requestId}] Notificação enviada via ${botType} para ${seller.name}`)
        } else {
          console.log(`⚠️ [${requestId}] Falha ao enviar notificação WhatsApp:`, await whapiResponse.text())
        }
      }
    } catch (notifyError) {
      console.log(`⚠️ [${requestId}] Erro na notificação WhatsApp:`, notifyError)
    }

    // Criar notificação na plataforma
    await supabase
      .from('notifications')
      .insert({
        type: 'conversation_transferred',
        title: 'Conversa Transferida',
        message: `Conversa com ${conversation.client_name || conversation.client_phone} foi transferida para você`,
        user_id: seller_id,
        context: {
          conversation_id: conversation_id,
          client_phone: conversation.client_phone,
          transfer_note: transfer_note
        },
        priority: 'high'
      })

    // Log da transferência
    await supabase
      .from('audit_logs')
      .insert({
        resource_type: 'conversation',
        resource_id: conversation_id,
        action: 'transfer_to_seller',
        new_values: {
          assigned_seller_id: seller_id,
          status: 'manual'
        },
        old_values: {
          assigned_seller_id: conversation.assigned_seller_id,
          status: conversation.status
        },
        metadata: {
          transfer_note: transfer_note,
          seller_name: seller.name
        }
      })

    console.log(`✅ [${requestId}] Conversa transferida com sucesso`)

    return new Response(JSON.stringify({
      success: true,
      conversation_id: conversation_id,
      seller_id: seller_id,
      seller_name: seller.name,
      notification_sent: !!seller.whapi_token
    }))

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
