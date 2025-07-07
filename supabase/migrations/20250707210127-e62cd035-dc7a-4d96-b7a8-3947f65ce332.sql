-- Criar tabela para logs de comunicação do Rodri.GO
CREATE TABLE IF NOT EXISTS public.communication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.sellers(id),
  sender_name TEXT NOT NULL DEFAULT 'Rodri.GO',
  recipient_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  context_type TEXT NOT NULL DEFAULT 'general', -- 'alert', 'notification', 'escalation', 'general'
  whapi_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_communication_logs_sender_id ON public.communication_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_recipient ON public.communication_logs(recipient_number);
CREATE INDEX IF NOT EXISTS idx_communication_logs_context_type ON public.communication_logs(context_type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON public.communication_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para communication_logs
CREATE POLICY "Admin can manage all communication logs" ON public.communication_logs
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Supervisors can view all communication logs" ON public.communication_logs
  FOR SELECT USING (has_role('supervisor'));

-- Criar trigger para updated_at
CREATE TRIGGER update_communication_logs_updated_at
  BEFORE UPDATE ON public.communication_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar campos de monitoramento na tabela sellers para tracking de performance
ALTER TABLE public.sellers 
ADD COLUMN IF NOT EXISTS response_time_avg NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS alerts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_alert_at TIMESTAMP WITH TIME ZONE;

-- Criar tabela para configurações de alertas automáticos
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'response_time', 'inactivity', 'quality_score', 'conversation_stalled'
  conditions JSONB NOT NULL, -- { "threshold": 30, "unit": "minutes", "comparison": "greater_than" }
  actions JSONB NOT NULL, -- { "alert_type": "seller_inactive", "severity": "medium", "escalation_level": 1 }
  is_active BOOLEAN NOT NULL DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 30,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para alert_rules
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para alert_rules
CREATE POLICY "Admin can manage alert rules" ON public.alert_rules
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Supervisors can view alert rules" ON public.alert_rules
  FOR SELECT USING (has_role('supervisor'));

-- Trigger para updated_at em alert_rules
CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON public.alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir regras de alerta padrão
INSERT INTO public.alert_rules (name, rule_type, conditions, actions) VALUES
('Vendedor Inativo - 30min', 'inactivity', 
 '{"threshold": 30, "unit": "minutes"}',
 '{"alert_type": "seller_inactive", "severity": "medium", "escalation_level": 1}'),
 
('Conversa Parada - 2h', 'conversation_stalled',
 '{"threshold": 120, "unit": "minutes"}', 
 '{"alert_type": "conversation_stalled", "severity": "high", "escalation_level": 2}'),
 
('Tempo Resposta Alto - 15min', 'response_time',
 '{"threshold": 15, "unit": "minutes"}',
 '{"alert_type": "slow_response", "severity": "medium", "escalation_level": 1}'),
 
('Score Qualidade Baixo', 'quality_score',
 '{"threshold": 6, "comparison": "less_than"}',
 '{"alert_type": "quality_issue", "severity": "high", "escalation_level": 2}')
ON CONFLICT DO NOTHING;