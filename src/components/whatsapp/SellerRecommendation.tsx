import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { SimpleTransferModal } from '@/components/modals/SimpleTransferModal';
import { 
  User, 
  TrendingUp, 
  Clock, 
  Target, 
  Star,
  UserPlus
} from 'lucide-react';
import { RealConversation } from '@/types/whatsapp';
import { toast } from 'sonner';

interface Seller {
  id: string;
  name: string;
  specialties: string[];
  performance_score: number;
  current_clients: number;
  max_concurrent_clients: number;
  status: string;
  work_schedule: any;
  whatsapp_number: string;
  response_time_avg: number;
}

interface SellerMatch {
  seller: Seller;
  score: number;
  reasons: string[];
  availability: 'alta' | 'média' | 'baixa';
}

interface SellerRecommendationProps {
  selectedConversation: RealConversation | null;
}

export const SellerRecommendation: React.FC<SellerRecommendationProps> = ({
  selectedConversation
}) => {
  const [matches, setMatches] = useState<SellerMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  // Extrair palavras-chave da conversa
  const extractKeywords = (conversation: RealConversation): string[] => {
    const text = `${conversation.client_name || ''} ${JSON.stringify(conversation.metadata || {})}`.toLowerCase();
    
    const keywords: string[] = [];
    
    // Categorias principais
    if (text.includes('construção') || text.includes('obra') || text.includes('material')) {
      keywords.push('construção', 'materiais');
    }
    if (text.includes('arquitet') || text.includes('projeto') || text.includes('design')) {
      keywords.push('arquitetura', 'projetos');
    }
    if (text.includes('empresa') || text.includes('corporat') || text.includes('cnpj')) {
      keywords.push('b2b', 'corporativo');
    }
    if (text.includes('residencial') || text.includes('casa') || text.includes('apartamento')) {
      keywords.push('residencial', 'pessoa física');
    }
    
    return keywords;
  };

  // Calcular score de compatibilidade
  const calculateMatchScore = (seller: Seller, conversation: RealConversation): SellerMatch => {
    let score = 0;
    const reasons: string[] = [];
    
    const keywords = extractKeywords(conversation);
    const specialties = seller.specialties || [];
    
    // Score por especialidades (peso 40%)
    let specialtyMatch = 0;
    keywords.forEach(keyword => {
      if (specialties.some(spec => spec.toLowerCase().includes(keyword))) {
        specialtyMatch += 1;
        reasons.push(`Especialista em ${keyword}`);
      }
    });
    score += (specialtyMatch / Math.max(keywords.length, 1)) * 40;
    
    // Score por performance (peso 30%)
    const performanceScore = (seller.performance_score / 10) * 30;
    score += performanceScore;
    if (seller.performance_score >= 8) {
      reasons.push(`Alta performance (${seller.performance_score}/10)`);
    }
    
    // Score por disponibilidade (peso 20%)
    const availabilityRate = 1 - (seller.current_clients / seller.max_concurrent_clients);
    const availabilityScore = availabilityRate * 20;
    score += availabilityScore;
    
    let availability: 'alta' | 'média' | 'baixa' = 'baixa';
    if (availabilityRate > 0.7) {
      availability = 'alta';
      reasons.push('Alta disponibilidade');
    } else if (availabilityRate > 0.4) {
      availability = 'média';
      reasons.push('Disponibilidade moderada');
    }
    
    // Score por tempo de resposta (peso 10%)
    const responseTimeScore = Math.max(0, (300 - seller.response_time_avg) / 300) * 10;
    score += responseTimeScore;
    if (seller.response_time_avg < 60) {
      reasons.push('Resposta rápida');
    }
    
    // Bonus por lead temperature match
    if (conversation.lead_temperature === 'hot' && seller.performance_score >= 8) {
      score += 5;
      reasons.push('Ideal para leads quentes');
    }
    
    return {
      seller,
      score: Math.round(score),
      reasons,
      availability
    };
  };

  // Carregar e analisar vendedores
  const loadSellerRecommendations = async () => {
    if (!selectedConversation) return;
    
    setLoading(true);
    try {
      const { data: sellers, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('status', 'active')
        .order('performance_score', { ascending: false });

      if (error) throw error;

      const matches = sellers
        .map(seller => calculateMatchScore(seller, selectedConversation))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Top 3

      setMatches(matches);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      toast.error('Erro ao carregar recomendações de vendedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      loadSellerRecommendations();
    } else {
      setMatches([]);
    }
  }, [selectedConversation]);

  const handleTransferClick = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsTransferModalOpen(true);
  };

  const handleTransfer = async (sellerId: string, notes: string) => {
    if (!selectedConversation) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('transfer-to-seller', {
        body: {
          conversation_id: selectedConversation.id,
          seller_id: sellerId,
          transfer_note: notes
        }
      });

      if (error) throw error;

      toast.success('Conversa transferida com sucesso!');
      setIsTransferModalOpen(false);
      
    } catch (error) {
      console.error('Erro ao transferir:', error);
      toast.error('Erro ao transferir conversa');
    }
  };

  if (!selectedConversation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Recomendação de Vendedor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Selecione uma conversa para ver recomendações de vendedores</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'alta': return 'text-green-600 bg-green-50';
      case 'média': return 'text-yellow-600 bg-yellow-50';
      case 'baixa': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Recomendação de Vendedor</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Para: {selectedConversation.client_name} ({selectedConversation.client_phone})
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div 
                  key={match.seller.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {match.seller.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{match.seller.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={getScoreColor(match.score)}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {match.score}% compatível
                            </Badge>
                            <Badge 
                              variant="outline"
                              className={getAvailabilityColor(match.availability)}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {match.availability}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span>
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            Performance: {match.seller.performance_score}/10
                          </span>
                          <span>
                            Clientes: {match.seller.current_clients}/{match.seller.max_concurrent_clients}
                          </span>
                        </div>
                        
                        {match.reasons.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <strong>Por que:</strong> {match.reasons.join(', ')}
                          </div>
                        )}
                        
                        {match.seller.specialties && match.seller.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {match.seller.specialties.slice(0, 3).map((specialty, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleTransferClick(match.seller)}
                      className="ml-4 flex items-center space-x-1"
                      variant={index === 0 ? "default" : "outline"}
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Transferir</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Nenhum vendedor disponível no momento</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SimpleTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        conversation={selectedConversation ? {
          id: parseInt(selectedConversation.id.replace(/-/g, '').substring(0, 8), 16),
          conversationId: selectedConversation.id,
          clientName: selectedConversation.client_name || 'Cliente',
          clientPhone: selectedConversation.client_phone,
          leadType: selectedConversation.lead_temperature as any,
          status: selectedConversation.status as any
        } : null}
        onTransfer={handleTransfer}
      />
    </>
  );
};