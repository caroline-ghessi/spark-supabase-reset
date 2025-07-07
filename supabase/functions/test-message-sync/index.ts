import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🧪 Test Message Sync Function iniciada!')

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🔍 [${requestId}] Testando sincronização de mensagens...`)

    // 1. Verificar conversas sem mensagens
    console.log(`📊 [${requestId}] Verificando conversas sem mensagens...`)
    const { data: conversationsWithoutMessages, error: convError } = await supabase
      .rpc('test_conversations_without_messages')

    if (convError) {
      console.error(`❌ [${requestId}] Erro ao verificar conversas:`, convError)
    } else {
      console.log(`📊 [${requestId}] Conversas sem mensagens:`, conversationsWithoutMessages?.length || 0)
    }

    // 2. Verificar mensagens vendor que não estão na tabela messages
    console.log(`📊 [${requestId}] Verificando mensagens vendor não sincronizadas...`)
    const { data: vendorMessages, error: vendorError } = await supabase
      .from('vendor_whatsapp_messages')
      .select(`
        id,
        conversation_id,
        whapi_message_id,
        text_content,
        is_from_seller,
        seller_id,
        sent_at
      `)
      .limit(10)

    if (vendorError) {
      console.error(`❌ [${requestId}] Erro ao buscar mensagens vendor:`, vendorError)
    } else {
      console.log(`📊 [${requestId}] Mensagens vendor encontradas:`, vendorMessages?.length || 0)

      // Para cada mensagem vendor, verificar se existe na tabela messages
      for (const vendorMsg of vendorMessages || []) {
        const { data: unifiedMsg, error: checkError } = await supabase
          .from('messages')
          .select('id')
          .eq('whatsapp_message_id', vendorMsg.whapi_message_id)
          .single()

        if (checkError && checkError.code === 'PGRST116') {
          console.log(`⚠️ [${requestId}] Mensagem vendor não encontrada na tabela unificada: ${vendorMsg.whapi_message_id}`)
          
          // Sincronizar esta mensagem
          const { data: seller } = await supabase
            .from('sellers')
            .select('name')
            .eq('id', vendorMsg.seller_id)
            .single()

          const syncData = {
            conversation_id: vendorMsg.conversation_id,
            sender_type: vendorMsg.is_from_seller ? 'seller' : 'client',
            sender_name: vendorMsg.is_from_seller ? (seller?.name || 'Vendedor') : 'Cliente',
            content: vendorMsg.text_content || '[Mídia]',
            message_type: 'text',
            whatsapp_message_id: vendorMsg.whapi_message_id,
            status: 'received',
            created_at: vendorMsg.sent_at,
            metadata: {
              synced_from_vendor: true,
              vendor_message_id: vendorMsg.id,
              seller_id: vendorMsg.seller_id
            }
          }

          const { data: syncedMsg, error: syncError } = await supabase
            .from('messages')
            .insert(syncData)
            .select()
            .single()

          if (syncError) {
            console.error(`❌ [${requestId}] Erro ao sincronizar mensagem:`, syncError)
          } else {
            console.log(`✅ [${requestId}] Mensagem sincronizada: ${syncedMsg.id}`)
          }
        }
      }
    }

    // 3. Estatísticas finais
    const { data: finalStats, error: statsError } = await supabase
      .rpc('get_message_sync_stats')

    if (statsError) {
      console.error(`❌ [${requestId}] Erro ao obter estatísticas:`, statsError)
    }

    const result = {
      success: true,
      message: 'Teste de sincronização concluído',
      stats: {
        conversations_without_messages: conversationsWithoutMessages?.length || 0,
        vendor_messages_found: vendorMessages?.length || 0,
        final_stats: finalStats
      }
    }

    console.log(`✅ [${requestId}] Teste concluído:`, result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro no teste:`, error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})