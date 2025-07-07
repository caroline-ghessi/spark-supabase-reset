import { useState, useEffect } from 'react';
import { Star, Users, Bot, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SimpleSeller {
  id: string;
  name: string;
  position: string;
  specialties: string[];
  current_clients: number;
  max_concurrent_clients: number;
  performance_score: number;
  metadata: any;
}

interface SimpleConversation {
  id: number;
  conversationId: string; // UUID real da conversa
  clientName: string;
  clientPhone: string;
  leadType: string;
  status: string;
}

interface SimpleTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: SimpleConversation | null;
  onTransfer: (sellerId: string, notes: string) => void;
}

export const SimpleTransferModal = ({ isOpen, onClose, conversation, onTransfer }: SimpleTransferModalProps) => {
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [sellers, setSellers] = useState<SimpleSeller[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationSummary, setConversationSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const { toast } = useToast();

  // Carregar vendedores reais do banco
  useEffect(() => {
    const loadSellers = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sellers')
          .select('id, name, position, specialties, current_clients, max_concurrent_clients, performance_score, metadata')
          .eq('status', 'active')
          .order('performance_score', { ascending: false });

        if (error) throw error;
        
        // Filtrar assistentes de IA
        const humanSellers = (data || []).filter(seller => {
          if (seller.metadata && typeof seller.metadata === 'object') {
            return !(seller.metadata as any).is_ai_assistant;
          }
          return true;
        });
        setSellers(humanSellers);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao carregar vendedores",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSellers();
  }, [isOpen, toast]);

  // Gerar resumo da conversa com IA
  useEffect(() => {
    const generateSummary = async () => {
      if (!isOpen || !conversation?.conversationId) {
        console.log('⚠️ Modal não aberto ou conversa sem ID:', { isOpen, conversationId: conversation?.conversationId });
        return;
      }
      
      setSummaryLoading(true);
      try {
        console.log(`🔄 Gerando resumo para conversa: ${conversation.conversationId}`);
        
        const { data, error } = await supabase.functions.invoke('generate-conversation-summary', {
          body: {
            conversation_id: conversation.conversationId
          }
        });

        console.log('📋 Resposta da função:', { data, error });

        if (error) {
          console.error('❌ Erro na função:', error);
          throw error;
        }
        
        if (data?.success === false) {
          console.warn('⚠️ Função retornou erro:', data);
          setConversationSummary(data.summary || 'Resumo não disponível');
          toast({
            title: "Aviso",
            description: `Resumo básico gerado: ${data.error === 'openai_not_configured' ? 'IA não configurada' : 'Falha na geração automática'}`,
            variant: "default",
          });
        } else {
          setConversationSummary(data.summary || 'Resumo não disponível');
          console.log('✅ Resumo gerado com sucesso');
        }
      } catch (error) {
        console.error('❌ Erro ao gerar resumo:', error);
        const fallbackSummary = `**Cliente:** ${conversation.clientName} (${conversation.clientPhone})
**Classificação:** ${conversation.leadType === 'hot' ? 'Cliente Quente 🔥' : conversation.leadType === 'warm' ? 'Cliente Morno 🟡' : 'Cliente Frio 🔵'}
**Status:** ${conversation.status}

_Erro ao gerar resumo detalhado. Verifique os logs da Edge Function._`;
        
        setConversationSummary(fallbackSummary);
        toast({
          title: "Erro",
          description: "Falha ao gerar resumo detalhado. Resumo básico disponível.",
          variant: "destructive",
        });
      } finally {
        setSummaryLoading(false);
      }
    };

    generateSummary();
  }, [isOpen, conversation, toast]);

  const handleTransfer = async () => {
    if (!selectedSeller) return;
    
    setLoading(true);
    try {
      await onTransfer(selectedSeller, notes);
      setSelectedSeller(null);
      setNotes('');
      onClose();
    } finally {
      setLoading(false);
    }
  };


  const getSellerAvailability = (seller: SimpleSeller) => {
    const usage = seller.current_clients / seller.max_concurrent_clients;
    if (usage >= 1) return { available: false, label: 'Ocupado', color: 'bg-red-100 text-red-800' };
    if (usage >= 0.8) return { available: true, label: 'Quase Cheio', color: 'bg-yellow-100 text-yellow-800' };
    return { available: true, label: 'Disponível', color: 'bg-green-100 text-green-800' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Transferir Cliente para Vendedor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Conversa */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              Resumo da Conversa
              {summaryLoading && (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h3>
            <div className="text-sm text-gray-600 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
              {summaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Gerando resumo detalhado...</p>
                  </div>
                </div>
              ) : (
                conversationSummary || 'Resumo não disponível'
              )}
            </div>
          </div>

          {/* Lista de Vendedores */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Selecionar Vendedor {loading && <span className="text-sm text-gray-500">(Carregando...)</span>}
            </h3>
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {sellers.map((seller) => {
                const availability = getSellerAvailability(seller);
                
                return (
                  <div
                    key={seller.id}
                    onClick={() => availability.available && setSelectedSeller(seller.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      !availability.available
                        ? 'opacity-50 cursor-not-allowed bg-gray-50'
                        : selectedSeller === seller.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {seller.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{seller.name}</h4>
                          <p className="text-sm text-gray-500">{seller.position}</p>
                          {seller.specialties && seller.specialties.length > 0 && (
                            <p className="text-xs text-gray-400">
                              {seller.specialties.slice(0, 2).join(', ')}
                              {seller.specialties.length > 2 && '...'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {seller.current_clients}/{seller.max_concurrent_clients}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{seller.performance_score}</span>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${availability.color}`}>
                          {availability.label}
                        </div>

                        {selectedSeller === seller.id && (
                          <CheckCircle className="w-5 h-5 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {sellers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum vendedor disponível encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações Adicionais
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione informações importantes para o vendedor (contexto adicional, urgência, etc.)..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Um resumo completo da conversa será gerado automaticamente pela IA e enviado junto com estas observações
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!selectedSeller || loading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? 'Transferindo...' : 'Transferir Cliente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};