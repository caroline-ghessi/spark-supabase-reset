
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Conversation } from '../../types/conversation';

interface FinalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onFinalize: (reason: string, notes: string) => void;
}

const finalizationReasons = [
  { id: 'sale', label: 'Venda Fechada', color: 'green' },
  { id: 'no_interest', label: 'Cliente Sem Interesse', color: 'red' },
  { id: 'gave_up', label: 'Cliente Desistiu', color: 'yellow' },
  { id: 'no_budget', label: 'Sem Orçamento', color: 'blue' },
  { id: 'other', label: 'Outros', color: 'gray' }
];

export const FinalizeModal = ({ isOpen, onClose, conversation, onFinalize }: FinalizeModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleFinalize = () => {
    if (selectedReason) {
      onFinalize(selectedReason, notes);
      setSelectedReason('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Finalizar Conversa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cliente Info */}
          {conversation && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{conversation.clientName}</p>
              <p className="text-sm text-gray-500">{conversation.clientPhone}</p>
            </div>
          )}

          {/* Motivos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Motivo da Finalização
            </label>
            <div className="space-y-2">
              {finalizationReasons.map((reason) => (
                <div
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedReason === reason.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedReason === reason.id
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedReason === reason.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{reason.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações Finais
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o atendimento..."
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
              onClick={handleFinalize}
              disabled={!selectedReason}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Finalizar Conversa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
