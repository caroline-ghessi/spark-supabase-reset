-- Função para sincronização retroativa segura de mensagens
CREATE OR REPLACE FUNCTION sync_retroactive_messages()
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
  seller_name_var TEXT;
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
      
      -- Verificar se foi inserido
      IF FOUND THEN
        synced_count := synced_count + 1;
      ELSE
        existed_count := existed_count + 1;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE NOTICE 'Erro ao sincronizar mensagem %: %', vendor_msg.id, SQLERRM;
    END;
    
    -- Log progresso a cada 1000 mensagens
    IF processed_count % 1000 = 0 THEN
      RAISE NOTICE 'Progresso: % processadas, % sincronizadas, % já existiam, % erros', 
        processed_count, synced_count, existed_count, error_count;
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

-- Executar a sincronização retroativa
SELECT * FROM sync_retroactive_messages();