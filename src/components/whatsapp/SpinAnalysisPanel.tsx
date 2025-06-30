
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';

interface SpinAnalysisProps {
  analysis: {
    totalMessages: number;
    sellerMessages: number;
    clientMessages: number;
    questionsCount: number;
    questionRatio: number;
    avgQualityScore: number;
    flaggedCount: number;
  };
}

export const SpinAnalysisPanel: React.FC<SpinAnalysisProps> = ({ analysis }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQuestionRatioColor = (ratio: number) => {
    if (ratio >= 40) return 'text-green-600';
    if (ratio >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise SPIN da Conversa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Métricas Principais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.totalMessages}</div>
            <div className="text-xs text-gray-600">Total Mensagens</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className={`text-2xl font-bold ${getQuestionRatioColor(analysis.questionRatio)}`}>
              {analysis.questionRatio.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Taxa Perguntas</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className={`text-2xl font-bold ${getScoreColor(analysis.avgQualityScore)}`}>
              {analysis.avgQualityScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Score Médio</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{analysis.flaggedCount}</div>
            <div className="text-xs text-gray-600">Sinalizações</div>
          </div>
        </div>

        {/* Distribuição de Mensagens */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Distribuição de Mensagens</h4>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Vendedor: {analysis.sellerMessages}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Cliente: {analysis.clientMessages}
            </span>
          </div>
        </div>

        {/* Recomendações SPIN */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recomendações SPIN</h4>
          
          {analysis.questionRatio < 30 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Taxa de perguntas baixa ({analysis.questionRatio.toFixed(1)}%)</strong>
                <br />
                Recomendação: Usar mais perguntas SPIN para descobrir necessidades do cliente.
              </AlertDescription>
            </Alert>
          )}
          
          {analysis.avgQualityScore < 6 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Score de qualidade baixo ({analysis.avgQualityScore.toFixed(1)})</strong>
                <br />
                Recomendação: Revisar técnicas SPIN e personalizar mais as mensagens.
              </AlertDescription>
            </Alert>
          )}

          {analysis.flaggedCount > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>{analysis.flaggedCount} mensagem(ns) sinalizada(s)</strong>
                <br />
                Revisar mensagens marcadas para melhoria da qualidade.
              </AlertDescription>
            </Alert>
          )}

          {analysis.questionRatio >= 40 && analysis.avgQualityScore >= 8 && analysis.flaggedCount === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Excelente performance SPIN!</strong>
                <br />
                Conversa com boa taxa de perguntas e alta qualidade.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Dicas SPIN */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Dicas SPIN
          </h5>
          <ul className="text-xs space-y-1 text-gray-700">
            <li>• <strong>Situação:</strong> "Como funciona seu processo atual?"</li>
            <li>• <strong>Problema:</strong> "Que dificuldades você enfrenta?"</li>
            <li>• <strong>Implicação:</strong> "Como isso afeta seus resultados?"</li>
            <li>• <strong>Necessidade:</strong> "Seria útil ter uma solução para isso?"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
