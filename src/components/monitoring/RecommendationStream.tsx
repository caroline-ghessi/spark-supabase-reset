
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Lightbulb, Send, Clock } from 'lucide-react';
import { Recomendacao } from '../../data/monitoringData';

interface RecommendationStreamProps {
  recomendacoes: Recomendacao[];
}

export const RecommendationStream = ({ recomendacoes }: RecommendationStreamProps) => {
  const [recommendations, setRecommendations] = useState(recomendacoes);

  useEffect(() => {
    // Simular novas recomendações chegando
    const interval = setInterval(() => {
      // Atualizar status aleatoriamente para simular tempo real
      setRecommendations(prev => 
        prev.map(rec => ({
          ...rec,
          enviado: Math.random() > 0.7 ? true : rec.enviado
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'urgencia': return 'text-red-600';
      case 'tecnica_venda': return 'text-blue-600';
      default: return 'text-green-600';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-orange-500" />
          Recomendações IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-lg border-l-4 ${
              rec.prioridade === 'alta' ? 'border-red-500 bg-red-50' :
              rec.prioridade === 'media' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(rec.prioridade)}>
                  {rec.prioridade.toUpperCase()}
                </Badge>
                <span className={`text-sm font-medium ${getTypeColor(rec.tipo)}`}>
                  {rec.tipo.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {rec.enviado ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Send className="w-3 h-3 mr-1" />
                    Enviado
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendente
                  </Badge>
                )}
                <span className="text-xs text-gray-500">{rec.timestamp}</span>
              </div>
            </div>
            
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-900">
                Para: {rec.vendedor} → {rec.cliente}
              </p>
              <p className="text-xs text-gray-600 mb-2">{rec.situacao}</p>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <p className="text-sm text-gray-800">{rec.recomendacao}</p>
            </div>
            
            {!rec.enviado && (
              <div className="mt-2 flex justify-end">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                  <Send className="w-4 h-4 mr-1" />
                  Enviar Agora
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
