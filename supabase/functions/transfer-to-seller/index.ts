
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🚀 Transfer to Seller Function iniciada!')

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

    // 1. Gerar resumo com IA usando a nova função otimizada
    let aiSummary = ''
    try {
      console.log(`🤖 [${requestId}] Gerando resumo da conversa com IA...`)
      
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-conversation-summary', {
        body: {
          conversation_id: conversation_id
        }
      });

      if (summaryError) {
        console.log(`⚠️ [${requestId}] Erro na função de resumo:`, summaryError);
        throw summaryError;
      }
      
      if (summaryData?.success === false) {
        console.warn(`⚠️ [${requestId}] Função retornou erro:`, summaryData);
        throw new Error(summaryData.message || 'Falha na geração do resumo');
      } else {
        aiSummary = summaryData.summary || 'Resumo não disponível';
        console.log(`✅ [${requestId}] Resumo IA gerado com sucesso`);
      }
    } catch (summaryError) {
      console.log(`⚠️ [${requestId}] Erro na geração do resumo IA:`, summaryError);
      aiSummary = 'Erro ao gerar resumo. Verifique o histórico completo de mensagens na plataforma.';
    }

    // 2. Verificar se Rodri.GO está disponível para centralizar comunicações
    const { data: rodrigoBot, error: rodrigoErr } = await supabase
      .from('sellers')
      .select('id, name')
      .eq('whatsapp_number', '5194916150')
      .single()

    if (rodrigoErr || !rodrigoBot) {
      console.log(`⚠️ [${requestId}] Rodri.GO não encontrado para centralizar comunicações`)
    }

    // 3. Atualizar conversa
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

    // 4. Enviar notificação via Rodri.GO (centralizada) com novo formato
    const notificationMessage = `🔔 *NOVO LEAD TRANSFERIDO*

${aiSummary ? `${aiSummary}\n\n` : ''}

${transfer_note ? `📝 *Nota da Transferência:*\n${transfer_note}\n\n` : ''}

🔗 *Acesse a plataforma para ver o histórico completo e continuar o atendimento.*

_Lead transferido automaticamente pelo sistema._`

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
      notification_sent: true,
      method: 'centralized_rodrigo'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
