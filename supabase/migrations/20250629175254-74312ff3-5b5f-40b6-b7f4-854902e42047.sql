
-- ========================================
-- FASE 3: CATEGORIA C - CONFIGURAÇÕES (Admin-only)
-- ========================================

-- MATERIALS: Admins gerenciam, vendedores visualizam
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all materials" 
  ON public.materials 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can manage all materials" 
  ON public.materials 
  FOR ALL 
  USING (public.has_role('supervisor'));

CREATE POLICY "Sellers can view active materials" 
  ON public.materials 
  FOR SELECT 
  USING (
    public.has_role('seller') AND 
    is_active = true AND
    ('seller' = ANY(permissions) OR 'all' = ANY(permissions))
  );

-- AI_AGENTS_CONFIG: Apenas admins
ALTER TABLE public.ai_agents_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage ai agents config" 
  ON public.ai_agents_config 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can view ai agents config" 
  ON public.ai_agents_config 
  FOR SELECT 
  USING (public.has_role('supervisor'));

-- AUDIT_LOGS: Apenas admins
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage audit logs" 
  ON public.audit_logs 
  FOR ALL 
  USING (public.has_role('admin'));

CREATE POLICY "Supervisors can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (public.has_role('supervisor'));

-- ========================================
-- FUNÇÕES ADICIONAIS PARA AUDITORIA
-- ========================================

-- Função para log automático de mudanças críticas
CREATE OR REPLACE FUNCTION public.log_critical_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para mudanças em conversas críticas
  IF TG_TABLE_NAME = 'conversations' AND (NEW.status != OLD.status OR NEW.assigned_seller_id != OLD.assigned_seller_id) THEN
    INSERT INTO public.audit_logs (
      resource_type,
      resource_id,
      action,
      old_values,
      new_values,
      user_id,
      user_name
    ) VALUES (
      'conversation',
      NEW.id,
      'status_change',
      jsonb_build_object('status', OLD.status, 'assigned_seller_id', OLD.assigned_seller_id),
      jsonb_build_object('status', NEW.status, 'assigned_seller_id', NEW.assigned_seller_id),
      auth.uid(),
      (SELECT name FROM public.users WHERE id = auth.uid())
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para auditoria automática de conversas
CREATE TRIGGER audit_conversation_changes
  AFTER UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_critical_changes();

-- ========================================
-- VALIDAÇÃO FINAL DAS POLÍTICAS
-- ========================================

-- Função para validar integridade das políticas RLS
CREATE OR REPLACE FUNCTION public.validate_rls_policies()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  status TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    t.table_name::TEXT,
    t.row_security::BOOLEAN,
    COALESCE(p.policy_count, 0) as policy_count,
    CASE 
      WHEN t.row_security AND COALESCE(p.policy_count, 0) > 0 THEN 'OK'
      WHEN t.row_security AND COALESCE(p.policy_count, 0) = 0 THEN 'RLS_WITHOUT_POLICIES'
      ELSE 'RLS_DISABLED'
    END as status
  FROM (
    SELECT schemaname, tablename as table_name, rowsecurity as row_security
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN (
      'conversations', 'messages', 'notifications', 'escalations',
      'clients', 'sellers', 'quality_scores', 'ai_recommendations',
      'materials', 'ai_agents_config', 'audit_logs'
    )
  ) t
  LEFT JOIN (
    SELECT schemaname, tablename, COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename
  ) p ON t.schemaname = p.schemaname AND t.table_name = p.tablename
  ORDER BY t.table_name;
$$;
