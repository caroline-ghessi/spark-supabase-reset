
export interface Message {
  id: number;
  sender: 'client' | 'bot' | 'operator' | 'seller' | 'admin';
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
}
