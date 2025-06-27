
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ConversaVendedor } from '../../data/monitoringData';

interface ConversationMonitorCardProps {
  conversa: ConversaVendedor;
}

export const ConversationMonitorCard = ({ conversa }: ConversationMonitorCardProps) => {
  const getRiskColor = (risco: string) => {
    switch (risco) {
      case 'alto': return 'border-red-500 bg-red-50';
      case 'medio': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'bg-red-100 text-red-800';
      case 'alerta': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getLeadEmoji = (leadType: string) => {
    switch (leadType) {
      case 'quente': return '🔥';
      case 'morno': return '🟡';
      default: return '🔵';
    }
  };

  return (
    <Card className={`border-l-4 ${getRiskColor(conversa.risco)}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {getLeadEmoji(conversa.leadType)} {conversa.cliente}
            </h3>
            <p className="text-sm text-gray-600">Vendedor: {conversa.vendedor}</p>
            <p className="text-xs text-gray-500">{conversa.clientePhone}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge className={getScoreColor(conversa.qualityScore)}>
              Score: {conversa.qualityScore}
            </Badge>
            <Badge className={getStatusColor(conversa.status)}>
              {conversa.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div>
            <span className="text-gray-500">Tempo:</span> {conversa.tempoConversa}
          </div>
          <div>
            <span className="text-gray-500">Última:</span> {conversa.ultimaResposta}
          </div>
          <div>
            <span className="text-gray-500">Alertas:</span> {conversa.alertasGerados}
          </div>
          <div>
            <span className="text-gray-500">Risco:</span> 
            <span className={`ml-1 font-semibold ${
              conversa.risco === 'alto' ? 'text-red-600' :
              conversa.risco === 'medio' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {conversa.risco.toUpperCase()}
            </span>
          </div>
        </div>
        
        {conversa.recomendacoesPendentes > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            <p className="text-orange-800 text-xs">
              {conversa.recomendacoesPendentes} recomendação(ões) pendente(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
