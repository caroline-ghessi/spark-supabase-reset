
-- Atualizar função get_conversations para aceitar parâmetro source_filter opcional
CREATE OR REPLACE FUNCTION public.get_conversations(source_filter text DEFAULT NULL)
 RETURNS TABLE(id text, client_phone text, client_name text, status text, lead_temperature text, source text, dify_conversation_id text, potential_value numeric, priority text, assigned_seller_id text, metadata jsonb, created_at timestamp with time zone, updated_at timestamp with time zone, closed_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::TEXT,
    c.client_phone::TEXT,
    c.client_name::TEXT,
    c.status::TEXT,
    c.lead_temperature::TEXT,
    c.source::TEXT,
    c.dify_conversation_id::TEXT,
    c.potential_value,
    c.priority::TEXT,
    c.assigned_seller_id::TEXT,
    c.metadata,
    c.created_at,
    c.updated_at,
    c.closed_at
  FROM conversations c
  WHERE c.status != 'closed'
    AND (source_filter IS NULL OR c.source = source_filter)
  ORDER BY c.updated_at DESC;
END;
$function$
