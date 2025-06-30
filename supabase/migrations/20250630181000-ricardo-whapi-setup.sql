
-- Configurar dados do Ricardo para integração Whapi
UPDATE sellers 
SET 
  whatsapp_number = '5194916150',
  whapi_token = 'btKBR0RA85f24crA6MTOD9YR5BuAA7Yk',
  whapi_instance_id = 'ricardo_instance',
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=ricardo',
  whapi_status = 'active',
  status = 'active',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{whapi_api_url}',
    '"https://gate.whapi.cloud/"'
  ),
  updated_at = NOW()
WHERE name ILIKE '%ricardo%' OR whatsapp_number = '5194916150';

-- Se o Ricardo não existir, criar o registro
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
  'Ricardo',
  'ricardo@empresa.com',
  '+55 51 94916150',
  '5194916150',
  'Vendedor de Energia Solar',
  'btKBR0RA85f24crA6MTOD9YR5BuAA7Yk',
  'ricardo_instance',
  'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=ricardo',
  'active',
  'active',
  ARRAY['energia_solar', 'sustentabilidade'],
  '{"whapi_api_url": "https://gate.whapi.cloud/", "description": "Vendedor especializado em energia solar e soluções sustentáveis"}'
WHERE NOT EXISTS (
  SELECT 1 FROM sellers 
  WHERE name ILIKE '%ricardo%' OR whatsapp_number = '5194916150'
);

-- Atualizar URL webhook da Márcia para incluir parâmetro seller
UPDATE sellers 
SET 
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=marcia',
  updated_at = NOW()
WHERE name ILIKE '%marcia%' OR whatsapp_number = '5581181894';
