
import React from 'react';
import { CheckCircle, XCircle, Clock, Database, Wifi, MessageSquare, Users, Bell, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TestResult } from './types';

export const getStatusIcon = (status: TestResult['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'running':
      return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
    default:
      return <div className="w-5 h-5 rounded-full bg-gray-300" />;
  }
};

export const getStatusColor = (status: TestResult['status']) => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800';
    case 'error': return 'bg-red-100 text-red-800';
    case 'running': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getTestIcon = (testName: string) => {
  if (testName.includes('Supabase')) return <Database className="w-4 h-4" />;
  if (testName.includes('Real-time')) return <Wifi className="w-4 h-4" />;
  if (testName.includes('Webhook')) return <MessageSquare className="w-4 h-4" />;
  if (testName.includes('Vendedores')) return <Users className="w-4 h-4" />;
  if (testName.includes('Notificações')) return <Bell className="w-4 h-4" />;
  return <Activity className="w-4 h-4" />;
};

interface TestItemProps {
  test: TestResult;
  index: number;
}

export const TestItem: React.FC<TestItemProps> = ({ test, index }) => (
  <div
    key={index}
    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
  >
    <div className="flex items-center space-x-3">
      {getTestIcon(test.name)}
      <div>
        <div className="font-medium text-gray-900">{test.name}</div>
        {test.message && (
          <div className="text-sm text-gray-600">{test.message}</div>
        )}
      </div>
    </div>
    
    <div className="flex items-center space-x-3">
      {test.timestamp && (
        <span className="text-xs text-gray-500">
          {test.timestamp.toLocaleTimeString()}
        </span>
      )}
      <Badge className={getStatusColor(test.status)}>
        <div className="flex items-center space-x-1">
          {getStatusIcon(test.status)}
          <span className="capitalize">{test.status}</span>
        </div>
      </Badge>
    </div>
  </div>
);
