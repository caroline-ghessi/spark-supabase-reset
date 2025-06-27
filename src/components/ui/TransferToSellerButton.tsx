
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

interface TransferToSellerButtonProps {
  conversationId: string;
}

export const TransferToSellerButton: React.FC<TransferToSellerButtonProps> = ({
  conversationId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleTransfer = () => {
    // TODO: Implement transfer modal
    console.log('Transfer to seller:', conversationId);
    setIsOpen(true);
  };
  
  return (
    <button 
      onClick={handleTransfer}
      className="flex items-center space-x-2 px-3 py-2 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
    >
      <UserPlus className="w-4 h-4" />
      <span>Transferir</span>
    </button>
  );
};
