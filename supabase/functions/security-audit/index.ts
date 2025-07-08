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

    const { action, userId, sessionInfo } = await req.json()

    // Validate session integrity
    if (action === 'validate_session') {
      const { data: user, error } = await supabaseClient.auth.admin.getUserById(userId)
      
      if (error || !user) {
        return new Response(JSON.stringify({ 
          valid: false, 
          reason: 'User not found' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check for suspicious activity patterns
      const suspiciousActivities = []
      
      if (sessionInfo?.loginTime && Date.now() - sessionInfo.loginTime > 8 * 60 * 60 * 1000) {
        suspiciousActivities.push('session_too_long')
      }
      
      if (sessionInfo?.ipAddress && sessionInfo.ipAddress !== req.headers.get('x-forwarded-for')) {
        suspiciousActivities.push('ip_address_change')
      }

      // Log security audit
      await supabaseClient.from('audit_logs').insert({
        resource_type: 'session',
        action: 'security_audit',
        user_id: userId,
        metadata: {
          suspiciousActivities,
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for'),
          timestamp: new Date().toISOString()
        }
      })

      return new Response(JSON.stringify({ 
        valid: suspiciousActivities.length === 0,
        warnings: suspiciousActivities 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Rate limiting check
    if (action === 'check_rate_limit') {
      const { email } = sessionInfo
      
      // Check recent failed login attempts
      const { data: recentAttempts } = await supabaseClient
        .from('audit_logs')
        .select('created_at')
        .eq('resource_type', 'auth')
        .eq('action', 'LOGIN_FAILED')
        .eq('metadata->email', email)
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())

      const attemptCount = recentAttempts?.length || 0
      const isBlocked = attemptCount >= 5

      return new Response(JSON.stringify({ 
        blocked: isBlocked,
        attempts: attemptCount,
        resetTime: isBlocked ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Security audit error:', error)
    return new Response(JSON.stringify({ 
      error: 'Security audit failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

console.log('🔐 Security Audit Function started')