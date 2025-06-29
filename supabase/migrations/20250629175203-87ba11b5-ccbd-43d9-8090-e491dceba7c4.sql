
-- ========================================
-- FASE 2: CATEGORIA B - DADOS CORPORATIVOS
-- ========================================

-- CLIENTS: Vendedores veem clientes de suas conversas + admins tudo
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all clients" 
  ON public.clients 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can manage all clients" 
  ON public.clients 
  FOR ALL 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can view clients from their conversations" 
  ON public.clients 
  FOR SELECT 
  USING (
    public.has_role('seller') AND 
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE client_phone = clients.phone 
      AND assigned_seller_id = public.get_current_user_seller_id()
    )
  );

-- SELLERS: Vendedores veem perfil próprio + admins veem tudo
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all sellers" 
  ON public.sellers 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can view all sellers" 
  ON public.sellers 
  FOR SELECT 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can view their own profile" 
  ON public.sellers 
  FOR SELECT 
  USING (
    public.has_role('seller') AND 
    id = public.get_current_user_seller_id()
  );

CREATE POLICY "Sellers can update their own profile" 
  ON public.sellers 
  FOR UPDATE 
  USING (
    public.has_role('seller') AND 
    id = public.get_current_user_seller_id()
  );

-- QUALITY_SCORES: Baseado no seller_id
ALTER TABLE public.quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all quality scores" 
  ON public.quality_scores 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can view all quality scores" 
  ON public.quality_scores 
  FOR SELECT 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can view their own quality scores" 
  ON public.quality_scores 
  FOR SELECT 
  USING (
    public.has_role('seller') AND 
    seller_id = public.get_current_user_seller_id()
  );

-- AI_RECOMMENDATIONS: Baseado no seller_id/conversation_id
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all ai recommendations" 
  ON public.ai_recommendations 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can view all ai recommendations" 
  ON public.ai_recommendations 
  FOR SELECT 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can view recommendations for their conversations" 
  ON public.ai_recommendations 
  FOR SELECT 
  USING (
    public.has_role('seller') AND 
    (
      seller_id = public.get_current_user_seller_id() OR
      EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = ai_recommendations.conversation_id 
        AND assigned_seller_id = public.get_current_user_seller_id()
      )
    )
  );

CREATE POLICY "Sellers can update status of their recommendations" 
  ON public.ai_recommendations 
  FOR UPDATE 
  USING (
    public.has_role('seller') AND 
    (
      seller_id = public.get_current_user_seller_id() OR
      EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = ai_recommendations.conversation_id 
        AND assigned_seller_id = public.get_current_user_seller_id()
      )
    )
  )
  WITH CHECK (
    public.has_role('seller') AND 
    (
      seller_id = public.get_current_user_seller_id() OR
      EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = ai_recommendations.conversation_id 
        AND assigned_seller_id = public.get_current_user_seller_id()
      )
    )
  );
