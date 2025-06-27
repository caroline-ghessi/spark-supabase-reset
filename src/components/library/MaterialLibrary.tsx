
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockLibraryData, type Material, type Category } from '@/data/libraryData';
import { 
  Search, 
  Download, 
  Share2, 
  Eye, 
  Star, 
  Upload,
  FileText,
  Video,
  DollarSign,
  Presentation
} from 'lucide-react';

export const MaterialLibrary = () => {
  const [categories] = useState<Category[]>(mockLibraryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const getIconComponent = (iconName: string) => {
    const icons = {
      'presentation': Presentation,
      'video': Video,
      'file-text': FileText,
      'dollar-sign': DollarSign
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  const getTypeColor = (tipo: string) => {
    const colors = {
      powerpoint: 'bg-orange-100 text-orange-800',
      pdf: 'bg-red-100 text-red-800',
      excel: 'bg-green-100 text-green-800',
      video: 'bg-purple-100 text-purple-800',
      image: 'bg-blue-100 text-blue-800',
      template: 'bg-gray-100 text-gray-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredMaterials = categories.flatMap(category => 
    category.arquivos.filter(material =>
      material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const handleDownload = (material: Material) => {
    console.log('Downloading:', material.nome);
    // Implementar lógica de download
  };

  const handleShare = (material: Material) => {
    console.log('Sharing:', material.nome);
    // Implementar lógica de compartilhamento
  };

  const MaterialCard = ({ material }: { material: Material }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {material.tipo === 'video' && <Video className="w-6 h-6 text-purple-600" />}
              {material.tipo === 'powerpoint' && <Presentation className="w-6 h-6 text-orange-600" />}
              {material.tipo === 'pdf' && <FileText className="w-6 h-6 text-red-600" />}
              {material.tipo === 'excel' && <FileText className="w-6 h-6 text-green-600" />}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base leading-tight">{material.nome}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <span>{material.tamanho}</span>
                {material.versao && <span>• v{material.versao}</span>}
                {material.duracao && <span>• {material.duracao}</span>}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 text-xs">
              {material.metricas.taxaConversao}% conversão
            </Badge>
            <Button variant="ghost" size="sm">
              <Star className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {material.tags.slice(0, 4).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {material.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{material.tags.length - 4}
            </Badge>
          )}
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>{material.metricas.downloads} downloads</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{material.metricas.visualizacoes} visualizações</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={() => handleDownload(material)}
            className="bg-blue-500 hover:bg-blue-600 flex-1"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Baixar
          </Button>
          <Button 
            onClick={() => handleShare(material)}
            className="bg-orange-500 hover:bg-orange-600 flex-1"
            size="sm"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Copiar Link
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Biblioteca de Materiais</h2>
          <p className="text-gray-600">Acesse e gerencie materiais de vendas</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Upload className="w-4 h-4 mr-2" />
          Novo Material
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icone);
          return (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{category.nome}</p>
                    <p className="text-2xl font-bold">{category.arquivos.length}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    category.cor === 'azul' ? 'bg-blue-100' :
                    category.cor === 'roxo' ? 'bg-purple-100' :
                    category.cor === 'verde' ? 'bg-green-100' :
                    'bg-orange-100'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      category.cor === 'azul' ? 'text-blue-600' :
                      category.cor === 'roxo' ? 'text-purple-600' :
                      category.cor === 'verde' ? 'text-green-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar materiais por nome ou tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Materiais</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id.toString()}>
              {category.nome}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id.toString()}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.arquivos.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
