
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  console.log(`🌐 ${req.method} ${req.url}`)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // GET - Verificação do webhook
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('🔍 Verificação webhook:', { mode, token, challenge })

      if (mode === 'subscribe' && challenge) {
        console.log('✅ Webhook verificado!')
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        })
      }

      return new Response('Missing parameters', {
        status: 400,
        headers: corsHeaders
      })
    }

    // POST - Processar mensagens
    if (req.method === 'POST') {
      const body = await req.json()
      console.log('📱 Webhook recebido:', JSON.stringify(body, null, 2))

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await processMessages(supabaseClient, change.value)
            }
          }
        }
      }

      return new Response('EVENT_RECEIVED', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function processMessages(supabase: any, messageData: any) {
  try {
    const { messages, contacts } = messageData

    if (!messages || messages.length === 0) {
      console.log('⚠️ Nenhuma mensagem no payload')
      return
    }

    for (const message of messages) {
      const clientPhone = message.from
      const clientName = contacts?.[0]?.profile?.name || 'Cliente'
      
      console.log(`👤 Processando mensagem de ${clientName} (${clientPhone})`)

      // 1. Buscar ou criar conversa
      let { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_phone', clientPhone)
        .neq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (convError || !conversation) {
        // Criar nova conversa
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_phone: clientPhone,
            client_name: clientName,
            status: 'bot',
            lead_temperature: 'cold',
            source: 'whatsapp'
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Erro ao criar conversa:', createError)
          continue
        }

        conversation = newConv
        console.log('✨ Nova conversa criada:', conversation.id)
      }

      // 2. Salvar mensagem
      const messageContent = message.text?.body || 'Mensagem não suportada'
      
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'client',
          sender_name: clientName,
          content: messageContent,
          message_type: 'text',
          whatsapp_message_id: message.id,
          status: 'received'
        })

      if (msgError) {
        console.error('❌ Erro ao salvar mensagem:', msgError)
        continue
      }

      console.log('💾 Mensagem salva com sucesso')

      // 3. Atualizar conversa
      await supabase
        .from('conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversation.id)

      // 4. Criar notificação
      await supabase
        .from('notifications')
        .insert({
          type: 'new_message',
          title: 'Nova Mensagem',
          message: `${clientName}: ${messageContent.substring(0, 50)}...`,
          priority: 'normal',
          context: {
            conversation_id: conversation.id,
            client_name: clientName,
            client_phone: clientPhone
          }
        })

      console.log('🔔 Notificação criada')
    }

  } catch (error) {
    console.error('❌ Erro no processamento:', error)
  }
}

console.log('🚀 Webhook function iniciada!')
