
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

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

    // Atualizar conversa
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

    // Notificar vendedor via WhatsApp (se token configurado)
    if (seller.whapi_token) {
      const notificationMessage = `🔔 *Nova conversa transferida!*

📱 Cliente: ${conversation.client_name || conversation.client_phone}
🌡️ Temperatura: ${conversation.lead_temperature}
💰 Valor potencial: ${conversation.potential_value ? `R$ ${conversation.potential_value}` : 'Não informado'}

${transfer_note ? `📝 Nota da transferência: ${transfer_note}` : ''}

Acesse a plataforma para ver o histórico completo da conversa.`

      try {
        const whapiResponse = await fetch('https://gate.whapi.cloud/messages/text', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${seller.whapi_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: seller.whatsapp_number,
            body: notificationMessage
          })
        })

        if (whapiResponse.ok) {
          console.log(`📱 [${requestId}] Notificação enviada para vendedor via WhatsApp`)
        } else {
          console.log(`⚠️ [${requestId}] Falha ao enviar notificação WhatsApp`)
        }
      } catch (notifyError) {
        console.log(`⚠️ [${requestId}] Erro na notificação WhatsApp:`, notifyError)
      }
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
