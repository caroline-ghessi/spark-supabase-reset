
-- Atualizar token Whapi do Ricardo
UPDATE sellers 
SET 
  whapi_token = 'btKBR0RA85f24crA6MTOD9YR5BuAA7Yk',
  whapi_status = 'active',
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=ricardo',
  updated_at = NOW()
WHERE name ILIKE '%ricardo%' OR whatsapp_number = '5194916150';

-- Verificar se a atualização foi bem-sucedida
SELECT 
  name, 
  whatsapp_number,
  whapi_status,
  CASE 
    WHEN whapi_token IS NOT NULL AND whapi_token != 'YOUR_RICARDO_WHAPI_TOKEN_HERE' 
    THEN 'Token configurado' 
    ELSE 'Token não configurado' 
  END as token_status,
  whapi_webhook_url
FROM sellers 
WHERE name ILIKE '%ricardo%' OR whatsapp_number = '5194916150';
