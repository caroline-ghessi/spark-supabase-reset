
-- Configurar dados do Gabriel para integração Whapi
UPDATE sellers 
SET 
  whatsapp_number = '5181690036',
  whapi_token = 'nI7qsCLFrgVVWRy4TII7PKN9bin3zZ4I',
  whapi_instance_id = 'gabriel_instance',
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=gabriel',
  whapi_status = 'active',
  status = 'active',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{whapi_api_url}',
    '"https://gate.whapi.cloud/"'
  ),
  updated_at = NOW()
WHERE name ILIKE '%gabriel%' OR whatsapp_number = '5181690036' OR whatsapp_number = '5551816900136';

-- Se o Gabriel não existir, criar o registro
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
  'Gabriel',
  'gabriel@empresa.com',
  '+55 51 81690036',
  '5181690036',
  'Vendedor de Ferramentas',
  'nI7qsCLFrgVVWRy4TII7PKN9bin3zZ4I',
  'gabriel_instance',
  'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=gabriel',
  'active',
  'active',
  ARRAY['ferramentas', 'equipamentos'],
  '{"whapi_api_url": "https://gate.whapi.cloud/", "description": "Vendedor especializado em ferramentas com foco em análise ROI", "spin_expertise": "ROI analysis", "tendency": "slow_response", "specialty_focus": "problem_questions"}'
WHERE NOT EXISTS (
  SELECT 1 FROM sellers 
  WHERE name ILIKE '%gabriel%' OR whatsapp_number = '5181690036'
);
