
export interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  timestamp?: Date;
}

export type TableName = 'conversations' | 'messages' | 'sellers' | 'clients' | 'materials' | 'notifications' | 'ai_recommendations' | 'quality_scores' | 'escalations' | 'audit_logs';
