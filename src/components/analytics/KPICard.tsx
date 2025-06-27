
import { Card, CardContent } from '../ui/card';
import { TrendingUp, DollarSign, ShieldCheck, Clock, CreditCard, Target } from 'lucide-react';
import { KPICard as KPICardType } from '../../data/analyticsData';

interface KPICardProps {
  kpi: KPICardType;
}

const iconMap = {
  'trending-up': TrendingUp,
  'dollar-sign': DollarSign,
  'shield-check': ShieldCheck,
  'clock': Clock,
  'credit-card': CreditCard,
  'target': Target,
};

const colorMap = {
  verde: 'text-green-600 bg-green-50',
  azul: 'text-blue-600 bg-blue-50',
  laranja: 'text-orange-600 bg-orange-50',
  vermelho: 'text-red-600 bg-red-50',
};

const variationColorMap = {
  excelente: 'text-green-600',
  bom: 'text-green-600',
  atencao: 'text-orange-600',
  critico: 'text-red-600',
};

export const KPICard = ({ kpi }: KPICardProps) => {
  const Icon = iconMap[kpi.icone as keyof typeof iconMap] || TrendingUp;
  const colorClass = colorMap[kpi.cor];
  const variationColor = variationColorMap[kpi.status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{kpi.titulo}</p>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{kpi.valor}</p>
              {kpi.meta && (
                <p className="text-sm text-gray-500">Meta: {kpi.meta}</p>
              )}
              {kpi.baseline && (
                <p className="text-sm text-gray-500">Base: {kpi.baseline}</p>
              )}
              {kpi.valor_estimado && (
                <p className="text-sm text-gray-500">Valor: {kpi.valor_estimado}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${variationColor}`}>
                {kpi.variacao}
              </span>
              <span className="text-sm text-gray-500">{kpi.periodo}</span>
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
