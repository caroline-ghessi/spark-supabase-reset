
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

    const { conversation_id, message, media } = await req.json()

    console.log('📤 Enviando mensagem manual:', { conversation_id, message: message?.substring(0, 50) })

    // Buscar conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .single()

    if (convError || !conversation) {
      console.error('❌ Conversa não encontrada:', convError)
      return new Response(
        JSON.stringify({ error: 'Conversa não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar mensagem via WhatsApp
    const result = await sendWhatsAppMessage({
      to: conversation.client_phone,
      text: message,
      media: media
    })

    if (result.success) {
      console.log('✅ Mensagem enviada via WhatsApp:', result.message_id)
      
      // Salvar mensagem no banco usando 'admin' em vez de 'operator'
      const { data: savedMessage, error: saveError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation_id,
          sender_type: 'admin',
          sender_name: 'Operador',
          content: message,
          message_type: media ? media.type : 'text',
          file_url: media?.id || null,
          whatsapp_message_id: result.message_id,
          status: 'sent'
        })
        .select()
        .single()

      if (saveError) {
        console.error('❌ Erro ao salvar mensagem:', saveError)
      } else {
        console.log('✅ Mensagem salva no banco:', savedMessage.id)
      }

      // Atualizar status da conversa para 'manual'
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          status: 'manual',
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversation_id)

      if (updateError) {
        console.error('❌ Erro ao atualizar conversa:', updateError)
      } else {
        console.log('✅ Conversa atualizada para status manual')
      }

      return new Response(
        JSON.stringify({ success: true, message_id: result.message_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('❌ Erro ao enviar mensagem:', result.error)
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Erro no envio de mensagem:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendWhatsAppMessage({ to, text, media = null }: any) {
  try {
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
    
    if (!phoneNumberId || !accessToken) {
      console.error('❌ Credenciais do WhatsApp não configuradas')
      return { success: false, error: 'Credenciais não configuradas' }
    }
    
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`

    let messageData: any

    if (media) {
      messageData = {
        messaging_product: 'whatsapp',
        to: to,
        type: media.type,
        [media.type]: {
          id: media.id,
          caption: text || ''
        }
      }
    } else {
      messageData = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: text
        }
      }
    }

    console.log('📤 Dados da mensagem WhatsApp:', messageData)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()
    
    console.log('📤 Resposta WhatsApp API:', result)

    if (response.ok && result.messages && result.messages[0]) {
      return { success: true, message_id: result.messages[0].id }
    } else {
      console.error('❌ Erro na API do WhatsApp:', result)
      return { success: false, error: result.error?.message || 'Erro desconhecido' }
    }

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

console.log('📤 Send WhatsApp Message Function iniciada!')
