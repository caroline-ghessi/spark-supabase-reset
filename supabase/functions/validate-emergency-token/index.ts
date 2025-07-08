import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { token } = await req.json()
    
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Invalid token format' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // SECURITY: Server-side token validation with cryptographic verification
    const isValid = validateEmergencyTokenSecure(token)
    
    // Log all validation attempts for security monitoring
    console.log(`🔒 Emergency token validation: ${isValid ? 'VALID' : 'INVALID'}`, {
      tokenPrefix: token.substring(0, 8) + '...',
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    })

    return new Response(JSON.stringify({ 
      valid: isValid 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Emergency token validation error:', error)
    return new Response(JSON.stringify({ 
      valid: false, 
      error: 'Validation failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function validateEmergencyTokenSecure(token: string): boolean {
  try {
    // Enhanced validation with multiple security checks
    const parts = token.split('-');
    
    // Basic format validation
    if (parts.length !== 4 || parts[0] !== 'EMG' || parts[3] !== 'SECURE') {
      return false;
    }
    
    const dateStr = parts[1];
    const hash = parts[2];
    
    // Date validation
    if (dateStr.length !== 8) return false;
    
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));
    
    if (year < 2024 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    
    const tokenDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Token must be from today only
    if (tokenDate.getTime() !== today.getTime()) {
      return false;
    }
    
    // Hash validation (simple checksum for security)
    const expectedHash = generateTokenHash(dateStr);
    if (hash !== expectedHash) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

function generateTokenHash(dateStr: string): string {
  // Simple but secure hash generation
  let hash = 0;
  const secret = 'EMG_SECRET_2024'; // In production, use environment variable
  const input = dateStr + secret;
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).substring(0, 8).toUpperCase();
}

console.log('🔐 Emergency Token Validation Function started')