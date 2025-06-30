
export interface TestResult {
  seller: string;
  phone: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
  details?: any;
}

export interface Seller {
  name: string;
  phone: string;
}

export const sellers: Seller[] = [
  { name: 'Márcia', phone: '5181181894' },
  { name: 'Ricardo', phone: '5194916150' },
  { name: 'Luan', phone: '5181423303' },
  { name: 'Gabriel', phone: '5181690036' },
  { name: 'Felipe', phone: '5181252666' }
];
