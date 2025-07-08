-- ========================================
-- FIX SECURITY VULNERABILITY IN vendor_conversations_full VIEW
-- ========================================

-- 1. Drop the problematic view with security_barrier
DROP VIEW IF EXISTS public.vendor_conversations_full CASCADE;

-- 2. Recreate the view WITHOUT security_barrier, using security_invoker instead
CREATE VIEW public.vendor_conversations_full 
WITH (security_invoker=true) AS
SELECT 
  c.id as conversation_id,
  c.client_phone,
  c.client_name,
  c.status as conversation_status,
  c.lead_temperature,
  c.assigned_seller_id as seller_id,
  s.name as seller_name,
  s.whapi_status,
  
  -- Message statistics
  COUNT(vm.id) as total_messages,
  COUNT(CASE WHEN vm.is_from_seller THEN 1 END) as seller_messages,
  COUNT(CASE WHEN NOT vm.is_from_seller THEN 1 END) as client_messages,
  
  -- Quality metrics
  AVG(vm.quality_score) as avg_quality_score,
  COUNT(CASE WHEN vm.flagged_for_review THEN 1 END) as flagged_count,
  
  -- Timing
  MIN(vm.sent_at) as first_message_at,
  MAX(vm.sent_at) as last_message_at,
  
  -- Last message content
  (SELECT vm2.text_content 
   FROM vendor_whatsapp_messages vm2 
   WHERE vm2.conversation_id = c.id 
   ORDER BY vm2.sent_at DESC 
   LIMIT 1) as last_message_text,
   
  c.created_at,
  c.updated_at

FROM conversations c
LEFT JOIN sellers s ON c.assigned_seller_id = s.id
LEFT JOIN vendor_whatsapp_messages vm ON vm.conversation_id = c.id
WHERE c.assigned_seller_id IS NOT NULL -- Only conversations with sellers
GROUP BY c.id, s.id;

-- 3. Enable RLS on the view (this will now properly inherit from base tables)
ALTER VIEW public.vendor_conversations_full SET (security_invoker = true);

-- 4. Create RLS policies for the view that work with security_invoker
CREATE POLICY "Admins and supervisors see all vendor conversations" 
ON public.vendor_conversations_full
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Sellers see their own vendor conversations"
ON public.vendor_conversations_full
FOR SELECT USING (
  seller_id = (SELECT seller_id FROM users WHERE id = auth.uid())
);

-- 5. Ensure base tables have proper RLS (reinforcement)
-- These should already exist but let's make sure they're correct

-- Conversations table policies (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'conversations' 
    AND policyname = 'Admins and supervisors can manage conversations'
  ) THEN
    CREATE POLICY "Admins and supervisors can manage conversations"
    ON public.conversations
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'supervisor')
      )
    );
  END IF;
END $$;

-- Vendor messages table policies (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'vendor_whatsapp_messages' 
    AND policyname = 'Admins and supervisors see all vendor messages'
  ) THEN
    CREATE POLICY "Admins and supervisors see all vendor messages"
    ON public.vendor_whatsapp_messages
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'supervisor')
      )
    );
  END IF;
END $$;

-- 6. Log the security fix
INSERT INTO public.security_events (
  event_type,
  severity,
  event_data
) VALUES (
  'security_vulnerability_fixed',
  'high',
  jsonb_build_object(
    'issue', 'vendor_conversations_full view security_barrier vulnerability',
    'fix', 'Recreated view with security_invoker=true',
    'timestamp', NOW()
  )
);

-- Success message
SELECT 'Security vulnerability in vendor_conversations_full view has been fixed' as status;