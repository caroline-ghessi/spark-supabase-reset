
import React from 'react';

interface LeadBadgeProps {
  type: 'hot' | 'warm' | 'cold';
}

export const LeadBadge: React.FC<LeadBadgeProps> = ({ type }) => {
  const styles = {
    hot: 'bg-red-100 text-red-800 border-red-200',
    warm: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    cold: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  const icons = { hot: '🔥', warm: '🟡', cold: '🔵' };
  const labels = { hot: 'Quente', warm: 'Morno', cold: 'Frio' };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${styles[type]}`}>
      <span className="mr-1">{icons[type]}</span>
      {labels[type]}
    </span>
  );
};
