
import { Json } from '@/integrations/supabase/types';

export interface RealConversation {
  id: string;
  client_phone: string;
  client_name: string;
  status: 'bot' | 'manual' | 'seller' | 'waiting' | 'closed';
  lead_temperature: 'hot' | 'warm' | 'cold';
  source: string;
  dify_conversation_id?: string;
  potential_value?: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  assigned_seller_id?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface RealMessage {
  id: string;
  conversation_id: string;
  sender_type: 'client' | 'bot' | 'operator' | 'seller' | 'admin';
  sender_name: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  file_url?: string;
  file_name?: string;
  file_size?: number; // Corrigido para number em vez de bigint
  whatsapp_message_id?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata: any;
  created_at: string;
}
