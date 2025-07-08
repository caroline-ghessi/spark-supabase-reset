-- Expandir constraint de tipos de mensagem para aceitar todos os tipos do WhatsApp
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE messages ADD CONSTRAINT messages_message_type_check 
CHECK (message_type IN (
  'text', 'image', 'video', 'audio', 'document', 'location', 'contact',
  'voice', 'sticker', 'link_preview', 'action', 'unknown'
));

-- Criar função para mapear tipos de mensagem do WhatsApp
CREATE OR REPLACE FUNCTION map_whatsapp_message_type(vendor_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mapear tipos específicos do WhatsApp para tipos padrão
  CASE vendor_type
    WHEN 'voice' THEN RETURN 'audio';
    WHEN 'unknown' THEN RETURN 'text';
    ELSE RETURN vendor_type;
  END CASE;
END;
$$;

-- Sincronizar todas as mensagens perdidas com mapeamento correto
CREATE OR REPLACE FUNCTION sync_all_vendor_messages()
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
        COALESCE(vendor_msg.text_content, vendor_msg.caption, '[Mídia]'),
        map_whatsapp_message_type(vendor_msg.message_type),
        vendor_msg.media_url,
        vendor_msg.media_size,
        vendor_msg.whapi_message_id,
        COALESCE(vendor_msg.status, 'received'),
        vendor_msg.sent_at,
        jsonb_build_object(
          'vendor_message_id', vendor_msg.id,
          'seller_id', vendor_msg.seller_id,
          'source', 'whapi',
          'media_duration', vendor_msg.media_duration,
          'media_mime_type', vendor_msg.media_mime_type,
          'thumbnail_url', vendor_msg.thumbnail_url,
          'caption', vendor_msg.caption,
          'retroactive_sync', true,
          'synced_at', NOW()
        )
      );
      
      synced_count := synced_count + 1;
      
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