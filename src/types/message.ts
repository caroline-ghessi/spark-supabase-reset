
export interface Message {
  id: number;
  sender: 'client' | 'bot' | 'operator' | 'seller';
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}
