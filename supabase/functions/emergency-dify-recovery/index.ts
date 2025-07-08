import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  console.log('🚨 Emergency Dify Recovery DESABILITADO')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Sistema de recovery desabilitado - Dify tem controle total
  return new Response(JSON.stringify({
    status: 'disabled',
    message: 'Sistema de recovery automático foi desabilitado. Dify tem controle total das conversas.',
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})

console.log('🚨 Emergency Dify Recovery Function DESABILITADA - Dify controla todas as respostas!')