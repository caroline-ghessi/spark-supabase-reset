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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID().substring(0, 8)
  console.log(`🔄 [${requestId}] Reenviando transfers falhadas`)

  try {
    // 1. Buscar transfers com whapi_message_id NULL das últimas 24h
    const { data: failedLogs, error: logsError } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('context_type', 'notification')
      .is('whapi_message_id', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (logsError) {
      throw new Error(`Erro ao buscar logs falhados: ${logsError.message}`)
    }

    console.log(`📊 [${requestId}] Encontrados ${failedLogs?.length || 0} envios falhados`)

    if (!failedLogs || failedLogs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Nenhum envio falhado encontrado',
        resent_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Reenviar cada mensagem falhada
    const results = []
    for (const failedLog of failedLogs) {
      try {
        console.log(`🔄 [${requestId}] Reenviando para: ${failedLog.recipient_number}`)
        
        const { data: resendResult, error: resendError } = await supabase.functions.invoke('rodrigo-send-message', {
          body: {
            to_number: failedLog.recipient_number,
            message: failedLog.message_content,
            context_type: 'resend_notification',
            metadata: {
              original_log_id: failedLog.id,
              resend_reason: 'failed_whapi_message_id',
              original_timestamp: failedLog.created_at,
              ...failedLog.metadata
            }
          }
        })

        if (resendError) {
          console.error(`❌ [${requestId}] Erro ao reenviar para ${failedLog.recipient_number}:`, resendError)
          results.push({
            recipient: failedLog.recipient_number,
            status: 'failed',
            error: resendError.message,
            original_log_id: failedLog.id
          })
        } else {
          console.log(`✅ [${requestId}] Reenviado com sucesso para ${failedLog.recipient_number}`)
          results.push({
            recipient: failedLog.recipient_number,
            status: 'success',
            whapi_message_id: resendResult.whapi_message_id,
            original_log_id: failedLog.id
          })
        }

        // Aguardar 1 segundo entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ [${requestId}] Erro crítico ao reenviar:`, error)
        results.push({
          recipient: failedLog.recipient_number,
          status: 'critical_error',
          error: error.message,
          original_log_id: failedLog.id
        })
      }
    }

    // 3. Estatísticas finais
    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status !== 'success').length

    console.log(`📊 [${requestId}] Reenvio concluído: ${successCount} sucessos, ${failedCount} falhas`)

    // 4. Criar log de resumo
    await supabase
      .from('communication_logs')
      .insert({
        sender_name: 'Sistema',
        recipient_number: 'admin',
        message_content: `Reenvio de transfers falhadas: ${successCount} sucessos, ${failedCount} falhas`,
        context_type: 'resend_summary',
        status: 'completed',
        metadata: {
          total_processed: results.length,
          success_count: successCount,
          failed_count: failedCount,
          results: results,
          request_id: requestId
        }
      })

    return new Response(JSON.stringify({
      success: true,
      total_processed: results.length,
      success_count: successCount,
      failed_count: failedCount,
      results: results,
      message: `Reenvio concluído: ${successCount}/${results.length} sucessos`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error(`❌ [${requestId}] Erro no reenvio:`, error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      request_id: requestId
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})