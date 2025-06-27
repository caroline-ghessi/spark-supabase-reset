
import React from 'react';
import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, subtitle }) => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">{message}</p>
        {subtitle && <p className="text-sm">{subtitle}</p>}
      </div>
    </div>
  );
};
