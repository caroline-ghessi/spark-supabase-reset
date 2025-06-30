
-- Criar tabela para armazenar TODAS as mensagens dos vendedores via Whapi
CREATE TABLE vendor_whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificação
  whapi_message_id TEXT UNIQUE NOT NULL,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  
  -- Dados da mensagem
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  is_from_seller BOOLEAN NOT NULL DEFAULT false,
  client_phone TEXT NOT NULL, -- Para facilitar consultas
  
  -- Conteúdo
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, document, audio, video, location, sticker
  text_content TEXT,
  caption TEXT,
  
  -- Mídia
  media_url TEXT,
  media_mime_type TEXT,
  media_size INTEGER,
  media_duration INTEGER, -- para áudio/vídeo
  thumbnail_url TEXT,
  
  -- Metadados WhatsApp
  quoted_message_id TEXT, -- se for resposta
  forwarded BOOLEAN DEFAULT false,
  whatsapp_context JSONB, -- dados extras do WhatsApp
  
  -- Status de entrega
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  sent_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Análise de qualidade SPIN
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 10),
  spin_analysis JSONB DEFAULT '{}',
  
  -- Sistema de flags para revisão
  flagged_for_review BOOLEAN DEFAULT false,
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices otimizados para consultas frequentes
CREATE INDEX idx_vendor_messages_seller_date ON vendor_whatsapp_messages(seller_id, sent_at DESC);
CREATE INDEX idx_vendor_messages_conversation ON vendor_whatsapp_messages(conversation_id, sent_at ASC);
CREATE INDEX idx_vendor_messages_whapi_id ON vendor_whatsapp_messages(whapi_message_id);
CREATE INDEX idx_vendor_messages_client ON vendor_whatsapp_messages(client_phone, sent_at DESC);
CREATE INDEX idx_vendor_messages_flagged ON vendor_whatsapp_messages(flagged_for_review) WHERE flagged_for_review = true;
CREATE INDEX idx_vendor_messages_quality ON vendor_whatsapp_messages(quality_score) WHERE quality_score IS NOT NULL;

-- Tabela para logs de sincronização
CREATE TABLE whapi_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  sync_type TEXT NOT NULL, -- webhook, manual_sync, periodic_sync
  status TEXT NOT NULL, -- success, error, partial
  message_count INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar campos específicos do Whapi na tabela sellers
ALTER TABLE sellers 
ADD COLUMN IF NOT EXISTS whapi_token TEXT,
ADD COLUMN IF NOT EXISTS whapi_instance_id TEXT,
ADD COLUMN IF NOT EXISTS whapi_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS whapi_last_sync TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS whapi_status TEXT DEFAULT 'inactive'; -- active, inactive, error

-- View para conversas completas dos vendedores
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

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_vendor_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendor_messages_updated_at
    BEFORE UPDATE ON vendor_whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_messages_updated_at();

-- RLS Policies para vendor_whatsapp_messages
ALTER TABLE vendor_whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Admins e supervisores podem ver todas as mensagens
CREATE POLICY "Admins and supervisors see all vendor messages" 
ON vendor_whatsapp_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

-- Vendedores podem ver apenas suas próprias mensagens
CREATE POLICY "Sellers see own messages"
ON vendor_whatsapp_messages
FOR SELECT USING (
  seller_id = (SELECT seller_id FROM users WHERE id = auth.uid())
);

-- Apenas sistema pode inserir mensagens (via service role)
CREATE POLICY "System can insert messages"
ON vendor_whatsapp_messages
FOR INSERT WITH CHECK (true);

-- Apenas admins podem modificar flags de revisão
CREATE POLICY "Admins can update review flags"
ON vendor_whatsapp_messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

-- RLS para whapi_sync_logs
ALTER TABLE whapi_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all sync logs"
ON whapi_sync_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'supervisor')
  )
);

-- Função para calcular score SPIN básico
CREATE OR REPLACE FUNCTION calculate_spin_score(message_text TEXT)
RETURNS JSONB AS $$
DECLARE
  analysis JSONB := '{}';
  score NUMERIC := 5.0; -- Score base
BEGIN
  IF message_text IS NULL OR message_text = '' THEN
    RETURN analysis;
  END IF;
  
  -- Análise básica de padrões SPIN
  analysis := jsonb_build_object(
    'has_question', message_text ~ '\?',
    'word_count', array_length(string_to_array(message_text, ' '), 1),
    'has_greeting', message_text ~* 'bom dia|boa tarde|boa noite|olá|oi|tudo bem',
    'situation_question', message_text ~* 'quantos?|qual é?|como está?|há quanto tempo?|me conte sobre',
    'problem_question', message_text ~* 'dificuldade|problema|desafio|frustração|preocupa|incomoda',
    'implication_question', message_text ~* 'isso afeta|impacto|consequência|resultado|prejudica|atrapalha',
    'need_payoff_question', message_text ~* 'seria útil|ajudaria|benefício|valor|importante|prioridade'
  );
  
  -- Calcular score baseado nos padrões encontrados
  IF (analysis->>'has_question')::boolean THEN score := score + 2; END IF;
  IF (analysis->>'has_greeting')::boolean THEN score := score + 0.5; END IF;
  IF (analysis->>'situation_question')::boolean THEN score := score + 1; END IF;
  IF (analysis->>'problem_question')::boolean THEN score := score + 1.5; END IF;
  IF (analysis->>'implication_question')::boolean THEN score := score + 2; END IF;
  IF (analysis->>'need_payoff_question')::boolean THEN score := score + 2.5; END IF;
  
  -- Penalizar mensagens muito curtas
  IF (analysis->>'word_count')::int < 3 THEN score := score - 1; END IF;
  
  -- Adicionar score ao analysis
  analysis := analysis || jsonb_build_object('calculated_score', LEAST(score, 10));
  
  RETURN analysis;
END;
$$ LANGUAGE plpgsql;

-- Trigger para análise automática SPIN nas mensagens dos vendedores
CREATE OR REPLACE FUNCTION analyze_vendor_message()
RETURNS TRIGGER AS $$
DECLARE
  spin_data JSONB;
BEGIN
  -- Apenas analisar mensagens dos vendedores com texto
  IF NEW.is_from_seller AND NEW.text_content IS NOT NULL THEN
    spin_data := calculate_spin_score(NEW.text_content);
    NEW.spin_analysis := spin_data;
    NEW.quality_score := (spin_data->>'calculated_score')::numeric;
    
    -- Flaggar para revisão se score muito baixo
    IF NEW.quality_score < 6 THEN
      NEW.flagged_for_review := true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_analyze_vendor_message
    BEFORE INSERT OR UPDATE ON vendor_whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION analyze_vendor_message();
