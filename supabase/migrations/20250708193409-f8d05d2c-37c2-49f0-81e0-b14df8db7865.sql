
-- Correção completa dos números WhatsApp dos vendedores conforme identificado

-- 1. Corrigir Sérgio (número estava duplicado com Antonio)
UPDATE sellers 
SET whatsapp_number = '5551981423305'
WHERE name ILIKE '%sergio%' AND whatsapp_number = '5551814233105';

-- 2. Corrigir Antonio (assumindo que é Antonio Nogueira)
UPDATE sellers 
SET whatsapp_number = '5194916259'
WHERE name ILIKE '%antonio%' AND whatsapp_number = '5551814233105';

-- 3. Corrigir Rodri.GO para o número correto identificado na imagem
UPDATE sellers 
SET whatsapp_number = '5551981155622'
WHERE whatsapp_number = '5194916150';

-- 4. Verificar se há números duplicados restantes
SELECT whatsapp_number, COUNT(*), array_agg(name) as sellers_with_same_number
FROM sellers 
GROUP BY whatsapp_number 
HAVING COUNT(*) > 1;

-- 5. Log da correção
INSERT INTO communication_logs (
  sender_name,
  recipient_number,
  message_content,
  context_type,
  status,
  metadata
) VALUES (
  'Sistema',
  'admin',
  'Correção de números WhatsApp: Sérgio, Antonio e Rodri.GO atualizados',
  'system_update',
  'completed',
  jsonb_build_object(
    'corrections', jsonb_build_array(
      'Sérgio: 5551814233105 → 5551981423305',
      'Antonio: 5551814233105 → 5194916259', 
      'Rodri.GO: 5194916150 → 5551981155622'
    ),
    'timestamp', NOW()
  )
);
