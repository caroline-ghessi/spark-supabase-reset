
-- Configurar token Whapi para Ricardo e ativar seu status
-- IMPORTANTE: Este é um token de exemplo - você precisará substituir por um token real do Whapi
UPDATE sellers 
SET 
  whapi_token = 'YOUR_RICARDO_WHAPI_TOKEN_HERE',
  whapi_status = 'active',
  whapi_instance_id = 'RICARDO_INSTANCE_ID',
  updated_at = NOW()
WHERE name ILIKE '%ricardo%';

-- Este SELECT ajudará a verificar o estado atual de todos os vendedores
SELECT 
  name, 
  whatsapp_number,
  whapi_status,
  CASE 
    WHEN whapi_token IS NOT NULL THEN 'Configurado' 
    ELSE 'Não configurado' 
  END as token_status,
  whapi_webhook_url
FROM sellers 
WHERE name IN ('Márcia', 'Ricardo', 'Gabriel', 'Luan', 'Felipe')
ORDER BY name;
