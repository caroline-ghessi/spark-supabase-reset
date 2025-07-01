
import React from 'react';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { TemperatureBadges } from '@/components/ui/TemperatureBadges';
import { MessageSquare, Bot, User, AlertTriangle } from 'lucide-react';

interface DashboardStatsProps {
  user: any;
  conversations: any[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  user,
  conversations
}) => {
  if (!user) return null;

  const stats = {
    total: conversations.length,
    bot: conversations.filter(c => c.status === 'bot').length,
    manual: conversations.filter(c => c.status === 'manual').length,
    waiting: conversations.filter(c => c.status === 'waiting').length,
    hot: conversations.filter(c => c.lead_temperature === 'hot').length,
    warm: conversations.filter(c => c.lead_temperature === 'warm').length,
    cold: conversations.filter(c => c.lead_temperature === 'cold').length
  };

  const statsData = [
    {
      title: 'Total',
      value: stats.total,
      icon: MessageSquare,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      title: 'Bot',
      value: stats.bot,
      icon: Bot,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      title: 'Manual',
      value: stats.manual,
      icon: User,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100'
    },
    {
      title: 'Aguardando',
      value: stats.waiting,
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100'
    }
  ];

  const temperatureData = {
    hot: stats.hot,
    warm: stats.warm,
    cold: stats.cold
  };

  return (
    <>
      <StatsGrid stats={statsData} />
      <TemperatureBadges data={temperatureData} />
    </>
  );
};
