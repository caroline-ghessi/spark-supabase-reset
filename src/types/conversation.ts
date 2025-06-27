
export interface Conversation {
  id: number;
  clientName: string;
  clientPhone: string;
  status: 'bot' | 'manual' | 'seller' | 'waiting' | 'closed';
  leadType: 'hot' | 'warm' | 'cold';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  assignedSeller: string | null;
}
