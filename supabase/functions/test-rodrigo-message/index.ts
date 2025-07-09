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
    console.log('🧪 TESTE ISOLADO DO RODRI.GO - Iniciando...')
    
    // Validar número do Douglas na base de dados
    const { data: douglas, error: douglasError } = await supabase
      .from('sellers')
      .select('id, name, whatsapp_number')
      .eq('name', 'Douglas')
      .single()

    if (douglasError || !douglas) {
      console.error('❌ Douglas não encontrado na base de dados:', douglasError)
      throw new Error('Douglas não encontrado na base de dados')
    }

    console.log('👤 Dados do Douglas encontrados:', douglas)
    console.log('📞 Número do Douglas: ', douglas.whatsapp_number)
    console.log('📞 Tipo do número:', typeof douglas.whatsapp_number)
    console.log('📞 Comprimento do número:', douglas.whatsapp_number.length)
    
    // Validação detalhada do número
    const expectedNumber = '5551964943141'
    const isNumberCorrect = douglas.whatsapp_number === expectedNumber
    
    console.log('✅ Número correto?', isNumberCorrect)
    if (!isNumberCorrect) {
      console.log(`⚠️ Esperado: ${expectedNumber}`)
      console.log(`⚠️ Encontrado: ${douglas.whatsapp_number}`)
    }
    
    // Chamar a função rodrigo-send-message com teste específico
    console.log('🔄 Chamando rodrigo-send-message para Douglas...')
    
    const { data, error } = await supabase.functions.invoke('rodrigo-send-message', {
      body: {
        to_number: douglas.whatsapp_number,
        message: '🧪 TESTE ISOLADO RODRI.GO - Sistema funcionando corretamente!\n\nEste é um teste específico para validar o envio de mensagens.',
        context_type: 'isolated_test'
      }
    })

    if (error) {
      console.error('❌ Erro ao chamar rodrigo-send-message:', error)
      throw new Error(`Erro na função rodrigo-send-message: ${JSON.stringify(error)}`)
    }

    console.log('✅ Resposta da função rodrigo-send-message:', data)

    // Verificar se a mensagem foi registrada nos logs
    console.log('🔍 Verificando communication_logs...')
    
    const { data: logs, error: logsError } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('recipient_number', douglas.whatsapp_number)
      .eq('context_type', 'isolated_test')
      .order('created_at', { ascending: false })
      .limit(1)

    if (logsError) {
      console.error('❌ Erro ao buscar logs:', logsError)
    } else if (logs && logs.length > 0) {
      console.log('📝 Log encontrado:', logs[0])
    } else {
      console.log('⚠️ Nenhum log encontrado para esta mensagem')
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Teste isolado executado com sucesso',
      douglas_data: douglas,
      number_validation: {
        expected: expectedNumber,
        found: douglas.whatsapp_number,
        is_correct: isNumberCorrect
      },
      rodrigo_response: data,
      communication_logs: logs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no teste isolado:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})