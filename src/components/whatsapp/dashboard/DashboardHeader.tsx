
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface DashboardHeaderProps {
  showDebug: boolean;
  onToggleDebug: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  showDebug,
  onToggleDebug
}) => {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-900">WhatsApp Business</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleDebug}
        className="text-xs"
      >
        {showDebug ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
        {showDebug ? 'Ocultar' : 'Debug'}
      </Button>
    </div>
  );
};
