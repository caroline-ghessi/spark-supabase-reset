
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export const EmptyStateMessage: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Acesso Restrito
        </h2>
        <p className="text-gray-600 mb-4">
          Você precisa estar logado para visualizar as conversas do WhatsApp.
        </p>
        <Button 
          onClick={() => window.location.href = '/login'}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <User className="w-4 h-4 mr-2" />
          Fazer Login
        </Button>
      </div>
    </div>
  );
};
