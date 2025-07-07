import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('🚨 Management Alert Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🚨 [${requestId}] ${req.method} ${req.url}`)

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { 
      alert_type, 
      severity = 'medium', // 'low', 'medium', 'high', 'critical'
      conversation_id,
      seller_id,
      custom_message,
      metadata = {}
    } = await req.json()

    if (!alert_type) {
      throw new Error('Parâmetro obrigatório: alert_type')
    }

    console.log(`🚨 [${requestId}] Processando alerta: ${alert_type} - ${severity}`)

    // Buscar contatos de escalação ativos baseado na severidade
    let escalationLevel = 1
    if (severity === 'high') escalationLevel = 2
    if (severity === 'critical') escalationLevel = 3

    const { data: contacts, error: contactsError } = await supabase
      .from('escalation_contacts')
      .select('*')
      .lte('escalation_level', escalationLevel)
      .eq('is_active', true)
      .order('escalation_level', { ascending: true })

    if (contactsError) {
      console.error(`❌ [${requestId}] Erro ao buscar contatos:`, contactsError)
    }

    // Buscar dados do contexto se fornecidos
    let contextData: any = {}
    if (conversation_id) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*, assigned_seller_id')
        .eq('id', conversation_id)
        .single()
      
      if (conversation) {
        contextData.conversation = conversation
      }
    }

    if (seller_id) {
      const { data: seller } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', seller_id)
        .single()
      
      if (seller) {
        contextData.seller = seller
      }
    }

    // Gerar mensagem de alerta baseada no tipo
    let alertMessage = custom_message
    if (!alertMessage) {
      alertMessage = generateAlertMessage(alert_type, severity, contextData)
    }

    // Enviar alertas para todos os contatos de escalação
    const alertPromises = (contacts || []).map(async (contact) => {
      try {
        const { error: sendError } = await supabase.functions.invoke('rodrigo-send-message', {
          body: {
            to_number: contact.whatsapp_number,
            message: alertMessage,
            context_type: 'escalation',
            metadata: {
              alert_type: alert_type,
              severity: severity,
              escalation_level: contact.escalation_level,
              contact_role: contact.role,
              ...metadata
            }
          }
        })

        if (sendError) {
          console.error(`❌ [${requestId}] Erro ao enviar para ${contact.name}:`, sendError)
          return { contact: contact.name, success: false, error: sendError.message }
        }

        console.log(`✅ [${requestId}] Alerta enviado para ${contact.name} (${contact.role})`)
        return { contact: contact.name, success: true }
      } catch (error) {
        console.error(`❌ [${requestId}] Erro ao processar ${contact.name}:`, error)
        return { contact: contact.name, success: false, error: error.message }
      }
    })

    const results = await Promise.all(alertPromises)

    // Salvar histórico do alerta
    const { error: historyError } = await supabase
      .from('alert_history')
      .insert({
        alert_configuration_id: null, // Para alertas manuais
        triggered_by_conversation_id: conversation_id,
        triggered_by_user_id: null, // Sistema automático
        message: alertMessage,
        channels_sent: ['whatsapp'],
        recipients: { contacts: contacts?.map(c => ({ name: c.name, role: c.role })) },
        status: 'sent',
        metadata: {
          alert_type: alert_type,
          severity: severity,
          escalation_level: escalationLevel,
          results: results,
          ...metadata
        }
      })

    if (historyError) {
      console.error(`⚠️ [${requestId}] Erro ao salvar histórico:`, historyError)
    }

    const successCount = results.filter(r => r.success).length
    console.log(`📊 [${requestId}] Alerta enviado para ${successCount}/${results.length} contatos`)

    return new Response(JSON.stringify({
      success: true,
      alert_type: alert_type,
      severity: severity,
      contacts_notified: successCount,
      total_contacts: results.length,
      results: results
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

function generateAlertMessage(alertType: string, severity: string, contextData: any): string {
  const severityEmoji = {
    low: '🟡',
    medium: '🟠', 
    high: '🔴',
    critical: '🚨'
  }

  const emoji = severityEmoji[severity as keyof typeof severityEmoji] || '⚠️'
  
  const baseMessage = `${emoji} *ALERTA DE GESTÃO*\n\n`
  
  switch (alertType) {
    case 'seller_inactive':
      return `${baseMessage}📵 *Vendedor Inativo*\n\nVendedor: ${contextData.seller?.name || 'N/A'}\nÚltima atividade: ${contextData.seller?.last_activity || 'Não informado'}\n\n⚠️ Verificar disponibilidade do vendedor.`
    
    case 'conversation_stalled':
      return `${baseMessage}⏰ *Conversa Parada*\n\nCliente: ${contextData.conversation?.client_name || contextData.conversation?.client_phone}\nVendedor: ${contextData.seller?.name || 'N/A'}\nÚltima mensagem: ${contextData.conversation?.last_message_at || 'N/A'}\n\n⚠️ Conversa sem atividade há muito tempo.`
    
    case 'sale_at_risk':
      return `${baseMessage}💰 *Venda em Risco*\n\nCliente: ${contextData.conversation?.client_name || contextData.conversation?.client_phone}\nVendedor: ${contextData.seller?.name || 'N/A'}\nValor Potencial: R$ ${contextData.conversation?.potential_value || 'N/A'}\n\n🚨 Intervenção necessária para recuperar venda.`
    
    case 'technical_issue':
      return `${baseMessage}⚙️ *Problema Técnico*\n\nDescrição: Falha na integração ou sistema\n\n🔧 Verificação técnica necessária.`
    
    case 'quality_issue':
      return `${baseMessage}📊 *Problema de Qualidade*\n\nVendedor: ${contextData.seller?.name || 'N/A'}\nScore de Qualidade: ${contextData.seller?.performance_score || 'N/A'}\n\n📈 Treinamento ou supervisão necessária.`
    
    default:
      return `${baseMessage}📋 *Alerta Personalizado*\n\n${alertType}\n\n⚠️ Atenção da gerência necessária.`
  }
}