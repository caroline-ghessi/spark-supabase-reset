
-- Configurar dados do Luan para integração Whapi
UPDATE sellers 
SET 
  whatsapp_number = '5181423303',
  whapi_token = 'JHbMxeRdRNJbrIynnBT0rkDEBFRTwk5U',
  whapi_instance_id = 'luan_instance',
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=luan',
  whapi_status = 'active',
  status = 'active',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{whapi_api_url}',
    '"https://gate.whapi.cloud/"'
  ),
  updated_at = NOW()
WHERE name ILIKE '%luan%' OR whatsapp_number = '5181423303';

-- Se o Luan não existir, criar o registro
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
  'Luan',
  'luan@empresa.com',
  '+55 51 81423303',
  '5181423303',
  'Vendedor B2B - Materiais de Construção',
  'JHbMxeRdRNJbrIynnBT0rkDEBFRTwk5U',
  'luan_instance',
  'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=luan',
  'active',
  'active',
  ARRAY['construcao', 'materiais_construcao', 'vendas_b2b', 'telhas', 'pisos'],
  '{"whapi_api_url": "https://gate.whapi.cloud/", "description": "Vendedor B2B especializado em materiais de construção - telhas, pisos, acabamentos", "sales_type": "B2B", "territory": "construção civil"}'
WHERE NOT EXISTS (
  SELECT 1 FROM sellers 
  WHERE name ILIKE '%luan%' OR whatsapp_number = '5181423303'
);
