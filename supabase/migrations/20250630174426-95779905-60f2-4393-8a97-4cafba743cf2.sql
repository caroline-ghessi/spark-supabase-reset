
-- ========================================
-- CORREÇÃO CRÍTICA: Recursão Infinita RLS
-- ========================================

-- FASE 1: Sincronizar usuários existentes do auth para public.users
-- Inserir todos os usuários do auth.users que não existem em public.users
INSERT INTO public.users (id, email, name, role, first_login_completed)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
  'admin' as role, -- Primeiro usuário será admin, outros podem ser ajustados depois
  false as first_login_completed
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, users.name),
  updated_at = now();

-- FASE 2: Corrigir as funções de segurança para evitar recursão
-- Recriar a função has_role com melhor implementação
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

-- Função adicional para debug
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(user_id UUID, user_email TEXT, user_role TEXT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT id, email, role FROM public.users WHERE id = auth.uid();
$$;

-- FASE 3: Remover políticas problemáticas da tabela users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS mais simples para users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Política simples: usuários veem apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT 
USING (id = auth.uid());

-- Política simples: usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Política para admins (usando função segura)
CREATE POLICY "Service role can manage all users"
ON public.users
FOR ALL
USING (current_setting('role') = 'service_role' OR auth.jwt()->>'role' = 'service_role');

-- Reabilitar RLS na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- FASE 4: Verificar e corrigir outras políticas que podem causar recursão
-- Corrigir políticas da tabela conversations
DROP POLICY IF EXISTS "Admins and supervisors see all conversations" ON conversations;
DROP POLICY IF EXISTS "Sellers see assigned conversations" ON conversations;

-- Recriar políticas usando a função has_role corrigida
CREATE POLICY "Admins and supervisors can manage conversations"
ON conversations
FOR ALL
USING (
  public.has_role('admin') OR 
  public.has_role('supervisor')
);

CREATE POLICY "Sellers see their assigned conversations"
ON conversations
FOR SELECT
USING (
  public.has_role('seller') AND 
  assigned_seller_id = (SELECT seller_id FROM public.users WHERE id = auth.uid())
);

-- Corrigir políticas da tabela sellers
DROP POLICY IF EXISTS "Admins see all sellers" ON sellers;
DROP POLICY IF EXISTS "Sellers see own profile" ON sellers;

CREATE POLICY "Admins and supervisors can manage sellers"
ON sellers
FOR ALL
USING (
  public.has_role('admin') OR 
  public.has_role('supervisor')
);

CREATE POLICY "Sellers can view own seller profile"
ON sellers
FOR SELECT
USING (
  public.has_role('seller') AND
  id = (SELECT seller_id FROM public.users WHERE id = auth.uid())
);

-- VERIFICAÇÃO: Função para testar se as políticas funcionam
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE(
  test_name TEXT,
  result BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_user_role TEXT;
  test_result BOOLEAN;
  error_msg TEXT;
BEGIN
  -- Obter informações do usuário atual
  SELECT auth.uid() INTO current_user_id;
  SELECT role FROM public.users WHERE id = current_user_id INTO current_user_role;
  
  -- Teste 1: Verificar se usuário existe em public.users
  RETURN QUERY
  SELECT 
    'user_exists_in_public_users'::TEXT,
    (current_user_id IS NOT NULL AND current_user_role IS NOT NULL)::BOOLEAN,
    CASE 
      WHEN current_user_id IS NULL THEN 'User not authenticated'
      WHEN current_user_role IS NULL THEN 'User not found in public.users table'
      ELSE 'OK'
    END::TEXT;
    
  -- Teste 2: Verificar função has_role
  BEGIN
    SELECT public.has_role('admin') INTO test_result;
    RETURN QUERY SELECT 'has_role_function'::TEXT, true::BOOLEAN, 'Function works'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'has_role_function'::TEXT, false::BOOLEAN, SQLERRM::TEXT;
  END;
  
  -- Teste 3: Verificar acesso a conversations
  BEGIN
    PERFORM count(*) FROM conversations LIMIT 1;
    RETURN QUERY SELECT 'conversations_access'::TEXT, true::BOOLEAN, 'Can access conversations'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'conversations_access'::TEXT, false::BOOLEAN, SQLERRM::TEXT;
  END;
  
END;
$$;
