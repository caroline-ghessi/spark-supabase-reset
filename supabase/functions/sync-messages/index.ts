import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('🔄 Sync Messages Function iniciada!')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🔄 [${requestId}] ${req.method} ${req.url}`)

  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const body = await req.json()
    const { action = 'sync_missing', limit = 100 } = body

    console.log(`🔄 [${requestId}] Executando ação: ${action} com limite: ${limit}`)

    if (action === 'sync_missing') {
      return await syncMissingMessages(requestId, limit)
    } else if (action === 'stats') {
      return await getSyncStats(requestId)
    } else if (action === 'sync_all') {
      return await syncAllMessages(requestId, limit)
    } else {
      return new Response(JSON.stringify({ 
        error: 'Ação inválida',
        valid_actions: ['sync_missing', 'stats', 'sync_all']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Erro geral:`, error)
    return new Response(JSON.stringify({ 
      error: error.message,
      type: error.name,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function syncMissingMessages(requestId: string, limit: number) {
  console.log(`🔄 [${requestId}] Sincronizando mensagens em falta...`)

  try {
    // Buscar mensagens vendor das últimas 24h que não existem em messages - abordagem simplificada
    const { data: vendorMessages, error: vendorError } = await supabase
      .from('vendor_whatsapp_messages')
      .select(`
        *,
        sellers!inner(id, name)
      `)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('sent_at', { ascending: false })
      .limit(Math.min(limit, 100))

    if (vendorError) {
      console.error(`❌ [${requestId}] Erro ao buscar mensagens vendor:`, vendorError)
      throw vendorError
    }

    console.log(`📊 [${requestId}] Encontradas ${vendorMessages?.length || 0} mensagens para sincronizar`)

    if (!vendorMessages || vendorMessages.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Nenhuma mensagem para sincronizar',
        synced: 0,
        errors: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let synced = 0
    let errors = 0
    let skipped = 0

    // Sincronizar cada mensagem
    for (const vendorMsg of vendorMessages) {
      try {
        // Verificar se a mensagem já existe
        const { data: existingMessage } = await supabase
          .from('messages')
          .select('id')
          .eq('whatsapp_message_id', vendorMsg.whapi_message_id)
          .single()

        if (existingMessage) {
          skipped++
          continue
        }

        const unifiedMessageData = {
          conversation_id: vendorMsg.conversation_id,
          sender_type: vendorMsg.is_from_seller ? 'seller' : 'client',
          sender_name: vendorMsg.is_from_seller ? vendorMsg.sellers.name : 'Cliente',
          content: vendorMsg.text_content || '[Mídia]',
          message_type: vendorMsg.message_type,
          file_url: vendorMsg.media_url,
          file_name: null, // vendor não tem filename
          file_size: vendorMsg.media_size,
          whatsapp_message_id: vendorMsg.whapi_message_id,
          status: vendorMsg.status || 'received',
          created_at: vendorMsg.sent_at,
          metadata: {
            vendor_message_id: vendorMsg.id,
            seller_id: vendorMsg.seller_id,
            original_timestamp: vendorMsg.sent_at,
            source: 'whapi',
            edge_function_sync: true,
            synced_at: new Date().toISOString()
          }
        }

        const { error: insertError } = await supabase
          .from('messages')
          .insert(unifiedMessageData)

        if (insertError) {
          console.error(`❌ [${requestId}] Erro ao sincronizar mensagem ${vendorMsg.id}:`, insertError)
          errors++
        } else {
          console.log(`✅ [${requestId}] Sincronizada mensagem ${vendorMsg.id}`)
          synced++
        }

      } catch (msgError) {
        console.error(`❌ [${requestId}] Erro ao processar mensagem ${vendorMsg.id}:`, msgError)
        errors++
      }
    }

    console.log(`✅ [${requestId}] Sincronização concluída: ${synced} sucesso, ${skipped} puladas, ${errors} erros`)

    return new Response(JSON.stringify({ 
      message: 'Sincronização concluída',
      synced,
      skipped,
      errors,
      total_processed: vendorMessages.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro na sincronização:`, error)
    throw error
  }
}

async function getSyncStats(requestId: string) {
  console.log(`📊 [${requestId}] Obtendo estatísticas de sincronização...`)

  try {
    const { data: stats, error } = await supabase
      .rpc('get_message_sync_stats')

    if (error) {
      console.error(`❌ [${requestId}] Erro ao obter stats:`, error)
      throw error
    }

    const statsData = stats?.[0] || {}

    // Buscar conversas sem mensagens
    const { data: conversationsWithoutMessages, error: convError } = await supabase
      .rpc('test_conversations_without_messages')

    if (convError) {
      console.error(`❌ [${requestId}] Erro ao buscar conversas sem mensagens:`, convError)
    }

    return new Response(JSON.stringify({ 
      stats: statsData,
      conversations_without_messages: conversationsWithoutMessages || [],
      sync_health: {
        total_conversations: statsData.total_conversations,
        conversations_with_messages: statsData.conversations_with_messages,
        conversations_without_messages: statsData.conversations_without_messages,
        coverage_percentage: statsData.total_conversations > 0 
          ? Math.round((statsData.conversations_with_messages / statsData.total_conversations) * 100)
          : 0,
        vendor_messages_not_synced: statsData.total_vendor_messages - statsData.total_messages
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro ao obter estatísticas:`, error)
    throw error
  }
}

async function syncAllMessages(requestId: string, limit: number) {
  console.log(`🔄 [${requestId}] Sincronizando TODAS as mensagens (CUIDADO!)...`)

  try {
    // Primeiro limpar tabela messages de mensagens whapi duplicadas
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .not('whatsapp_message_id', 'is', null)
      .like('metadata->source', 'whapi')

    if (deleteError) {
      console.error(`❌ [${requestId}] Erro ao limpar mensagens duplicadas:`, deleteError)
    } else {
      console.log(`🧹 [${requestId}] Mensagens whapi antigas removidas da tabela messages`)
    }

    // Agora sincronizar todas as mensagens vendor
    return await syncMissingMessages(requestId, limit)

  } catch (error) {
    console.error(`❌ [${requestId}] Erro na sincronização completa:`, error)
    throw error
  }
}