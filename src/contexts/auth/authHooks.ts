
import { useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from './authOperations';
import { hasPermission as checkPermission } from './permissions';
import type { User } from './types';

export const useAuthOperations = (
  user: User | null,
  session: Session | null,
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void
) => {
  const signIn = useCallback(async (email: string, password: string) => {
    console.log('📝 Iniciando processo de login para:', email);
    return authSignIn(email, password, setUser);
  }, [setUser]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    return authSignUp(email, password, name);
  }, []);

  const signOut = useCallback(async () => {
    return authSignOut(user, session, setUser, setSession);
  }, [user, session, setUser, setSession]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return checkPermission(user.role, permission);
  }, [user]);

  return {
    signIn,
    signUp,
    signOut,
    hasPermission,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isSupervisor: user?.role === 'supervisor'
  };
};
