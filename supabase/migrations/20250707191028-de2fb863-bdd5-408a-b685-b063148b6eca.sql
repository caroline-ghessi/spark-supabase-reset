
-- Remover a view atual com security_barrier
DROP VIEW IF EXISTS vendor_conversations_full;

-- Recriar a view sem security_barrier
CREATE VIEW vendor_conversations_full AS
SELECT 
  c.id as conversation_id,
  c.client_phone,
  c.client_name,
  c.status as conversation_status,
  c.lead_temperature,
  c.assigned_seller_id as seller_id,
  s.name as seller_name,
  s.whapi_status,
  
  -- Estatísticas das mensagens
  COUNT(vm.id) as total_messages,
  COUNT(CASE WHEN vm.is_from_seller THEN 1 END) as seller_messages,
  COUNT(CASE WHEN NOT vm.is_from_seller THEN 1 END) as client_messages,
  
  -- Qualidade
  AVG(vm.quality_score) as avg_quality_score,
  COUNT(CASE WHEN vm.flagged_for_review THEN 1 END) as flagged_count,
  
  -- Timing
  MIN(vm.sent_at) as first_message_at,
  MAX(vm.sent_at) as last_message_at,
  
  -- Última mensagem
  (SELECT vm2.text_content 
   FROM vendor_whatsapp_messages vm2 
   WHERE vm2.conversation_id = c.id 
   ORDER BY vm2.sent_at DESC 
   LIMIT 1) as last_message_text,
   
  c.created_at,
  c.updated_at

FROM conversations c
LEFT JOIN sellers s ON c.assigned_seller_id = s.id
LEFT JOIN vendor_whatsapp_messages vm ON vm.conversation_id = c.id
WHERE c.assigned_seller_id IS NOT NULL -- Apenas conversas com vendedores
GROUP BY c.id, s.id;

-- Habilitar RLS na view
ALTER VIEW vendor_conversations_full SET ROW LEVEL SECURITY;

-- Criar políticas RLS específicas para a view
CREATE POLICY "Admins and supervisors see all vendor conversations" 
ON vendor_conversations_full
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Sellers see their own vendor conversations"
ON vendor_conversations_full
FOR SELECT USING (
  seller_id = (SELECT seller_id FROM users WHERE id = auth.uid())
);
