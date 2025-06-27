
import React from 'react';

interface StatusBadgeProps {
  status: 'bot' | 'manual' | 'seller' | 'waiting' | 'closed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    bot: 'bg-blue-100 text-blue-800',
    manual: 'bg-green-100 text-green-800',
    seller: 'bg-purple-100 text-purple-800',
    waiting: 'bg-orange-100 text-orange-800',
    closed: 'bg-gray-100 text-gray-800'
  };
  
  const labels = {
    bot: 'Bot Ativo',
    manual: 'Manual', 
    seller: 'Vendedor',
    waiting: 'Aguardando',
    closed: 'Finalizada'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
