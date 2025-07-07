import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('🔍 Alert Monitor Function iniciada!')

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🔍 [${requestId}] ${req.method} ${req.url}`)

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log(`🔍 [${requestId}] Executando verificação de alertas automáticos...`)

    // Buscar regras de alerta ativas
    const { data: alertRules, error: rulesError } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('is_active', true)

    if (rulesError) {
      console.error(`❌ [${requestId}] Erro ao buscar regras:`, rulesError)
      throw rulesError
    }

    console.log(`📋 [${requestId}] Encontradas ${alertRules?.length || 0} regras ativas`)

    const alertsTriggered = []

    for (const rule of alertRules || []) {
      try {
        const shouldTrigger = await checkAlertRule(rule, requestId)
        if (shouldTrigger) {
          console.log(`🚨 [${requestId}] Disparando alerta: ${rule.name}`)
          
          // Enviar alerta
          const { error: alertError } = await supabase.functions.invoke('send-management-alert', {
            body: {
              alert_type: rule.actions.alert_type,
              severity: rule.actions.severity,
              custom_message: `Alerta automático: ${rule.name}`,
              metadata: {
                rule_id: rule.id,
                rule_name: rule.name,
                triggered_at: new Date().toISOString(),
                automatic: true
              }
            }
          })

          if (alertError) {
            console.error(`❌ [${requestId}] Erro ao enviar alerta ${rule.name}:`, alertError)
          } else {
            alertsTriggered.push(rule.name)
          }
        }
      } catch (error) {
        console.error(`⚠️ [${requestId}] Erro ao processar regra ${rule.name}:`, error)
      }
    }

    console.log(`✅ [${requestId}] Verificação concluída. ${alertsTriggered.length} alertas disparados`)

    return new Response(JSON.stringify({
      success: true,
      rules_checked: alertRules?.length || 0,
      alerts_triggered: alertsTriggered.length,
      triggered_rules: alertsTriggered
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro:`, error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

async function checkAlertRule(rule: any, requestId: string): Promise<boolean> {
  const conditions = rule.conditions
  const now = new Date()
  
  console.log(`🔍 [${requestId}] Verificando regra: ${rule.name} (${rule.rule_type})`)

  try {
    switch (rule.rule_type) {
      case 'inactivity':
        return await checkInactivityRule(conditions, requestId)
      
      case 'conversation_stalled':
        return await checkStalledConversationsRule(conditions, requestId)
      
      case 'response_time':
        return await checkResponseTimeRule(conditions, requestId)
      
      case 'quality_score':
        return await checkQualityScoreRule(conditions, requestId)
      
      default:
        console.log(`⚠️ [${requestId}] Tipo de regra desconhecido: ${rule.rule_type}`)
        return false
    }
  } catch (error) {
    console.error(`❌ [${requestId}] Erro ao verificar regra ${rule.name}:`, error)
    return false
  }
}

async function checkInactivityRule(conditions: any, requestId: string): Promise<boolean> {
  const thresholdMinutes = conditions.threshold || 30
  const cutoffTime = new Date(Date.now() - thresholdMinutes * 60 * 1000)

  const { data: inactiveSellers, error } = await supabase
    .from('sellers')
    .select('id, name, last_activity, status')
    .eq('status', 'active')
    .lt('last_activity', cutoffTime.toISOString())

  if (error) {
    console.error(`❌ [${requestId}] Erro ao verificar vendedores inativos:`, error)
    return false
  }

  const count = inactiveSellers?.length || 0
  console.log(`📊 [${requestId}] Vendedores inativos há mais de ${thresholdMinutes}min: ${count}`)
  
  return count > 0
}

async function checkStalledConversationsRule(conditions: any, requestId: string): Promise<boolean> {
  const thresholdMinutes = conditions.threshold || 120
  const cutoffTime = new Date(Date.now() - thresholdMinutes * 60 * 1000)

  const { data: stalledConversations, error } = await supabase
    .from('conversations')
    .select('id, client_name, client_phone, last_message_at, assigned_seller_id')
    .in('status', ['manual', 'bot'])
    .lt('last_message_at', cutoffTime.toISOString())

  if (error) {
    console.error(`❌ [${requestId}] Erro ao verificar conversas paradas:`, error)
    return false
  }

  const count = stalledConversations?.length || 0
  console.log(`📊 [${requestId}] Conversas paradas há mais de ${thresholdMinutes}min: ${count}`)
  
  return count > 0
}

async function checkResponseTimeRule(conditions: any, requestId: string): Promise<boolean> {
  const thresholdMinutes = conditions.threshold || 15

  // Verificar mensagens de clientes sem resposta dos vendedores
  const cutoffTime = new Date(Date.now() - thresholdMinutes * 60 * 1000)

  const { data: unrespondedMessages, error } = await supabase
    .from('messages')
    .select(`
      id, 
      conversation_id, 
      created_at,
      conversations!inner(assigned_seller_id, status)
    `)
    .eq('sender_type', 'client')
    .lt('created_at', cutoffTime.toISOString())
    .in('conversations.status', ['manual', 'bot'])

  if (error) {
    console.error(`❌ [${requestId}] Erro ao verificar tempo de resposta:`, error)
    return false
  }

  // Verificar se há resposta do vendedor para cada mensagem
  let unrespondedCount = 0
  for (const message of unrespondedMessages || []) {
    const { data: sellerResponse } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', message.conversation_id)
      .eq('sender_type', 'seller')
      .gt('created_at', message.created_at)
      .limit(1)

    if (!sellerResponse || sellerResponse.length === 0) {
      unrespondedCount++
    }
  }

  console.log(`📊 [${requestId}] Mensagens sem resposta há mais de ${thresholdMinutes}min: ${unrespondedCount}`)
  
  return unrespondedCount > 0
}

async function checkQualityScoreRule(conditions: any, requestId: string): Promise<boolean> {
  const threshold = conditions.threshold || 6
  const comparison = conditions.comparison || 'less_than'

  let query = supabase
    .from('sellers')
    .select('id, name, performance_score')
    .eq('status', 'active')

  if (comparison === 'less_than') {
    query = query.lt('performance_score', threshold)
  } else if (comparison === 'greater_than') {
    query = query.gt('performance_score', threshold)
  }

  const { data: lowQualitySellers, error } = await query

  if (error) {
    console.error(`❌ [${requestId}] Erro ao verificar score de qualidade:`, error)
    return false
  }

  const count = lowQualitySellers?.length || 0
  console.log(`📊 [${requestId}] Vendedores com score ${comparison} ${threshold}: ${count}`)
  
  return count > 0
}