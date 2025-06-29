
-- ========================================
-- FUNÇÕES DE SEGURANÇA (Security Definer)
-- ========================================

-- Função para verificar se usuário tem role específico
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = role_name
  );
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Função para verificar se usuário é seller específico
CREATE OR REPLACE FUNCTION public.is_seller(seller_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND seller_id = seller_uuid
  );
$$;

-- Função para obter seller_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_seller_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT seller_id FROM public.users WHERE id = auth.uid();
$$;

-- ========================================
-- FASE 1: CATEGORIA A - DADOS DO USUÁRIO
-- ========================================

-- CONVERSATIONS: Vendedores veem apenas suas conversas + admins veem tudo
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all conversations" 
  ON public.conversations 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can manage all conversations" 
  ON public.conversations 
  FOR ALL 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can view their assigned conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (
    public.has_role('seller') AND 
    assigned_seller_id = public.get_current_user_seller_id()
  );

CREATE POLICY "Sellers can update their assigned conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (
    public.has_role('seller') AND 
    assigned_seller_id = public.get_current_user_seller_id()
  );

-- MESSAGES: Mensagens das conversas que o usuário tem acesso
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all messages" 
  ON public.messages 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can manage all messages" 
  ON public.messages 
  FOR ALL 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can access messages from their conversations" 
  ON public.messages 
  FOR ALL 
  USING (
    public.has_role('seller') AND 
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = messages.conversation_id 
      AND assigned_seller_id = public.get_current_user_seller_id()
    )
  );

-- NOTIFICATIONS: Usuários veem apenas suas notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all notifications" 
  ON public.notifications 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "System can insert notifications for users" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (user_id IS NOT NULL);

-- ESCALATIONS: Baseado no seller_id e admins
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all escalations" 
  ON public.escalations 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can manage all escalations" 
  ON public.escalations 
  FOR ALL 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can view escalations related to their conversations" 
  ON public.escalations 
  FOR SELECT 
  USING (
    public.has_role('seller') AND 
    (
      seller_id = public.get_current_user_seller_id() OR
      EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = escalations.conversation_id 
        AND assigned_seller_id = public.get_current_user_seller_id()
      )
    )
  );
