-- Criar trigger para sincronização automática de mensagens
CREATE OR REPLACE FUNCTION sync_vendor_message_to_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  seller_name TEXT;
BEGIN
  -- Buscar nome do vendedor
  SELECT name INTO seller_name 
  FROM sellers 
  WHERE id = NEW.seller_id;

  -- Inserir na tabela messages automaticamente
  INSERT INTO messages (
    conversation_id,
    sender_type,
    sender_name,
    content,
    message_type,
    file_url,
    file_size,
    whatsapp_message_id,
    status,
    created_at,
    metadata
  ) VALUES (
    NEW.conversation_id,
    CASE WHEN NEW.is_from_seller THEN 'seller' ELSE 'client' END,
    CASE WHEN NEW.is_from_seller THEN COALESCE(seller_name, 'Vendedor') ELSE 'Cliente' END,
    COALESCE(NEW.text_content, '[Mídia]'),
    NEW.message_type,
    NEW.media_url,
    NEW.media_size,
    NEW.whapi_message_id,
    COALESCE(NEW.status, 'received'),
    NEW.sent_at,
    jsonb_build_object(
      'vendor_message_id', NEW.id,
      'seller_id', NEW.seller_id,
      'source', 'whapi',
      'auto_synced', true,
      'synced_at', NOW()
    )
  )
  ON CONFLICT (whatsapp_message_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para inserções na tabela vendor_whatsapp_messages
DROP TRIGGER IF EXISTS trigger_sync_vendor_messages ON vendor_whatsapp_messages;
CREATE TRIGGER trigger_sync_vendor_messages
  AFTER INSERT ON vendor_whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_vendor_message_to_messages();

-- Função para monitorar falhas de sincronização
CREATE OR REPLACE FUNCTION check_message_sync_health()
RETURNS TABLE(
  status TEXT,
  vendor_messages_count BIGINT,
  unified_messages_count BIGINT,
  missing_messages_count BIGINT,
  last_check TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  vendor_count BIGINT;
  unified_count BIGINT;
  missing_count BIGINT;
BEGIN
  -- Contar mensagens na tabela vendor
  SELECT COUNT(*) INTO vendor_count 
  FROM vendor_whatsapp_messages 
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  -- Contar mensagens na tabela unified com fonte whapi
  SELECT COUNT(*) INTO unified_count 
  FROM messages 
  WHERE created_at > NOW() - INTERVAL '24 hours'
    AND metadata->>'source' = 'whapi';
  
  -- Calcular mensagens em falta
  missing_count := vendor_count - unified_count;
  
  RETURN QUERY
  SELECT 
    CASE 
      WHEN missing_count = 0 THEN 'HEALTHY'
      WHEN missing_count < 10 THEN 'WARNING'
      ELSE 'CRITICAL'
    END as status,
    vendor_count as vendor_messages_count,
    unified_count as unified_messages_count,
    missing_count as missing_messages_count,
    NOW() as last_check;
END;
$$;