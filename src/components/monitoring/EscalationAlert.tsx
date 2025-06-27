
import { AlertTriangle, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Escalacao } from '../../data/monitoringData';

interface EscalationAlertProps {
  escalacao: Escalacao;
  onResolve?: (id: number) => void;
}

export const EscalationAlert = ({ escalacao, onResolve }: EscalationAlertProps) => {
  return (
    <Card className="border-l-4 border-red-500 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">ESCALAÇÃO CRÍTICA</h3>
          </div>
          <Badge className={`${
            escalacao.status === 'enviado' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {escalacao.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm">
              <span className="font-medium">Vendedor:</span> {escalacao.vendedor}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">
              <span className="font-medium">Cliente:</span> {escalacao.cliente} ({escalacao.clientePhone})
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm">
              <span className="font-medium">Valor em Risco:</span> {escalacao.valorEstimado}
            </span>
          </div>
        </div>

        <div className="bg-white p-3 rounded border mb-3">
          <p className="text-sm font-medium text-gray-900 mb-1">Problema:</p>
          <p className="text-sm text-gray-700">{escalacao.problema}</p>
        </div>

        <div className="bg-red-100 p-3 rounded border border-red-200 mb-3">
          <p className="text-sm font-medium text-red-900 mb-1">Risco:</p>
          <p className="text-sm text-red-800">{escalacao.risco}</p>
        </div>

        <div className="text-xs text-gray-600 mb-3">
          <p><span className="font-medium">Notificados:</span> {escalacao.destinatarios.join(', ')}</p>
          <p><span className="font-medium">Enviado em:</span> {escalacao.timestamp}</p>
        </div>

        {escalacao.status === 'enviado' && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onResolve?.(escalacao.id)}
              className="flex-1"
            >
              Marcar como Resolvido
            </Button>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              Intervir Agora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
