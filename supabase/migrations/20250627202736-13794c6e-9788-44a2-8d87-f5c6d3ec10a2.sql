
-- Dropar a função existente com conflito de tipos
DROP FUNCTION IF EXISTS public.get_messages(text);

-- Recriar a função com o tipo correto (integer em vez de bigint)
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
  file_size INTEGER,
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
    m.file_size::INTEGER,
    m.whatsapp_message_id::TEXT,
    m.status::TEXT,
    m.metadata,
    m.created_at
  FROM messages m
  WHERE m.conversation_id::TEXT = conv_id
  ORDER BY m.created_at ASC;
END;
$$;
