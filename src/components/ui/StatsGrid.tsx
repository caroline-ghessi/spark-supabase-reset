
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatsGridProps {
  stats: StatCardProps[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor
}) => {
  return (
    <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 min-h-[50px] flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-600 mb-1 truncate">{title}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      </div>
      <div 
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${iconBgColor}`}
      >
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
    </div>
  );
};

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid gap-2 mb-3 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
