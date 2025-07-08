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

  try {
    console.log('🔄 Testando envio de mensagem via Rodri.GO para Sérgio')
    
    // Chamar a função rodrigo-send-message
    const { data, error } = await supabase.functions.invoke('rodrigo-send-message', {
      body: {
        to_number: '5551814233105',
        message: '🔄 TESTE DE RECONEXÃO - Sistema Rodri.GO funcionando corretamente! ✅\n\nSe você recebeu esta mensagem, o sistema está operacional.',
        context_type: 'test'
      }
    })

    if (error) {
      console.error('❌ Erro ao chamar rodrigo-send-message:', error)
      throw error
    }

    console.log('✅ Resposta da função:', data)

    return new Response(JSON.stringify({
      success: true,
      message: 'Teste enviado com sucesso',
      response: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})