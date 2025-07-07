
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

        const summaryPrompt = `Você é um especialista em qualificação de leads e vendas. Analise esta conversa e extraia TODAS as informações comerciais relevantes para o vendedor assumir o atendimento de forma eficaz.

DADOS DO CLIENTE:
- Nome: ${conversation.client_name || 'Não informado'}
- Telefone: ${conversation.client_phone}
- Temperatura: ${conversation.lead_temperature}
- Valor Potencial: R$ ${conversation.potential_value || 'Não informado'}
- Fonte: ${conversation.source || 'WhatsApp'}

HISTÓRICO COMPLETO DA CONVERSA:
${conversationHistory}

NOTA DA TRANSFERÊNCIA: ${transfer_note || 'Nenhuma nota adicional'}

INSTRUÇÃO CRÍTICA: Analise cada mensagem em busca de informações comerciais específicas. Gere um resumo DETALHADO e ESTRUTURADO com:

🎯 **PRODUTO/INTERESSE**:
- Qual produto específico o cliente quer? (energia solar, inversor, painéis, etc.)
- Que capacidade/potência mencionou? (kWp, kW, etc.)
- Qual a aplicação? (residencial, comercial, industrial, rural)
- Mencionou marca ou especificação técnica?

📍 **LOCALIZAÇÃO E CONTEXTO**:
- Qual cidade/região o cliente informou?
- Tipo de imóvel (casa, empresa, fazenda, etc.)
- Características do local mencionadas
- Distância da distribuidora/rede elétrica

💰 **INVESTIMENTO E URGÊNCIA**:
- Cliente mencionou orçamento disponível?
- Falou sobre prazo de pagamento preferido?
- Demonstrou urgência? Por quê?
- Mencionou financiamento ou forma de pagamento?

🔍 **SITUAÇÃO ATUAL (SPIN)**:
- **Situação**: Como está hoje? (conta de luz alta, sem energia, etc.)
- **Problema**: Que dificuldades relatou?
- **Implicação**: Como isso afeta o cliente?
- **Necessidade**: O que exatamente precisa resolver?

⚡ **CONTEXTO TÉCNICO**:
- Consumo mencionado (kWh/mês, valor da conta)?
- Características da instalação atual
- Limitações ou desafios técnicos mencionados
- Experiência prévia com energia solar

🎯 **OPORTUNIDADE DE VENDA**:
- Cliente está comparando propostas?
- Qual o principal motivador da compra?
- Sinais de interesse forte ou objeções
- Próximos passos ideais para fechamento

📋 **INFORMAÇÕES CRÍTICAS**:
- Decisor da compra identificado?
- Prazo para decisão mencionado?
- Documentação necessária discutida?
- Qualquer informação sensível ou importante

FORMATO: Use tópicos claros e diretos. Se alguma informação NÃO foi mencionada, escreva "Não informado" - mas procure TODAS as pistas no histórico.`

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
            max_tokens: 2000,
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

    // 5. Enviar notificação via Rodri.GO (centralizada)
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
      // SEMPRE usar Rodri.GO para centralizar comunicações
      const { error: sendError } = await supabase.functions.invoke('rodrigo-send-message', {
        body: {
          to_number: seller.whatsapp_number,
          message: notificationMessage,
          context_type: 'notification',
          metadata: {
            conversation_id: conversation_id,
            seller_id: seller_id,
            transfer_note: transfer_note,
            lead_temperature: conversation.lead_temperature
          }
        }
      })

      if (sendError) {
        console.log(`⚠️ [${requestId}] Falha ao enviar via Rodri.GO:`, sendError)
      } else {
        console.log(`📱 [${requestId}] Notificação enviada via Rodri.GO para ${seller.name}`)
      }
    } catch (notifyError) {
      console.log(`⚠️ [${requestId}] Erro na notificação via Rodri.GO:`, notifyError)
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
