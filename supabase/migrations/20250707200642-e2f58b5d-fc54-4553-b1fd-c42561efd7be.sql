-- Inserir Rodri.GO como assistente de IA especializado (com performance_score corrigido)
INSERT INTO sellers (
  id,
  name,
  email,
  phone,
  whatsapp_number,
  position,
  specialties,
  status,
  whapi_status,
  whapi_token,
  whapi_webhook_url,
  max_concurrent_clients,
  current_clients,
  performance_score,
  metadata
) VALUES (
  gen_random_uuid(),
  'Rodri.GO - Assistente de IA',
  'rodrigo.ai@drystore.com.br',
  '5194916150',
  '5194916150',
  'Assistente de Vendas com IA',
  ARRAY['transferencia_leads', 'notificacoes_vendedores', 'resumos_conversas'],
  'active',
  'active',
  'btKBR0RA85f24crA6MTOD9YR5BuAA7Yk',
  'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=rodrigo-ai',
  999,
  0,
  9.9, -- Performance corrigida para ficar dentro do limite
  jsonb_build_object(
    'is_ai_assistant', true,
    'role', 'lead_transfer_bot',
    'responsible_for', 'Transferência automatizada de leads para vendedores'
  )
) ON CONFLICT (whatsapp_number) DO UPDATE SET
  name = EXCLUDED.name,
  specialties = EXCLUDED.specialties,
  metadata = EXCLUDED.metadata,
  whapi_status = EXCLUDED.whapi_status,
  whapi_token = EXCLUDED.whapi_token,
  whapi_webhook_url = EXCLUDED.whapi_webhook_url,
  performance_score = EXCLUDED.performance_score,
  updated_at = NOW();

-- Verificar se foi inserido corretamente
SELECT 
  name, 
  whatsapp_number, 
  specialties,
  whapi_status,
  metadata->>'is_ai_assistant' as is_ai_bot,
  performance_score
FROM sellers 
WHERE name ILIKE '%rodri.go%' OR metadata->>'is_ai_assistant' = 'true';