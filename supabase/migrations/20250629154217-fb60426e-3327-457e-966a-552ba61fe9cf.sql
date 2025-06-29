
-- Criar tabela para rastrear notificações dispensadas
CREATE TABLE public.dismissed_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  notification_type TEXT NOT NULL,
  context_id TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para segurança
ALTER TABLE public.dismissed_notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias notificações dispensadas
CREATE POLICY "Users can view their own dismissed notifications" 
  ON public.dismissed_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias notificações dispensadas
CREATE POLICY "Users can create their own dismissed notifications" 
  ON public.dismissed_notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_dismissed_notifications_user_type ON public.dismissed_notifications(user_id, notification_type);
CREATE INDEX idx_dismissed_notifications_context ON public.dismissed_notifications(context_id);
