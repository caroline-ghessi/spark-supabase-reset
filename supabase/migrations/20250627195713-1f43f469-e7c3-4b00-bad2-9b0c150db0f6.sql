
-- ========================================
-- 1. CONVERSATIONS (Conversas)
-- ========================================
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_phone TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  status TEXT NOT NULL DEFAULT 'bot' CHECK (status IN ('bot', 'manual', 'seller', 'waiting', 'closed')),
  lead_temperature TEXT NOT NULL DEFAULT 'cold' CHECK (lead_temperature IN ('hot', 'warm', 'cold')),
  assigned_seller_id UUID,
  potential_value DECIMAL(12,2),
  source TEXT DEFAULT 'whatsapp',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  dify_conversation_id TEXT,
  metadata JSONB DEFAULT '{}',
  tags TEXT[]
);

-- ========================================
-- 2. MESSAGES (Mensagens)
-- ========================================
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'bot', 'admin', 'seller', 'system')),
  sender_id UUID,
  sender_name TEXT NOT NULL,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video', 'location')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  whatsapp_message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 3. SELLERS (Vendedores)
-- ========================================
CREATE TABLE sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  position TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vacation')),
  specialties TEXT[],
  max_concurrent_clients INTEGER DEFAULT 10,
  current_clients INTEGER DEFAULT 0,
  work_schedule JSONB DEFAULT '{"start": "08:00", "end": "18:00", "days": ["mon", "tue", "wed", "thu", "fri"]}',
  performance_score DECIMAL(3,2) DEFAULT 5.0,
  whapi_token TEXT,
  whapi_instance_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 4. CLIENTS (Clientes)
-- ========================================
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  company TEXT,
  position TEXT,
  lead_score DECIMAL(3,2) DEFAULT 5.0,
  total_interactions INTEGER DEFAULT 0,
  total_value DECIMAL(12,2) DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  source TEXT DEFAULT 'whatsapp',
  location JSONB,
  tags TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 5. MATERIALS (Biblioteca)
-- ========================================
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  thumbnail_url TEXT,
  version TEXT DEFAULT '1.0',
  tags TEXT[],
  permissions TEXT[] DEFAULT '{"admin", "seller"}',
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 6. NOTIFICATIONS (Notificações)
-- ========================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  channels TEXT[] DEFAULT '{"app"}',
  read_at TIMESTAMPTZ,
  action_data JSONB,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 7. AI_RECOMMENDATIONS (Recomendações IA)
-- ========================================
CREATE TABLE ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  seller_id UUID REFERENCES sellers(id),
  client_id UUID REFERENCES clients(id),
  type TEXT NOT NULL CHECK (type IN ('material', 'technique', 'timing', 'escalation')),
  recommendation TEXT NOT NULL,
  reasoning TEXT,
  confidence_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'implemented', 'ignored', 'dismissed')),
  implemented_at TIMESTAMPTZ,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 8. QUALITY_SCORES (Scores de Qualidade)
-- ========================================
CREATE TABLE quality_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  seller_id UUID REFERENCES sellers(id),
  overall_score DECIMAL(3,2) NOT NULL,
  response_time_score DECIMAL(3,2),
  technique_score DECIMAL(3,2),
  personalization_score DECIMAL(3,2),
  professionalism_score DECIMAL(3,2),
  criteria_details JSONB,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 9. ESCALATIONS (Escalações)
-- ========================================
CREATE TABLE escalations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  seller_id UUID REFERENCES sellers(id),
  escalated_to TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'high' CHECK (priority IN ('medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- 10. AUDIT_LOGS (Logs de Auditoria)
-- ========================================
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- CONVERSATIONS
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_phone ON conversations(client_phone);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_temperature ON conversations(lead_temperature);

-- MESSAGES  
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_whatsapp_id ON messages(whatsapp_message_id);

-- SELLERS
CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_whatsapp ON sellers(whatsapp_number);

-- CLIENTS
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);

-- NOTIFICATIONS
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- ========================================
-- TRIGGERS AUTOMÁTICOS
-- ========================================

-- Função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at 
    BEFORE UPDATE ON sellers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at 
    BEFORE UPDATE ON materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DADOS INICIAIS (VENDEDORES)
-- ========================================

INSERT INTO sellers (name, email, phone, whatsapp_number, position, specialties, performance_score) VALUES
('Douglas', 'douglas@empresa.com', '+55 51 9649-4341', '5551964943141', 'Vendedor Ferramentas', ARRAY['Ferramentas'], 8.0),
('Marcia', 'marcia@empresa.com', '+55 51 8118-1894', '5551811818194', 'Vendedor Ferramentas', ARRAY['Ferramentas'], 6.5),
('Gabriel', 'gabriel@empresa.com', '+55 51 8169-0036', '5551816900136', 'Vendedor Ferramentas', ARRAY['Ferramentas'], 6.5),
('Cristiano', 'cristiano@empresa.com', '+55 51 9526-5283', '5551952652183', 'Gerente Técnico', ARRAY['Energia Solar', 'Baterias'], 9.5),
('Ricardo', 'ricardo@empresa.com', '+55 51 9491-6150', '5551949161150', 'Vendedor Energia', ARRAY['Energia Solar', 'Baterias'], 6.0),
('Ronaldo', 'ronaldo@empresa.com', '+55 51 9308-7484', '5551930874184', 'Vendedor Senior', ARRAY['Telha Shingle', 'Light Steel Frame'], 9.0),
('Luan', 'luan@empresa.com', '+55 51 8142-3303', '5551814233103', 'Especialista B2B', ARRAY['Telha Shingle', 'B2B'], 8.5),
('Felipe', 'felipe@empresa.com', '+55 51 8125-2666', '5551812526166', 'Vendedor Senior', ARRAY['Telha Shingle', 'Impermeabilização'], 9.0),
('Sergio', 'sergio@empresa.com', '+55 51 8142-3305', '5551814233105', 'Vendedor', ARRAY['Telha Shingle', 'Drywall'], 7.0),
('Antonio', 'antonio@empresa.com', '+55 51 8142-3305', '5551814233105', 'Especialista Drywall', ARRAY['Drywall'], 7.5),
('Antonio Cesar', 'antonio.cesar@empresa.com', '+55 51 9751-9607', '5551975196107', 'Especialista Drywall', ARRAY['Drywall'], 8.0);

-- ========================================
-- CONFIGURAR REAL-TIME
-- ========================================

-- Habilitar real-time para tabelas principais
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE sellers;

-- Configurar REPLICA IDENTITY para real-time completo
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE sellers REPLICA IDENTITY FULL;
