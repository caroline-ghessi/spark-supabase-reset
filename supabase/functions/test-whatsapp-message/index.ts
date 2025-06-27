
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { phone, name, message } = await req.json()
    
    if (!phone || !message) {
      return new Response('Phone and message are required', {
        status: 400,
        headers: corsHeaders
      })
    }

    // Criar payload simulado do WhatsApp
    const webhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "test-entry-id",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "5511999999999",
                  phone_number_id: "test-phone-id"
                },
                contacts: [
                  {
                    profile: {
                      name: name || "Cliente Teste"
                    },
                    wa_id: phone
                  }
                ],
                messages: [
                  {
                    from: phone,
                    id: `test-msg-${Date.now()}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    text: {
                      body: message
                    },
                    type: "text"
                  }
                ]
              },
              field: "messages"
            }
          ]
        }
      ]
    }

    console.log('🧪 Enviando mensagem de teste:', JSON.stringify(webhookPayload, null, 2))

    // Chamar o webhook do WhatsApp
    const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-webhook`
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify(webhookPayload)
    })

    const responseText = await response.text()
    
    console.log('📞 Resposta do webhook:', {
      status: response.status,
      response: responseText
    })

    return new Response(JSON.stringify({
      success: true,
      webhook_status: response.status,
      webhook_response: responseText,
      test_payload: webhookPayload
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🧪 Test WhatsApp Message Function iniciada!')
