
import { useState } from 'react';
import { X, Star, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Conversation } from '../../types/conversation';
import { Seller, mockSellers } from '../../data/sellersData';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onTransfer: (sellerId: number, notes: string) => void;
}

export const TransferModal = ({ isOpen, onClose, conversation, onTransfer }: TransferModalProps) => {
  const [selectedSeller, setSelectedSeller] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleTransfer = () => {
    if (selectedSeller) {
      onTransfer(selectedSeller, notes);
      setSelectedSeller(null);
      setNotes('');
      onClose();
    }
  };

  const generateConversationSummary = (conv: Conversation | null) => {
    if (!conv) return '';
    return `Cliente: ${conv.clientName} (${conv.clientPhone})
Classificação: ${conv.leadType === 'hot' ? 'Cliente Quente 🔥' : conv.leadType === 'warm' ? 'Cliente Morno 🟡' : 'Cliente Frio 🔵'}
Última mensagem: "${conv.lastMessage}"
Tempo: ${conv.lastMessageTime}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Transferir Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Conversa */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Resumo da Conversa</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
              {generateConversationSummary(conversation)}
            </pre>
          </div>

          {/* Lista de Vendedores */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Selecionar Vendedor</h3>
            <div className="grid gap-3">
              {mockSellers.map((seller) => (
                <div
                  key={seller.id}
                  onClick={() => seller.disponivel && setSelectedSeller(seller.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    !seller.disponivel
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
                          {seller.nome.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{seller.nome}</h4>
                        <p className="text-sm text-gray-500">{seller.especialidade}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {seller.clientesAtuais}/{seller.maxClientes}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{seller.performance}</span>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        seller.disponivel
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {seller.disponivel ? 'Disponível' : 'Ocupado'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              placeholder="Adicione informações importantes para o vendedor..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!selectedSeller}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Transferir Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
