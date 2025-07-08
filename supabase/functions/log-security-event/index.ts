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

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { eventType, severity, message, details } = await req.json()

    // Validate input
    if (!eventType || !message) {
      return new Response(JSON.stringify({ 
        error: 'eventType and message are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user info from Authorization header
    const authHeader = req.headers.get('Authorization')
    let userId = null
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser(
          authHeader.replace('Bearer ', '')
        )
        userId = user?.id
      } catch (error) {
        console.warn('Could not extract user from auth header:', error)
      }
    }

    // Insert security event
    const { data, error } = await supabaseClient
      .from('security_events')
      .insert({
        event_type: eventType,
        severity: severity || 'medium',
        user_id: userId,
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        event_data: details || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ 
        error: 'Failed to log security event' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`🔒 Security event logged: ${eventType} (${severity})`)

    return new Response(JSON.stringify({ 
      success: true,
      eventId: data.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Security logging error:', error)
    return new Response(JSON.stringify({ 
      error: 'Security event logging failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🔐 Security Event Logging Function started')