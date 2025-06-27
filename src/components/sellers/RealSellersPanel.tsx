
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Star, Users, Zap, Wrench, Building, Clock, CheckCircle } from 'lucide-react';
import type { RealSeller } from '@/data/realSellersData';

export const RealSellersPanel = () => {
  const [sellers, setSellers] = useState<RealSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRealSellers = async () => {
      console.log('🎯 Carregando vendedores reais...');
      
      try {
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('status', 'active')
          .order('performance_score', { ascending: false });
        
        if (error) {
          console.error('❌ Erro ao buscar vendedores:', error);
          toast({
            title: "Erro",
            description: "Falha ao carregar vendedores",
            variant: "destructive",
          });
          return;
        }
        
        console.log('✅ Vendedores carregados:', data?.length || 0);
        setSellers(data || []);
      } catch (error) {
        console.error('❌ Erro na busca de vendedores:', error);
        toast({
          title: "Erro",
          description: "Erro de conexão ao carregar vendedores",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealSellers();
  }, [toast]);

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'ferramentas': return <Wrench className="w-5 h-5 text-orange-600" />;
      case 'energia': return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'construcao': return <Building className="w-5 h-5 text-blue-600" />;
      default: return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryTitle = (categoria: string) => {
    switch (categoria) {
      case 'ferramentas': return '🔧 Ferramentas';
      case 'energia': return '☀️ Energia Solar';
      case 'construcao': return '🏗️ Construção Civil';
      default: return '📋 Geral';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'ferramentas': return 'text-orange-600';
      case 'energia': return 'text-yellow-600';
      case 'construcao': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vendedores...</p>
        </div>
      </div>
    );
  }

  const ferramantasVendedores = sellers.filter(s => s.specialties?.includes('Ferramentas'));
  const energiaVendedores = sellers.filter(s => s.specialties?.includes('Energia Solar'));
  const construcaoVendedores = sellers.filter(s => s.specialties?.includes('Telha Shingle') || s.specialties?.includes('Drywall'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipe de Vendas</h2>
          <p className="text-gray-600">Vendedores treinados em SPIN Selling</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {sellers.length} ativos
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <Star className="w-3 h-3 mr-1" />
            100% SPIN Trained
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vendedores</p>
                <p className="text-2xl font-bold">{sellers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ferramentas</p>
                <p className="text-2xl font-bold">{ferramantasVendedores.length}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energia Solar</p>
                <p className="text-2xl font-bold">{energiaVendedores.length}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Construção</p>
                <p className="text-2xl font-bold">{construcaoVendedores.length}</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ferramentas */}
      {ferramantasVendedores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Wrench className="w-5 h-5" />
              🔧 Ferramentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ferramantasVendedores.map(seller => (
                <SellerCard key={seller.id} seller={seller} category="ferramentas" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Energia Solar */}
      {energiaVendedores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Zap className="w-5 h-5" />
              ☀️ Energia Solar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {energiaVendedores.map(seller => (
                <SellerCard key={seller.id} seller={seller} category="energia" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Construção Civil */}
      {construcaoVendedores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Building className="w-5 h-5" />
              🏗️ Construção Civil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {construcaoVendedores.map(seller => (
                <SellerCard key={seller.id} seller={seller} category="construcao" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SellerCardProps {
  seller: RealSeller;
  category: string;
}

const SellerCard = ({ seller, category }: SellerCardProps) => {
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
