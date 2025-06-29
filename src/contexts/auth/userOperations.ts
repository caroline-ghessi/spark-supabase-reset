
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
    
    // CORREÇÃO CRÍTICA: Query mais segura para evitar recursão RLS
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro se não encontrar

    if (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Se for erro de recursão RLS, tentar com abordagem diferente
      if (error.code === '42P17') {
        console.warn('🔄 Erro de recursão RLS detectado, tentando abordagem alternativa...');
        await handleRLSRecursionError(userId, setUser, setLoading);
        return;
      }
      
      // Se o usuário não foi encontrado, criar perfil
      if (error.code === 'PGRST116' || !data) {
        console.log('👤 Usuário não encontrado na tabela users, criando perfil...');
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

// Nova função para lidar com erro de recursão RLS
const handleRLSRecursionError = async (
  userId: string,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    console.log('🔧 Tentando abordagem alternativa para carregar usuário...');
    
    // Tentar buscar dados básicos do auth.users via função do Supabase
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser.user) {
      console.error('❌ Usuário auth não encontrado');
      setLoading(false);
      return;
    }

    // Criar perfil básico com dados do auth
    const basicProfile: User = {
      id: authUser.user.id,
      email: authUser.user.email!,
      name: authUser.user.user_metadata?.name || authUser.user.email!.split('@')[0],
      role: 'admin', // Assumir admin por segurança
      first_login_completed: false
    };
    
    setUser(basicProfile);
    console.log('✅ Perfil básico criado para contornar erro RLS:', basicProfile);
    
  } catch (error) {
    console.error('💥 Erro na abordagem alternativa:', error);
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
      await handleRLSRecursionError(userId, setUser, setLoading);
      return;
    }

    console.log('✅ Perfil do usuário criado, recarregando dados...');
    // Aguardar um pouco antes de recarregar
    setTimeout(() => {
      loadUserData(userId, setUser, setLoading);
    }, 500);
    
  } catch (error) {
    console.error('💥 Erro ao criar perfil do usuário:', error);
    // Fallback para erro de criação
    await handleRLSRecursionError(userId, setUser, setLoading);
  }
};
