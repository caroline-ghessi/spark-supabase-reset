-- Inserir uma mensagem manual para detectar o problema específico
DO $$
DECLARE
  test_conversation_id UUID := '5a783441-2d5c-4928-8bf2-3fe721e30fc8';
  test_whapi_id TEXT := 'hjYQ5C7AYml3yZAHDJeQRg-kn8Bq52OYdX9Fw-gZH5XOM';
  error_msg TEXT;
BEGIN
  -- Verificar se a conversa existe
  IF NOT EXISTS (SELECT 1 FROM conversations WHERE id = test_conversation_id) THEN
    RAISE NOTICE 'Conversa % não existe', test_conversation_id;
    RETURN;
  END IF;
  
  -- Verificar se a mensagem já existe
  IF EXISTS (SELECT 1 FROM messages WHERE whatsapp_message_id = test_whapi_id) THEN
    RAISE NOTICE 'Mensagem % já existe na tabela messages', test_whapi_id;
    RETURN;
  END IF;
  
  -- Tentar inserir
  BEGIN
    INSERT INTO messages (
      conversation_id,
      sender_type,
      sender_name,
      content,
      message_type,
      whatsapp_message_id,
      status,
      created_at,
      metadata
    ) VALUES (
      test_conversation_id,
      'client',
      'Cliente',
      'Aí é um papo de mestre p/ mestre.',
      'text',
      test_whapi_id,
      'received',
      '2025-07-07 23:51:14+00',
      jsonb_build_object(
        'vendor_message_id', '21d08a0b-ed62-489a-b911-29051b797f4b',
        'seller_id', '30a1c16b-8aea-4451-8b0f-f7af0dc6bafe',
        'source', 'whapi',
        'test_sync', true
      )
    );
    
    RAISE NOTICE 'Mensagem inserida com sucesso!';
    
  EXCEPTION WHEN OTHERS THEN
    error_msg := SQLERRM;
    RAISE NOTICE 'ERRO ao inserir: %', error_msg;
  END;
END $$;