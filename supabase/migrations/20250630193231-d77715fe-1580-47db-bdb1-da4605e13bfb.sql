
-- Configurar dados do Felipe para integração Whapi
UPDATE sellers 
SET 
  whatsapp_number = '5181252666',
  whapi_token = '2sncDDlg9LmTxq35wSJjI0XX939ZIz33',
  whapi_instance_id = 'felipe_instance',
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=felipe',
  whapi_status = 'active',
  status = 'active',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{whapi_api_url}',
    '"https://gate.whapi.cloud/"'
  ),
  updated_at = NOW()
WHERE name ILIKE '%felipe%' OR whatsapp_number = '5551812526166' OR whatsapp_number = '5181252666';

-- Se o Felipe não existir, criar o registro
INSERT INTO sellers (
  name,
  email,
  phone,
  whatsapp_number,
  position,
  whapi_token,
  whapi_instance_id,
  whapi_webhook_url,
  whapi_status,
  status,
  specialties,
  metadata
) 
SELECT 
  'Felipe',
  'felipe@empresa.com',
  '+55 51 81252666',
  '5181252666',
  'Vendedor de Construção Civil - Especialista em Prazo',
  '2sncDDlg9LmTxq35wSJjI0XX939ZIz33',
  'felipe_instance',
  'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=felipe',
  'active',
  'active',
  ARRAY['construcao', 'telha_shingle', 'pisos', 'mantas', 'materiais_construcao'],
  '{"whapi_api_url": "https://gate.whapi.cloud/", "description": "Vendedor de construção civil especializado em perguntas de necessidade com foco em prazo", "spin_expertise": "Need-Payoff questions focused on deadline", "tendency": "fast_response", "specialty_focus": "need_questions", "performance_level": "excellent"}'
WHERE NOT EXISTS (
  SELECT 1 FROM sellers 
  WHERE name ILIKE '%felipe%' OR whatsapp_number = '5181252666'
);
