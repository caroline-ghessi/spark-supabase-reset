
import { Card, CardContent } from '@/components/ui/card';
import { Users, Wrench, Zap, Building } from 'lucide-react';
import type { RealSeller } from '@/data/realSellersData';

interface SellersStatsProps {
  sellers: RealSeller[];
}

export const SellersStats = ({ sellers }: SellersStatsProps) => {
  const ferramantasVendedores = sellers.filter(s => s.specialties?.includes('Ferramentas'));
  const energiaVendedores = sellers.filter(s => s.specialties?.includes('Energia Solar'));
  const construcaoVendedores = sellers.filter(s => s.specialties?.includes('Telha Shingle') || s.specialties?.includes('Drywall'));

  return (
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
  );
};
