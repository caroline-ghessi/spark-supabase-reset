
-- Atualizar dados da Márcia com as informações do Whapi
UPDATE sellers 
SET 
  whapi_token = 'vVIV3CyyfSfZeNPT9POatBc7rlgr4Bbb',
  whapi_instance_id = 'marcia_instance',
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook',
  whapi_status = 'active',
  whatsapp_number = '5581181894',
  status = 'active',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{whapi_api_url}',
    '"https://gate.whapi.cloud/"'
  ),
  updated_at = NOW()
WHERE phone = '+55 5181181894' OR whatsapp_number = '5581181894' OR name ILIKE '%marcia%';

-- Se a Márcia não existir, criar o registro
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
  'Márcia',
  'marcia@empresa.com',
  '+55 5181181894',
  '5581181894',
  'Vendedora',
  'vVIV3CyyfSfZeNPT9POatBc7rlgr4Bbb',
  'marcia_instance',
  'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook',
  'active',
  'active',
  ARRAY['ferramentas', 'construcao'],
  '{"whapi_api_url": "https://gate.whapi.cloud/", "description": "Vendedora especializada em ferramentas e construção"}'
WHERE NOT EXISTS (
  SELECT 1 FROM sellers 
  WHERE phone = '+55 5181181894' OR whatsapp_number = '5581181894' OR name ILIKE '%marcia%'
);
