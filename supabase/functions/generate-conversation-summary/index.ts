import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const grokApiKey = Deno.env.get('GROK_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🚀 Generate Conversation Summary Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const { conversation_id } = await req.json()

    if (!conversation_id) {
      throw new Error('Parâmetro obrigatório: conversation_id')
    }

    console.log(`🔄 [${requestId}] Buscando conversa: ${conversation_id}`)

    // Buscar conversa
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .single()

    if (convErr) {
      console.log(`❌ [${requestId}] Erro ao buscar conversa:`, convErr)
      throw new Error(`Conversa não encontrada: ${convErr.message}`)
    }

    if (!conversation) {
      console.log(`❌ [${requestId}] Conversa não encontrada: ${conversation_id}`)
      throw new Error('Conversa não encontrada')
    }

    console.log(`✅ [${requestId}] Conversa encontrada: ${conversation.client_name || conversation.client_phone}`)

    // Buscar histórico completo de mensagens da conversa
    const { data: messages, error: messagesErr } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (messagesErr) {
      console.log(`❌ [${requestId}] Erro ao buscar mensagens:`, messagesErr)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'messages_fetch_error',
        message: 'Erro ao acessar histórico de mensagens',
        details: messagesErr.message
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log(`✅ [${requestId}] ${messages?.length || 0} mensagens encontradas`)

    // Gerar resumo baseado na quantidade e tipo de mensagens
    console.log(`📊 [${requestId}] Analisando ${messages?.length || 0} mensagens para determinar tipo de resumo`)
    
    const messageCount = messages?.length || 0
    const hasClientMessages = messages?.some(m => m.sender_type === 'client') || false
    const hasBotMessages = messages?.some(m => m.sender_type === 'bot') || false
    
    console.log(`🔍 [${requestId}] Análise de mensagens:`, {
      total: messageCount,
      hasClient: hasClientMessages,
      hasBot: hasBotMessages,
      conversationStatus: conversation.status
    })


    // Verificar se Grok está configurado
    if (!grokApiKey) {
      console.log(`❌ [${requestId}] Grok não configurado`)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'grok_not_configured',
        message: 'GROK_API_KEY não está configurado nos secrets do Supabase'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Verificar se há mensagens suficientes
    if (messageCount === 0) {
      console.log(`❌ [${requestId}] Conversa sem mensagens`)
      return new Response(JSON.stringify({
        success: false,
        error: 'no_messages',
        message: 'Conversa não possui mensagens para análise'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Gerar resumo com IA
    let aiSummary = ''
    try {
      console.log(`🤖 [${requestId}] Gerando resumo da conversa com IA...`)
      
      const conversationHistory = messages.map(msg => 
        `[${msg.sender_type}] ${msg.sender_name}: ${msg.content || '[Mensagem sem texto]'}`
      ).join('\n')

      console.log(`📝 [${requestId}] Histórico da conversa (${conversationHistory.length} chars):`, conversationHistory.substring(0, 200) + '...')

      const summaryPrompt = `Você é um especialista em qualificação de leads e vendas. Analise esta conversa e extraia TODAS as informações comerciais relevantes para o vendedor assumir o atendimento de forma eficaz.

DADOS DO CLIENTE:
- Nome: ${conversation.client_name || 'Não informado'}
- Telefone: ${conversation.client_phone}
- Temperatura: ${conversation.lead_temperature}
- Valor Potencial: R$ ${conversation.potential_value || 'Não informado'}
- Fonte: ${conversation.source || 'WhatsApp'}

HISTÓRICO COMPLETO DA CONVERSA:
${conversationHistory}

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

        const aiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'grok-3-latest',
            messages: [
              { role: 'system', content: 'Você é um especialista em vendas e atendimento ao cliente.' },
              { role: 'user', content: summaryPrompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
            stream: false
          })
        })

        if (aiResponse.ok) {
          const aiData = await aiResponse.json()
          aiSummary = aiData.choices[0].message.content
          console.log(`✅ [${requestId}] Resumo IA gerado com sucesso (${aiSummary.length} chars)`)
        } else {
          const errorText = await aiResponse.text()
          console.log(`❌ [${requestId}] Falha na API OpenAI (${aiResponse.status}):`, errorText)
          throw new Error(`Grok API Error: ${aiResponse.status} - ${errorText}`)
        }
      } catch (aiError) {
        console.log(`❌ [${requestId}] Erro na geração do resumo IA:`, aiError)
        return new Response(JSON.stringify({
          success: false,
          error: 'ai_generation_failed',
          message: 'Falha na geração do resumo com IA',
          details: aiError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

    console.log(`✅ [${requestId}] Resumo gerado com sucesso`)

    return new Response(JSON.stringify({
      success: true,
      summary: aiSummary,
      conversation: {
        id: conversation.id,
        client_name: conversation.client_name,
        client_phone: conversation.client_phone,
        lead_temperature: conversation.lead_temperature,
        potential_value: conversation.potential_value
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ 
      error: error.message,
      summary: '_Erro ao gerar resumo da conversa._'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})