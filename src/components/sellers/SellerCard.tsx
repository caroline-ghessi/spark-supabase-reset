
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Star, Clock } from 'lucide-react';
import type { RealSeller } from '@/data/realSellersData';

interface SellerCardProps {
  seller: RealSeller;
  category: string;
}

export const SellerCard = ({ seller, category }: SellerCardProps) => {
  const spinLevel = seller.performance_score >= 8.5 ? 'Expert' : 
                    seller.performance_score >= 7 ? 'Proficiente' : 'Em Desenvolvimento';
  
  const performanceColor = seller.performance_score >= 9 ? 'bg-green-100 text-green-800' :
                           seller.performance_score >= 7 ? 'bg-yellow-100 text-yellow-800' :
                           'bg-gray-100 text-gray-800';

  const getSpinExpertise = () => {
    if (category === 'ferramentas') return 'Perguntas de Problema (ROI)';
    if (category === 'energia') return 'Perguntas de Implicação (Economia)';
    if (category === 'construcao') return 'Perguntas de Necessidade (Prazo)';
    return seller.metadata?.spin_expertise || 'SPIN Geral';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{seller.name}</h4>
            <p className="text-sm text-gray-600">{seller.position}</p>
          </div>
          <div className="text-right">
            <Badge className={performanceColor}>
              <Star className="w-3 h-3 mr-1" />
              {seller.performance_score}
            </Badge>
            <div className="text-xs text-blue-600 mt-1">
              SPIN: {spinLevel}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Especialidades */}
          <div className="flex flex-wrap gap-1">
            {seller.specialties?.slice(0, 3).map(spec => (
              <Badge key={spec} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {seller.specialties && seller.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{seller.specialties.length - 3}
              </Badge>
            )}
          </div>

          {/* Contato */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Phone className="w-3 h-3 mr-1" />
              {seller.whatsapp_number}
            </div>
            <Badge className={seller.metadata?.whapi_integrated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
              {seller.metadata?.whapi_integrated ? 'Whapi ✓' : 'Pendente'}
            </Badge>
          </div>

          {/* Descrição */}
          {seller.metadata?.description && (
            <p className="text-xs text-gray-600">
              {seller.metadata.description}
            </p>
          )}

          {/* Indicadores especiais */}
          {seller.metadata?.tendency && (
            <div className="flex items-center text-xs text-amber-600">
              <Clock className="w-3 h-3 mr-1" />
              {seller.metadata.tendency === 'slow_response' && 'Atendimento mais lento'}
              {seller.metadata.tendency === 'fast_response' && 'Atendimento rápido'}
              {seller.metadata.tendency === 'slow_but_effective' && 'Lento mas eficaz'}
            </div>
          )}

          {seller.metadata?.specialty_focus && (
            <div className="text-xs text-blue-600">
              <strong>Foco:</strong> {
                seller.metadata.specialty_focus === 'architects' ? 'Arquitetos/Alto padrão' :
                seller.metadata.specialty_focus === 'b2b' ? 'B2B/Revendas' :
                seller.metadata.specialty_focus === 'construction' ? 'Construtoras' :
                seller.metadata.specialty_focus === 'ready_lists' ? 'Listas prontas' :
                seller.metadata.specialty_focus
              }
            </div>
          )}

          {/* Força SPIN específica */}
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <strong>Força SPIN:</strong> {getSpinExpertise()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
