-- ========================================
-- SECURITY HARDENING - CRITICAL FIXES
-- ========================================

-- 1. Create comprehensive security audit table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  event_data JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can manage security events"
ON public.security_events
FOR ALL
USING (has_role('admin'));

-- 2. Strengthen RLS on users table
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Admins can manage users"
ON public.users
FOR ALL 
USING (has_role('admin'));

-- 3. Add missing RLS policy for whapi_sync_logs
CREATE POLICY "System can insert sync logs"
ON public.whapi_sync_logs
FOR INSERT
WITH CHECK (true);

-- 4. Secure vendor_whatsapp_messages with stricter policies
DROP POLICY IF EXISTS "System can insert messages" ON public.vendor_whatsapp_messages;
CREATE POLICY "Authenticated system can insert vendor messages"
ON public.vendor_whatsapp_messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR current_setting('role') = 'service_role');

-- 5. Add security functions for validation
CREATE OR REPLACE FUNCTION public.validate_user_session()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  last_activity TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user exists and is active
  SELECT updated_at INTO last_activity
  FROM public.users 
  WHERE id = current_user_id;
  
  IF last_activity IS NULL THEN
    RETURN false;
  END IF;
  
  -- Session valid if user was active in last 24 hours
  RETURN (NOW() - last_activity) < INTERVAL '24 hours';
END;
$$;

-- 6. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  severity TEXT DEFAULT 'medium',
  event_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    severity,
    user_id,
    event_data
  ) VALUES (
    event_type,
    severity,
    auth.uid(),
    event_data
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 7. Add triggers for automatic security logging
CREATE OR REPLACE FUNCTION public.log_user_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log role changes as high severity
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    PERFORM public.log_security_event(
      'user_role_change',
      'high',
      jsonb_build_object(
        'user_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS security_log_user_changes ON public.users;
CREATE TRIGGER security_log_user_changes
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_changes();

-- 8. Add constraint to prevent multiple admin users (security measure)
CREATE OR REPLACE FUNCTION public.validate_admin_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Only allow maximum 3 admin users
  SELECT COUNT(*) INTO admin_count
  FROM public.users
  WHERE role = 'admin';
  
  IF NEW.role = 'admin' AND admin_count >= 3 THEN
    RAISE EXCEPTION 'Maximum number of admin users (3) reached. Security restriction.';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_admin_count_trigger ON public.users;
CREATE TRIGGER validate_admin_count_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.validate_admin_count();

-- 9. Create secure session validation view
CREATE OR REPLACE VIEW public.user_security_status AS
SELECT 
  u.id,
  u.email,
  u.role,
  u.updated_at as last_activity,
  CASE 
    WHEN (NOW() - u.updated_at) > INTERVAL '24 hours' THEN 'expired'
    WHEN (NOW() - u.updated_at) > INTERVAL '8 hours' THEN 'warning'
    ELSE 'active'
  END as session_status,
  (
    SELECT COUNT(*) 
    FROM public.security_events se 
    WHERE se.user_id = u.id 
    AND se.severity IN ('high', 'critical')
    AND se.created_at > NOW() - INTERVAL '7 days'
    AND NOT se.resolved
  ) as unresolved_security_events
FROM public.users u;

-- RLS for security status view
ALTER VIEW public.user_security_status SET (security_invoker = true);

-- 10. Indexes for performance and security monitoring
CREATE INDEX IF NOT EXISTS idx_security_events_user_severity 
ON public.security_events(user_id, severity, created_at);

CREATE INDEX IF NOT EXISTS idx_security_events_type_time 
ON public.security_events(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_security 
ON public.audit_logs(resource_type, action, created_at) 
WHERE resource_type IN ('auth', 'session', 'user');

-- 11. Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email, IP, etc.
  limit_type TEXT NOT NULL, -- 'login', 'api_call', etc.
  attempts INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_rate_limits_unique 
ON public.rate_limits(identifier, limit_type);

-- RLS for rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage rate limits"
ON public.rate_limits
FOR ALL
USING (current_setting('role') = 'service_role' OR has_role('admin'));

-- Success message
SELECT 'Security hardening migration completed successfully' as status;