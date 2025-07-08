-- Sincronizar apenas mensagens das últimas 24h em lotes pequenos
CREATE OR REPLACE FUNCTION sync_recent_messages_batch()
RETURNS TABLE(
  batch_processed BIGINT,
  batch_synced BIGINT,
  batch_errors BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count BIGINT := 0;
  synced_count BIGINT := 0;
  error_count BIGINT := 0;
  vendor_msg RECORD;
BEGIN
  -- Processar apenas 50 mensagens das últimas 24h
  FOR vendor_msg IN 
    SELECT vm.*, s.name as seller_name
    FROM vendor_whatsapp_messages vm
    LEFT JOIN sellers s ON s.id = vm.seller_id
    WHERE vm.created_at > NOW() - INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM messages m 
        WHERE m.whatsapp_message_id = vm.whapi_message_id
      )
    ORDER BY vm.sent_at DESC
    LIMIT 50
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
          'batch_sync', true,
          'synced_at', NOW()
        )
      );
      
      synced_count := synced_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE NOTICE 'Erro na mensagem %: %', vendor_msg.whapi_message_id, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT processed_count, synced_count, error_count;
END;
$$;