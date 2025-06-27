
import React from 'react';

interface NotificationBadgeProps {
  count: number;
  type?: 'default' | 'urgent' | 'warning';
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  type = 'default',
  className = ''
}) => {
  if (count === 0) return null;

  const getStyles = () => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500 text-white animate-pulse';
      case 'warning':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <span className={`
      absolute -top-2 -right-2 inline-flex items-center justify-center 
      px-2 py-1 text-xs font-bold leading-none rounded-full
      min-w-[20px] h-5
      ${getStyles()}
      ${className}
      transform transition-all duration-200 hover:scale-110
    `}>
      {count > 99 ? '99+' : count}
    </span>
  );
};
