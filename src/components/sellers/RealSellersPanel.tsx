
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Zap, Building, CheckCircle, Star } from 'lucide-react';
import { convertDatabaseSellerToRealSeller, type RealSeller } from '@/data/realSellersData';
import { SellersStats } from './SellersStats';
import { CategorySection } from './CategorySection';

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
        const convertedSellers = (data || []).map(convertDatabaseSellerToRealSeller);
        setSellers(convertedSellers);
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
      <SellersStats sellers={sellers} />

      {/* Category Sections */}
      <CategorySection 
        title="🔧 Ferramentas"
        icon={<Wrench className="w-5 h-5" />}
        sellers={ferramantasVendedores}
        category="ferramentas"
      />

      <CategorySection 
        title="☀️ Energia Solar"
        icon={<Zap className="w-5 h-5" />}
        sellers={energiaVendedores}
        category="energia"
        gridCols="md:grid-cols-2"
      />

      <CategorySection 
        title="🏗️ Construção Civil"
        icon={<Building className="w-5 h-5" />}
        sellers={construcaoVendedores}
        category="construcao"
      />
    </div>
  );
};
