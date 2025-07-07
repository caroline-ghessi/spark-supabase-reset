-- Atualizar Rodri.GO existente com dados corretos para assistente de IA
UPDATE sellers 
SET 
  name = 'Rodri.GO - Assistente de IA',
  email = 'rodrigo.ai@drystore.com.br',
  position = 'Assistente de Vendas com IA',
  specialties = ARRAY['transferencia_leads', 'notificacoes_vendedores', 'resumos_conversas'],
  max_concurrent_clients = 999,
  performance_score = 9.9,
  metadata = jsonb_build_object(
    'is_ai_assistant', true,
    'role', 'lead_transfer_bot',
    'responsible_for', 'Transferência automatizada de leads para vendedores'
  ),
  updated_at = NOW()
WHERE whatsapp_number = '5194916150';

-- Verificar se foi atualizado corretamente
SELECT 
  id,
  name, 
  whatsapp_number, 
  specialties,
  whapi_status,
  metadata->>'is_ai_assistant' as is_ai_bot,
  performance_score
FROM sellers 
WHERE whatsapp_number = '5194916150';