-- Create table for alert types configuration
CREATE TABLE public.alert_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  condition_description TEXT NOT NULL,
  target_role TEXT NOT NULL, -- 'vendedor', 'gerencia', etc.
  channel TEXT NOT NULL, -- 'whatsapp', 'email', 'dashboard'
  priority TEXT NOT NULL DEFAULT 'media', -- 'baixa', 'media', 'alta', 'critica'
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for escalation contacts
CREATE TABLE public.escalation_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Gerente', 'Diretor', etc.
  escalation_level INTEGER NOT NULL, -- 1, 2, 3
  whatsapp_number TEXT NOT NULL,
  email TEXT NOT NULL,
  work_schedule JSONB DEFAULT '{"start": "08:00", "end": "18:00", "days": ["mon", "tue", "wed", "thu", "fri"]}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for alert configurations
CREATE TABLE public.alert_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL, -- conditions that trigger the alert
  notification_channels TEXT[] NOT NULL DEFAULT '{"whatsapp"}',
  escalation_levels INTEGER[] NOT NULL DEFAULT '{1}',
  cooldown_minutes INTEGER DEFAULT 60, -- minimum time between alerts
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for alert history
CREATE TABLE public.alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_configuration_id UUID REFERENCES public.alert_configurations(id),
  triggered_by_user_id UUID,
  triggered_by_conversation_id UUID REFERENCES public.conversations(id),
  message TEXT NOT NULL,
  channels_sent TEXT[] NOT NULL,
  recipients JSONB NOT NULL, -- who received the alert
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'acknowledged'
  response_time_minutes INTEGER,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alert_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alert_types
CREATE POLICY "Admin can manage alert types" ON public.alert_types
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Supervisors can view alert types" ON public.alert_types
  FOR SELECT USING (has_role('supervisor'));

-- RLS Policies for escalation_contacts
CREATE POLICY "Admin can manage escalation contacts" ON public.escalation_contacts
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Supervisors can view escalation contacts" ON public.escalation_contacts
  FOR SELECT USING (has_role('supervisor'));

-- RLS Policies for alert_configurations
CREATE POLICY "Admin can manage alert configurations" ON public.alert_configurations
  FOR ALL USING (has_role('admin'));

CREATE POLICY "Supervisors can view alert configurations" ON public.alert_configurations
  FOR SELECT USING (has_role('supervisor'));

-- RLS Policies for alert_history
CREATE POLICY "Admin can view all alert history" ON public.alert_history
  FOR SELECT USING (has_role('admin'));

CREATE POLICY "Supervisors can view alert history" ON public.alert_history
  FOR SELECT USING (has_role('supervisor'));

CREATE POLICY "System can insert alert history" ON public.alert_history
  FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_alert_types_updated_at
  BEFORE UPDATE ON public.alert_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalation_contacts_updated_at
  BEFORE UPDATE ON public.escalation_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alert_configurations_updated_at
  BEFORE UPDATE ON public.alert_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial data
INSERT INTO public.alert_types (name, condition_description, target_role, channel, priority, is_active) VALUES
  ('Tempo de Resposta Alto', 'Vendedor demora mais de 30 minutos para responder', 'vendedor', 'whatsapp', 'media', true),
  ('Cliente Insatisfeito', 'Cliente demonstra insatisfação na conversa', 'vendedor', 'whatsapp', 'alta', true),
  ('Venda em Risco', 'Venda de alto valor em risco de perda', 'gerencia', 'whatsapp', 'critica', true),
  ('Qualidade Baixa', 'Score de qualidade do vendedor abaixo de 6', 'vendedor', 'whatsapp', 'media', true),
  ('Lead Quente Não Atendido', 'Lead quente sem resposta por mais de 15 minutos', 'gerencia', 'whatsapp', 'alta', true),
  ('Escalação Manual', 'Vendedor solicita escalação manual', 'gerencia', 'whatsapp', 'alta', true);

INSERT INTO public.escalation_contacts (name, role, escalation_level, whatsapp_number, email) VALUES
  ('Rodrigo Silva', 'Gerente de Vendas', 1, '51999887766', 'rodrigo@empresa.com'),
  ('Fabio Santos', 'Diretor Comercial', 2, '51988776655', 'fabio@empresa.com'),
  ('Ana Costa', 'Supervisora', 1, '51977665544', 'ana@empresa.com');

INSERT INTO public.alert_configurations (name, description, trigger_conditions, notification_channels, escalation_levels, is_active) VALUES
  ('Resposta Lenta', 'Alerta quando vendedor demora para responder', '{"response_time_minutes": 30, "trigger_type": "response_delay"}', '{"whatsapp"}', '{1}', true),
  ('Venda Crítica', 'Alerta para vendas de alto valor em risco', '{"potential_value_min": 50000, "trigger_type": "sale_at_risk"}', '{"whatsapp", "email"}', '{1, 2}', true),
  ('Qualidade Baixa', 'Alerta quando qualidade cai abaixo do threshold', '{"quality_score_max": 6, "trigger_type": "low_quality"}', '{"whatsapp"}', '{1}', true);