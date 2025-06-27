
import React, { useState } from 'react';

interface TakeControlButtonProps {
  conversationId: string;
  currentStatus: string;
  onTakeControl: () => Promise<void>;
}

export const TakeControlButton: React.FC<TakeControlButtonProps> = ({
  conversationId,
  currentStatus,
  onTakeControl
}) => {
  const [taking, setTaking] = useState(false);
  
  const handleTakeControl = async () => {
    setTaking(true);
    try {
      await onTakeControl();
    } finally {
      setTaking(false);
    }
  };
  
  if (currentStatus === 'manual') {
    return (
      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
        🟢 No Controle
      </span>
    );
  }
  
  return (
    <button 
      onClick={handleTakeControl}
      disabled={taking}
      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {taking ? 'Assumindo...' : '👆 Assumir Controle'}
    </button>
  );
};
