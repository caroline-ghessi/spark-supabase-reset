
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SellerCard } from './SellerCard';
import type { RealSeller } from '@/data/realSellersData';

interface CategorySectionProps {
  title: string;
  icon: React.ReactNode;
  sellers: RealSeller[];
  category: string;
  gridCols?: string;
}

export const CategorySection = ({ 
  title, 
  icon, 
  sellers, 
  category, 
  gridCols = "md:grid-cols-2 lg:grid-cols-3" 
}: CategorySectionProps) => {
  if (sellers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${
          category === 'ferramentas' ? 'text-orange-600' :
          category === 'energia' ? 'text-yellow-600' :
          category === 'construcao' ? 'text-blue-600' :
          'text-gray-600'
        }`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${gridCols}`}>
          {sellers.map(seller => (
            <SellerCard key={seller.id} seller={seller} category={category} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
