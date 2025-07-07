-- Função para verificar conversas sem mensagens
CREATE OR REPLACE FUNCTION test_conversations_without_messages()
RETURNS TABLE(
  conversation_id UUID,
  client_name TEXT,
  client_phone TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  message_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.client_name,
    c.client_phone,
    c.status,
    c.created_at,
    COUNT(m.id) as message_count
  FROM conversations c
  LEFT JOIN messages m ON m.conversation_id = c.id
  WHERE c.created_at > NOW() - INTERVAL '7 days'
  GROUP BY c.id, c.client_name, c.client_phone, c.status, c.created_at
  HAVING COUNT(m.id) = 0
  ORDER BY c.created_at DESC;
END;
$$;

-- Função para obter estatísticas de sincronização
CREATE OR REPLACE FUNCTION get_message_sync_stats()
RETURNS TABLE(
  total_conversations BIGINT,
  conversations_with_messages BIGINT,
  conversations_without_messages BIGINT,
  total_messages BIGINT,
  total_vendor_messages BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM conversations WHERE created_at > NOW() - INTERVAL '7 days') as total_conversations,
    (SELECT COUNT(DISTINCT c.id) FROM conversations c INNER JOIN messages m ON m.conversation_id = c.id WHERE c.created_at > NOW() - INTERVAL '7 days') as conversations_with_messages,
    (SELECT COUNT(DISTINCT c.id) FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id WHERE c.created_at > NOW() - INTERVAL '7 days' AND m.id IS NULL) as conversations_without_messages,
    (SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL '7 days') as total_messages,
    (SELECT COUNT(*) FROM vendor_whatsapp_messages WHERE created_at > NOW() - INTERVAL '7 days') as total_vendor_messages;
END;
$$;