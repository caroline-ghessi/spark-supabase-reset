
import { Users, MessageCircle, AlertTriangle, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Metrica } from '../../data/monitoringData';

interface MetricCardProps {
  metrica: Metrica;
}

const iconMap = {
  users: Users,
  messages: MessageCircle,
  alert: AlertTriangle,
  'arrow-up': ArrowUp,
};

const colorMap = {
  verde: 'text-green-600 bg-green-50',
  azul: 'text-blue-600 bg-blue-50',
  laranja: 'text-orange-600 bg-orange-50',
  vermelho: 'text-red-600 bg-red-50',
};

export const MetricCard = ({ metrica }: MetricCardProps) => {
  const Icon = iconMap[metrica.icon as keyof typeof iconMap] || Users;
  const colorClass = colorMap[metrica.cor];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{metrica.titulo}</p>
            <p className="text-2xl font-bold text-gray-900">{metrica.valor}</p>
            {metrica.variacao && (
              <p className="text-sm text-green-600">{metrica.variacao}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
