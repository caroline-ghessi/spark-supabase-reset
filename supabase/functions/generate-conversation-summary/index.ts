import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

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

    // Buscar conversa
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .single()

    if (convErr || !conversation) {
      throw new Error('Conversa não encontrada')
    }

    console.log(`🔄 [${requestId}] Gerando resumo para conversa ${conversation_id}`)

    // Buscar histórico completo de mensagens da conversa
    const { data: messages, error: messagesErr } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (messagesErr) {
      console.log(`⚠️ [${requestId}] Erro ao buscar mensagens:`, messagesErr)
      return new Response(JSON.stringify({ 
        summary: `**Cliente:** ${conversation.client_name || conversation.client_phone}\n**Temperatura:** ${conversation.lead_temperature}\n\n_Resumo básico - não foi possível acessar histórico de mensagens._`
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Gerar resumo com IA se OpenAI está configurado e há mensagens
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
          aiSummary = `**Cliente:** ${conversation.client_name || conversation.client_phone}\n**Temperatura:** ${conversation.lead_temperature}\n\n_Falha ao gerar resumo detalhado._`
        }
      } catch (aiError) {
        console.log(`⚠️ [${requestId}] Erro na geração do resumo IA:`, aiError)
        aiSummary = `**Cliente:** ${conversation.client_name || conversation.client_phone}\n**Temperatura:** ${conversation.lead_temperature}\n\n_Erro ao gerar resumo detalhado._`
      }
    } else {
      // Resumo básico se não há IA configurada
      aiSummary = `**Cliente:** ${conversation.client_name || conversation.client_phone}\n**Telefone:** ${conversation.client_phone}\n**Temperatura:** ${conversation.lead_temperature}\n**Valor Potencial:** R$ ${conversation.potential_value || 'Não informado'}\n\n_Resumo básico - IA não configurada._`
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