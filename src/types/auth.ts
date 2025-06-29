
// Tipos customizados para autenticação
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'supervisor';
  seller_id?: string;
  first_login_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SellerMetrics {
  totalConversations: number;
  conversionRate: number;
  salesToday: number;
  activeConversations: number;
  spinScore?: number;
}

// Type assertion helper para contornar limitações do Supabase types
export const supabaseUsersTable = 'users' as any;
