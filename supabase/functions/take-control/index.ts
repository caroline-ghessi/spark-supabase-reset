
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversation_id } = await req.json()

    // Atualizar status da conversa
    const { data, error } = await supabase
      .from('conversations')
      .update({
        status: 'manual',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id)
      .select()

    if (error) {
      throw error
    }

    // Criar notificação de controle assumido
    await supabase
      .from('notifications')
      .insert({
        type: 'control_taken',
        title: 'Controle Assumido',
        message: 'Carol assumiu o controle da conversa',
        priority: 'normal',
        conversation_id: conversation_id,
        context: {
          taken_at: new Date().toISOString(),
          operator: 'Carol'
        }
      })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro ao assumir controle:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
