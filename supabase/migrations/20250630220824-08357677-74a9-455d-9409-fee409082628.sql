
-- Atualizar número da Márcia de 5581181894 para 5181181894
UPDATE sellers 
SET 
  whatsapp_number = '5181181894',
  phone = '+55 51 81181894',
  updated_at = NOW()
WHERE whatsapp_number = '5581181894' OR name ILIKE '%marcia%';

-- Atualizar número do Ricardo de 5551949161150 para 5194916150  
UPDATE sellers 
SET 
  whatsapp_number = '5194916150',
  phone = '+55 51 94916150',
  updated_at = NOW()
WHERE whatsapp_number = '5551949161150' OR name ILIKE '%ricardo%';

-- Atualizar URLs de webhook para incluir o parâmetro seller correto
UPDATE sellers 
SET 
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=marcia',
  updated_at = NOW()
WHERE name ILIKE '%marcia%';

UPDATE sellers 
SET 
  whapi_webhook_url = 'https://hzagithcqoiwybjljgmk.supabase.co/functions/v1/whapi-webhook?seller=ricardo',
  updated_at = NOW()
WHERE name ILIKE '%ricardo%';

-- Verificar se as atualizações foram aplicadas corretamente
SELECT 
  name, 
  phone, 
  whatsapp_number, 
  whapi_webhook_url,
  whapi_status
FROM sellers 
WHERE name ILIKE '%marcia%' OR name ILIKE '%ricardo%'
ORDER BY name;
