
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const EmptyMessagesState: React.FC = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>Nenhuma mensagem ainda</p>
    </div>
  );
};
