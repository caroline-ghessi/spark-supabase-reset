
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

    // Buscar conversa
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .single()

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversa não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enviar mensagem
    const result = await sendWhatsAppMessage({
      to: conversation.client_phone,
      text: message,
      media: media
    })

    if (result.success) {
      // Salvar mensagem no banco
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversation_id,
          sender_type: 'operator',
          sender_name: 'Carol',
          content: message,
          message_type: media ? media.type : 'text',
          file_url: media?.id || null,
          whatsapp_message_id: result.message_id,
          status: 'sent'
        })

      // Atualizar status da conversa para 'manual'
      await supabase
        .from('conversations')
        .update({
          status: 'manual',
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation_id)

      return new Response(
        JSON.stringify({ success: true, message_id: result.message_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })

    const result = await response.json()

    if (response.ok) {
      return { success: true, message_id: result.messages[0].id }
    } else {
      throw new Error(result.error?.message || 'Erro ao enviar mensagem')
    }

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return { success: false, error: error.message }
  }
}
