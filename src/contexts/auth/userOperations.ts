
import { supabase } from '@/integrations/supabase/client';
import type { DatabaseUser } from '@/types/auth';
import type { User } from './types';

// Variável para controlar loading global
let isLoadingUser = false;
let loadingPromise: Promise<void> | null = null;

export const loadUserData = async (
  userId: string,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) => {
  // Evitar múltiplas chamadas simultâneas
  if (isLoadingUser && loadingPromise) {
    console.log('⏳ Carregamento já em andamento, aguardando...');
    await loadingPromise;
    return;
  }

  isLoadingUser = true;
  loadingPromise = performUserLoad(userId, setUser, setLoading);
  
  try {
    await loadingPromise;
  } finally {
    isLoadingUser = false;
    loadingPromise = null;
  }
};

const performUserLoad = async (
  userId: string,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    console.log('🔄 Carregando dados do usuário para ID:', userId);
    
    // Usar a nova função de debug para obter informações do usuário
    const { data: userInfo, error: debugError } = await supabase
      .rpc('get_current_user_info');

    if (debugError) {
      console.error('❌ Erro na função de debug:', debugError);
    } else {
      console.log('🔍 Info do usuário via função debug:', userInfo);
    }

    // Query principal para buscar dados do usuário
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      // Se ainda houver erro, tentar criar perfil
      if (error.code === 'PGRST116' || !data) {
        console.log('👤 Usuário não encontrado, tentando criar perfil...');
        await createUserProfile(userId, setUser, setLoading);
        return;
      }
      
      setLoading(false);
      return;
    }

    if (!data) {
      console.log('👤 Nenhum dado retornado, criando perfil do usuário...');
      await createUserProfile(userId, setUser, setLoading);
      return;
    }

    console.log('✅ Dados do usuário carregados com sucesso:', data);

    // Converter dados do usuário
    const userData = data as unknown as DatabaseUser;
    const userProfile: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      seller_id: userData.seller_id,
      first_login_completed: userData.first_login_completed
    };
    
    setUser(userProfile);
    
    console.log('🎉 Perfil do usuário definido:', {
      email: userProfile.email,
      role: userProfile.role,
      name: userProfile.name
    });
    
  } catch (error) {
    console.error('💥 Erro crítico ao carregar dados do usuário:', error);
  } finally {
    setLoading(false);
  }
};

export const createUserProfile = async (
  userId: string,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    console.log('🔨 Criando perfil do usuário para:', userId);
    
    // Buscar dados do auth.users
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser.user) {
      console.error('❌ Usuário auth não encontrado');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: authUser.user.email!,
        name: authUser.user.user_metadata?.name || authUser.user.email!.split('@')[0],
        role: 'admin', // Primeiro usuário é admin
        first_login_completed: false
      });

    if (error) {
      console.error('❌ Erro ao criar perfil do usuário:', error);
      
      // Se falhar, usar abordagem de fallback
      const basicProfile: User = {
        id: authUser.user.id,
        email: authUser.user.email!,
        name: authUser.user.user_metadata?.name || authUser.user.email!.split('@')[0],
        role: 'admin',
        first_login_completed: false
      };
      
      setUser(basicProfile);
      console.log('✅ Perfil básico criado como fallback:', basicProfile);
      return;
    }

    console.log('✅ Perfil do usuário criado, recarregando dados...');
    // Aguardar um pouco antes de recarregar
    setTimeout(() => {
      loadUserData(userId, setUser, setLoading);
    }, 500);
    
  } catch (error) {
    console.error('💥 Erro ao criar perfil do usuário:', error);
    setLoading(false);
  }
};

// Nova função para testar as políticas RLS
export const testRLSPolicies = async () => {
  try {
    console.log('🧪 Testando políticas RLS...');
    
    const { data: testResults, error } = await supabase
      .rpc('test_rls_policies');

    if (error) {
      console.error('❌ Erro ao testar políticas RLS:', error);
      return false;
    }

    console.log('🧪 Resultados dos testes RLS:', testResults);
    
    // Verificar se todos os testes passaram
    const allTestsPassed = testResults?.every((test: any) => test.result === true);
    
    if (allTestsPassed) {
      console.log('✅ Todos os testes RLS passaram!');
    } else {
      console.warn('⚠️ Alguns testes RLS falharam:', 
        testResults?.filter((test: any) => !test.result)
      );
    }
    
    return allTestsPassed;
  } catch (error) {
    console.error('💥 Erro crítico ao testar RLS:', error);
    return false;
  }
};
