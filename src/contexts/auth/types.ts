
import type { Session } from '@supabase/supabase-js';
import type { DatabaseUser } from '@/types/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'supervisor';
  seller_id?: string;
  first_login_completed?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: any; message?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  isAdmin: boolean;
  isSeller: boolean;
  isSupervisor: boolean;
  hasPermission: (permission: string) => boolean;
}

export interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

export interface DevConfig {
  enabled: boolean;
  adminUser: User;
}
