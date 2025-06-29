
import { supabase } from '@/integrations/supabase/client';
import type { DatabaseUser } from '@/types/auth';
import type { User } from './types';

export const loadUserData = async (
  userId: string,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void
) => {
  try {
    console.log('🔄 Carregando dados do usuário para ID:', userId);
    
    // CORREÇÃO CRÍTICA: Tratamento melhorado de erro RLS
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Se o erro for que não encontrou o usuário, criar um perfil básico
      if (error.code === 'PGRST116') {
        console.log('👤 Usuário não encontrado na tabela users, tentando criar...');
        await createUserProfile(userId, setUser, setLoading);
        return;
      }
      
      // Se for erro de RLS, tentar aguardar e recarregar
      if (error.message?.includes('RLS') || error.message?.includes('policy')) {
        console.warn('⚠️ Erro de RLS detectado, tentando novamente em 1 segundo...');
        setTimeout(() => {
          loadUserData(userId, setUser, setLoading);
        }, 1000);
        return;
      }
      
      setLoading(false);
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
      setLoading(false);
      return;
    }

    console.log('✅ Perfil do usuário criado, recarregando dados...');
    // CORREÇÃO: Usar setTimeout para evitar recursão
    setTimeout(() => {
      loadUserData(userId, setUser, setLoading);
    }, 0);
    
  } catch (error) {
    console.error('💥 Erro ao criar perfil do usuário:', error);
    setLoading(false);
  }
};
