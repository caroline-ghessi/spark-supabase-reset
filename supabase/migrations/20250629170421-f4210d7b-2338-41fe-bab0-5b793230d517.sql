
-- Remover a função problemática
DROP FUNCTION IF EXISTS create_default_admin();

-- Criar função corrigida que não insere dados diretamente
CREATE OR REPLACE FUNCTION ensure_admin_setup()
RETURNS boolean AS $$
BEGIN
  -- Apenas verificar se existe algum admin
  RETURN EXISTS (SELECT 1 FROM public.users WHERE role = 'admin');
END;
$$ LANGUAGE plpgsql;

-- Criar função para conectar usuário existente do auth com seller
CREATE OR REPLACE FUNCTION link_user_to_seller(user_email TEXT, seller_phone TEXT)
RETURNS boolean AS $$
DECLARE
  auth_user_id UUID;
  seller_uuid UUID;
BEGIN
  -- Buscar seller pelo telefone
  SELECT id INTO seller_uuid 
  FROM public.sellers 
  WHERE whatsapp_number = seller_phone;
  
  IF seller_uuid IS NULL THEN
    RAISE NOTICE 'Seller não encontrado com telefone: %', seller_phone;
    RETURN false;
  END IF;
  
  -- Buscar usuário do auth pelo email
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF auth_user_id IS NULL THEN
    RAISE NOTICE 'Usuário do auth não encontrado com email: %', user_email;
    RETURN false;
  END IF;
  
  -- Inserir ou atualizar na tabela users
  INSERT INTO public.users (id, email, name, role, seller_id, first_login_completed)
  VALUES (
    auth_user_id,
    user_email,
    (SELECT COALESCE(raw_user_meta_data->>'name', split_part(user_email, '@', 1)) FROM auth.users WHERE id = auth_user_id),
    'seller',
    seller_uuid,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    seller_id = seller_uuid,
    role = 'seller',
    updated_at = NOW();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Função para criar usuário admin quando necessário (será usada no código)
CREATE OR REPLACE FUNCTION create_admin_user(admin_id UUID, admin_email TEXT, admin_name TEXT)
RETURNS boolean AS $$
BEGIN
  -- Inserir admin apenas se o ID existir no auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = admin_id) THEN
    INSERT INTO public.users (id, email, name, role, first_login_completed)
    VALUES (admin_id, admin_email, admin_name, 'admin', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      name = admin_name,
      updated_at = NOW();
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;
