-- Corrigir função de sincronização retroativa com melhor tratamento de erros
CREATE OR REPLACE FUNCTION sync_retroactive_messages_debug()
RETURNS TABLE(
  total_processed BIGINT,
  successfully_synced BIGINT,
  already_existed BIGINT,
  errors_count BIGINT,
  sample_errors TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  processed_count BIGINT := 0;
  synced_count BIGINT := 0;
  existed_count BIGINT := 0;
  error_count BIGINT := 0;
  vendor_msg RECORD;
  error_messages TEXT[] := '{}';
  current_error TEXT;
BEGIN
  -- Processar mensagens vendor que não existem em messages (últimas 24h apenas)
  FOR vendor_msg IN 
    SELECT vm.*, s.name as seller_name
    FROM vendor_whatsapp_messages vm
    LEFT JOIN sellers s ON s.id = vm.seller_id
    WHERE vm.created_at > NOW() - INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM messages m 
        WHERE m.whatsapp_message_id = vm.whapi_message_id
      )
    ORDER BY vm.sent_at ASC
    LIMIT 100  -- Limitar para teste
  LOOP
    BEGIN
      processed_count := processed_count + 1;
      
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
      );
      
      -- Se chegou aqui, foi inserido com sucesso
      synced_count := synced_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      current_error := SQLERRM;
      
      -- Guardar até 10 erros únicos
      IF NOT (current_error = ANY(error_messages)) AND array_length(error_messages, 1) < 10 THEN
        error_messages := array_append(error_messages, current_error);
      END IF;
      
      RAISE NOTICE 'Erro ao sincronizar mensagem %: %', vendor_msg.id, current_error;
    END;
  END LOOP;
  
  RETURN QUERY
  SELECT 
    processed_count as total_processed,
    synced_count as successfully_synced,
    existed_count as already_existed,
    error_count as errors_count,
    error_messages as sample_errors;
END;
$$;