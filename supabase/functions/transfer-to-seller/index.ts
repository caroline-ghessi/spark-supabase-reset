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

    console.log(`🎯 [${requestId}] Iniciando transferência: conversa ${conversation_id} para seller ${seller_id}`)

    // Buscar conversa
    const { data: conversation, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .single()

    if (convErr || !conversation) {
      console.error(`❌ [${requestId}] Erro ao buscar conversa:`, convErr)
      throw new Error('Conversa não encontrada')
    }

    // Buscar vendedor
    const { data: seller, error: sellerErr } = await supabase
      .from('sellers')
      .select('*')
      .eq('id', seller_id)
      .single()

    if (sellerErr || !seller) {
      console.error(`❌ [${requestId}] Erro ao buscar vendedor:`, sellerErr)
      throw new Error('Vendedor não encontrado')
    }

    console.log(`🔄 [${requestId}] Transferindo conversa ${conversation_id} para vendedor ${seller.name} (${seller.whatsapp_number})`)

    // 1. Atualizar conversa primeiro (rápido)
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        assigned_seller_id: seller_id,
        status: 'manual',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id)

    if (updateError) {
      console.error(`❌ [${requestId}] Erro ao atualizar conversa:`, updateError)
      throw new Error(`Erro ao atualizar conversa: ${updateError.message}`)
    }

    console.log(`✅ [${requestId}] Conversa atualizada: status=manual, seller=${seller.name}`)

    // 2. Gerar resumo básico (sem IA para evitar timeout)
    let summaryMessage = `🔔 *NOVO LEAD TRANSFERIDO*

📋 *Cliente:* ${conversation.client_name || 'Nome não informado'}
📱 *WhatsApp:* ${conversation.client_phone}
🌡️ *Temperatura:* ${conversation.lead_temperature || 'Não definida'}
💰 *Valor Potencial:* ${conversation.potential_value ? `R$ ${conversation.potential_value}` : 'Não informado'}

${transfer_note ? `📝 *Nota da Transferência:*\n${transfer_note}\n\n` : ''}🔗 *Acesse a plataforma para ver o histórico completo e continuar o atendimento.*

_Lead transferido automaticamente pelo sistema._`

    // 3. Verificar se Rodri.GO está disponível com número atualizado
    const { data: rodrigoBot, error: rodrigoErr } = await supabase
      .from('sellers')
      .select('id, name, whatsapp_number')
      .eq('whatsapp_number', '5551981155622') // Número corrigido
      .single()

    if (rodrigoErr || !rodrigoBot) {
      console.error(`❌ [${requestId}] Rodri.GO não encontrado:`, rodrigoErr)
      throw new Error('Rodri.GO não encontrado para centralizar comunicações')
    }

    console.log(`🤖 [${requestId}] Rodri.GO encontrado: ${rodrigoBot.name} (${rodrigoBot.whatsapp_number})`)

    // 4. Enviar notificação via Rodri.GO com timeout de 8 segundos
    let notificationSent = false
    try {
      console.log(`📱 [${requestId}] Enviando notificação via Rodri.GO para ${seller.name} (${seller.whatsapp_number})`)
      
      // Usar timeout menor para evitar 504
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
      const sendPromise = supabase.functions.invoke('rodrigo-send-message', {
        body: {
          to_number: seller.whatsapp_number,
          message: summaryMessage,
          context_type: 'notification',
          metadata: {
            conversation_id: conversation_id,
            seller_id: seller_id,
            transfer_note: transfer_note,
            lead_temperature: conversation.lead_temperature,
            client_name: conversation.client_name,
            client_phone: conversation.client_phone
          }
        }
      })
      
      const { data: sendResult, error: sendError } = await Promise.race([
        sendPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na chamada rodrigo-send-message')), 8000)
        )
      ]) as any
      
      clearTimeout(timeoutId)

      if (sendError) {
        console.error(`❌ [${requestId}] Falha ao enviar via Rodri.GO:`, sendError)
        
        // Criar alerta crítico para falha de transferência
        await supabase.functions.invoke('send-management-alert', {
          body: {
            alert_type: 'transfer_notification_failure',
            severity: 'critical',
            message: `Falha ao notificar ${seller.name} sobre transferência da conversa ${conversation.client_name}`,
            context: {
              conversation_id,
              seller_id,
              seller_name: seller.name,
              seller_number: seller.whatsapp_number,
              error: sendError
            }
          }
        }).catch(e => console.error('Erro ao enviar alerta de falha:', e))
        
      } else {
        console.log(`✅ [${requestId}] Notificação enviada via Rodri.GO:`, sendResult)
        notificationSent = true
      }
    } catch (notifyError) {
      console.error(`❌ [${requestId}] Erro crítico na notificação via Rodri.GO:`, notifyError)
      
      // Criar alerta crítico
      await supabase.functions.invoke('send-management-alert', {
        body: {
          alert_type: 'transfer_critical_failure',
          severity: 'critical',
          message: `ERRO CRÍTICO: Falha total na transferência para ${seller.name}`,
          context: {
            conversation_id,
            seller_id,
            error: notifyError.message,
            conversation_data: conversation
          }
        }
      }).catch(e => console.error('Erro ao enviar alerta crítico:', e))
    }

    // 5. Criar notificação na plataforma
    const { error: notifError } = await supabase
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

    if (notifError) {
      console.error(`⚠️ [${requestId}] Erro ao criar notificação:`, notifError)
    } else {
      console.log(`📧 [${requestId}] Notificação criada na plataforma`)
    }

    // 6. Log da transferência
    const { error: auditError } = await supabase
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
          seller_name: seller.name,
          seller_number: seller.whatsapp_number,
          notification_sent: notificationSent,
          request_id: requestId
        }
      })

    if (auditError) {
      console.error(`⚠️ [${requestId}] Erro ao criar log de auditoria:`, auditError)
    } else {
      console.log(`📝 [${requestId}] Log de auditoria criado`)
    }

    console.log(`✅ [${requestId}] Transferência concluída com sucesso`)

    return new Response(JSON.stringify({
      success: true,
      conversation_id: conversation_id,
      seller_id: seller_id,
      seller_name: seller.name,
      seller_number: seller.whatsapp_number,
      notification_sent: notificationSent,
      method: 'centralized_rodrigo',
      rodrigo_number: rodrigoBot.whatsapp_number,
      request_id: requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro na transferência:`, error)
    
    // Log do erro
    await supabase
      .from('audit_logs')
      .insert({
        resource_type: 'conversation',
        resource_id: 'transfer_error',
        action: 'transfer_error',
        metadata: {
          error_message: error.message,
          request_id: requestId,
          timestamp: new Date().toISOString()
        }
      })
      .catch(e => console.error('Erro ao salvar log de erro:', e))

    return new Response(JSON.stringify({ 
      error: error.message,
      request_id: requestId
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})