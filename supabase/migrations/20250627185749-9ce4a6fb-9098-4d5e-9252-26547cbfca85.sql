
-- Create function to get conversations with proper ordering and filtering
CREATE OR REPLACE FUNCTION get_conversations()
RETURNS TABLE (
  id TEXT,
  client_phone TEXT,
  client_name TEXT,
  status TEXT,
  lead_temperature TEXT,
  source TEXT,
  dify_conversation_id TEXT,
  potential_value NUMERIC,
  priority TEXT,
  assigned_seller_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
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
  ORDER BY c.updated_at DESC;
END;
$$;

-- Create function to get messages for a specific conversation
CREATE OR REPLACE FUNCTION get_messages(conv_id TEXT)
RETURNS TABLE (
  id TEXT,
  conversation_id TEXT,
  sender_type TEXT,
  sender_name TEXT,
  content TEXT,
  message_type TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  whatsapp_message_id TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id::TEXT,
    m.conversation_id::TEXT,
    m.sender_type::TEXT,
    m.sender_name::TEXT,
    m.content::TEXT,
    m.message_type::TEXT,
    m.file_url::TEXT,
    m.file_name::TEXT,
    m.file_size,
    m.whatsapp_message_id::TEXT,
    m.status::TEXT,
    m.metadata,
    m.created_at
  FROM messages m
  WHERE m.conversation_id::TEXT = conv_id
  ORDER BY m.created_at ASC;
END;
$$;
