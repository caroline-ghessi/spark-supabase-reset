-- Corrigir trigger de sincronização e função principal
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

-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_sync_vendor_messages ON vendor_whatsapp_messages;
CREATE TRIGGER trigger_sync_vendor_messages
  AFTER INSERT ON vendor_whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_vendor_message_to_messages();

-- Função de sincronização retroativa corrigida
CREATE OR REPLACE FUNCTION sync_all_pending_messages()
RETURNS TABLE(
  total_processed BIGINT,
  successfully_synced BIGINT,
  already_existed BIGINT,
  errors_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count BIGINT := 0;
  synced_count BIGINT := 0;
  existed_count BIGINT := 0;
  error_count BIGINT := 0;
  vendor_msg RECORD;
BEGIN
  -- Processar todas as mensagens vendor que não existem em messages
  FOR vendor_msg IN 
    SELECT vm.*, s.name as seller_name
    FROM vendor_whatsapp_messages vm
    LEFT JOIN sellers s ON s.id = vm.seller_id
    WHERE NOT EXISTS (
      SELECT 1 FROM messages m 
      WHERE m.whatsapp_message_id = vm.whapi_message_id
    )
    ORDER BY vm.sent_at ASC
  LOOP
    BEGIN
      processed_count := processed_count + 1;
      
      -- Verificar se conversa existe
      IF NOT EXISTS (SELECT 1 FROM conversations WHERE id = vendor_msg.conversation_id) THEN
        error_count := error_count + 1;
        CONTINUE;
      END IF;
      
      -- Inserir na tabela messages
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
        vendor_msg.conversation_id,
        CASE WHEN vendor_msg.is_from_seller THEN 'seller' ELSE 'client' END,
        CASE WHEN vendor_msg.is_from_seller THEN COALESCE(vendor_msg.seller_name, 'Vendedor') ELSE 'Cliente' END,
        COALESCE(vendor_msg.text_content, '[Mídia]'),
        vendor_msg.message_type,
        vendor_msg.media_url,
        vendor_msg.media_size,
        vendor_msg.whapi_message_id,
        COALESCE(vendor_msg.status, 'received'),
        vendor_msg.sent_at,
        jsonb_build_object(
          'vendor_message_id', vendor_msg.id,
          'seller_id', vendor_msg.seller_id,
          'source', 'whapi',
          'retroactive_sync', true,
          'synced_at', NOW()
        )
      )
      ON CONFLICT (whatsapp_message_id) DO NOTHING;
      
      -- Verificar se foi realmente inserido
      IF FOUND THEN
        synced_count := synced_count + 1;
      ELSE
        existed_count := existed_count + 1;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE NOTICE 'Erro ao sincronizar mensagem %: %', vendor_msg.id, SQLERRM;
    END;
    
    -- Log progresso a cada 100 mensagens
    IF processed_count % 100 = 0 THEN
      RAISE NOTICE 'Progresso: % processadas, % sincronizadas', processed_count, synced_count;
    END IF;
  END LOOP;
  
  RETURN QUERY
  SELECT 
    processed_count as total_processed,
    synced_count as successfully_synced,
    existed_count as already_existed,
    error_count as errors_count;
END;
$$;