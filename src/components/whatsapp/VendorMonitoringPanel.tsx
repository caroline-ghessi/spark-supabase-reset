import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorMessages, VendorMessage, VendorConversation } from '@/hooks/useVendorMessages';
import { SpinAnalysisPanel } from './SpinAnalysisPanel';
import { 
  MessageCircle, Search, Flag, CheckCircle, 
  AlertCircle, Star, Image, FileText, Mic, Video, MapPin
} from 'lucide-react';

export const VendorMonitoringPanel: React.FC = () => {
  const { user, isAdmin, isSupervisor } = useAuth();
  const {
    conversations,
    messages,
    loading,
    loadConversations,
    loadMessages,
    flagMessage,
    unflagMessage
  } = useVendorMessages();

  const [selectedConversation, setSelectedConversation] = useState<VendorConversation | null>(null);
  const [filters, setFilters] = useState({
    seller_id: '',
    flagged_only: false,
    date_from: '',
    search: ''
  });

  // Carregar conversas quando os filtros mudarem
  useEffect(() => {
    loadConversations(filters);
  }, [filters, loadConversations]);

  // Carregar mensagens quando uma conversa for selecionada
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversation_id);
    }
  }, [selectedConversation, loadMessages]);

  // Filtrar conversas por busca
  const filteredConversations = useMemo(() => {
    if (!filters.search) return conversations;
    
    const searchLower = filters.search.toLowerCase();
    return conversations.filter(conv => 
      conv.client_name?.toLowerCase().includes(searchLower) ||
      conv.client_phone.includes(searchLower) ||
      conv.seller_name.toLowerCase().includes(searchLower)
    );
  }, [conversations, filters.search]);

  // Obter mensagens da conversa selecionada
  const currentMessages = selectedConversation 
    ? messages[selectedConversation.conversation_id] || []
    : [];

  // Análise da conversa
  const conversationAnalysis = useMemo(() => {
    if (!currentMessages.length) return null;

    const sellerMessages = currentMessages.filter(m => m.is_from_seller);
    const clientMessages = currentMessages.filter(m => !m.is_from_seller);
    const questionsCount = sellerMessages.filter(m => m.text_content?.includes('?')).length;
    const avgScore = sellerMessages.reduce((acc, m) => acc + (m.quality_score || 0), 0) / sellerMessages.length;

    return {
      totalMessages: currentMessages.length,
      sellerMessages: sellerMessages.length,
      clientMessages: clientMessages.length,
      questionsCount,
      questionRatio: sellerMessages.length > 0 ? (questionsCount / sellerMessages.length * 100) : 0,
      avgQualityScore: avgScore || 0,
      flaggedCount: sellerMessages.filter(m => m.flagged_for_review).length
    };
  }, [currentMessages]);

  if (!isAdmin && !isSupervisor) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas administradores e supervisores podem acessar o monitoramento.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header com Filtros */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="p-4">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Monitoramento de Vendedores</h1>
          
          {/* Filtros de Busca */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou vendedor..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={filters.flagged_only}
                  onChange={(e) => setFilters(prev => ({ ...prev, flagged_only: e.target.checked }))}
                  className="rounded"
                />
                <Flag className="h-4 w-4 text-red-500" />
                <span className="text-sm">Apenas Sinalizadas</span>
              </label>

              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="w-40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Lista de Conversas */}
        <div className="w-full lg:w-1/3 xl:w-1/4 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="font-semibold">Conversas Ativas ({filteredConversations.length})</h2>
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando conversas...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma conversa encontrada
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {filteredConversations.map(conv => (
                  <ConversationCard
                    key={conv.conversation_id}
                    conversation={conv}
                    isSelected={selectedConversation?.conversation_id === conv.conversation_id}
                    onClick={() => setSelectedConversation(conv)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Visualizador de Mensagens */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {selectedConversation ? (
            <>
              {/* Header da Conversa */}
              <div className="p-4 border-b bg-white flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {selectedConversation.client_name || selectedConversation.client_phone}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      Vendedor: {selectedConversation.seller_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {selectedConversation.lead_temperature}
                      </Badge>
                      {selectedConversation.avg_quality_score && (
                        <Badge variant="outline" className="text-xs">
                          Score: {selectedConversation.avg_quality_score.toFixed(1)}
                        </Badge>
                      )}
                      {selectedConversation.flagged_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {selectedConversation.flagged_count} flags
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onFlag={flagMessage}
                      onUnflag={unflagMessage}
                      canModerate={isAdmin}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Análise da Conversa */}
              {conversationAnalysis && (
                <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                  <SpinAnalysisPanel analysis={conversationAnalysis} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Selecione uma conversa para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente do Card de Conversa
const ConversationCard: React.FC<{
  conversation: VendorConversation;
  isSelected: boolean;
  onClick: () => void;
}> = ({ conversation, isSelected, onClick }) => {
  return (
    <Card
      className={`cursor-pointer transition-colors ${
        isSelected
          ? 'border-orange-500 bg-orange-50'
          : 'hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {conversation.client_name || conversation.client_phone}
            </h4>
            <p className="text-xs text-gray-600 mt-1 truncate">
              {conversation.seller_name}
            </p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {conversation.last_message_text || 'Sem mensagens'}
            </p>
          </div>
          
          <div className="text-right ml-2 flex-shrink-0">
            <div className="flex items-center gap-1 mb-1">
              <Badge variant="outline" className="text-xs">
                {conversation.total_messages}
              </Badge>
              {conversation.flagged_count > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {conversation.flagged_count}
                </Badge>
              )}
            </div>
            
            {conversation.avg_quality_score && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs">
                  {conversation.avg_quality_score.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {conversation.last_message_at && 
            new Date(conversation.last_message_at).toLocaleString()
          }
        </div>
      </CardContent>
    </Card>
  );
};

// Componente da Mensagem
const MessageBubble: React.FC<{
  message: VendorMessage;
  onFlag: (messageId: string, notes?: string) => void;
  onUnflag: (messageId: string) => void;
  canModerate: boolean;
}> = ({ message, onFlag, onUnflag, canModerate }) => {
  const [showActions, setShowActions] = useState(false);
  const [flagNotes, setFlagNotes] = useState('');
  const [showFlagInput, setShowFlagInput] = useState(false);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'document': return FileText;
      case 'audio': return Mic;
      case 'video': return Video;
      case 'location': return MapPin;
      default: return MessageCircle;
    }
  };

  const Icon = getMessageIcon(message.message_type);

  const handleFlag = () => {
    if (flagNotes.trim()) {
      onFlag(message.id, flagNotes);
      setFlagNotes('');
      setShowFlagInput(false);
    } else {
      onFlag(message.id);
    }
  };

  return (
    <div
      className={`flex ${message.is_from_seller ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`
        max-w-[85%] sm:max-w-[70%] rounded-lg p-3 relative
        ${message.is_from_seller 
          ? 'bg-green-100 text-green-900' 
          : 'bg-gray-100 text-gray-900'}
        ${message.flagged_for_review ? 'ring-2 ring-red-500' : ''}
      `}>
        {/* Tipo de mensagem */}
        {message.message_type !== 'text' && (
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium capitalize">
              {message.message_type}
            </span>
          </div>
        )}

        {/* Conteúdo */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text_content || message.caption || '[Mídia]'}
        </p>

        {/* Metadados */}
        <div className="flex items-center gap-2 mt-2 text-xs opacity-70 flex-wrap">
          <span>{new Date(message.sent_at).toLocaleTimeString()}</span>
          {message.status === 'read' && <CheckCircle className="h-3 w-3" />}
          {message.quality_score && (
            <Badge variant="outline" className="text-xs">
              {message.quality_score.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Ações de Moderação */}
        {showActions && canModerate && (
          <div className="absolute -top-8 right-0 flex gap-1 z-10">
            {message.flagged_for_review ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUnflag(message.id)}
                className="h-7 px-2"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                OK
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFlagInput(true)}
                className="h-7 px-2"
              >
                <Flag className="h-3 w-3 mr-1" />
                Flag
              </Button>
            )}
          </div>
        )}

        {/* Input para notas da flag */}
        {showFlagInput && (
          <div className="mt-2 p-2 bg-white rounded border">
            <Input
              placeholder="Motivo da sinalização (opcional)"
              value={flagNotes}
              onChange={(e) => setFlagNotes(e.target.value)}
              className="text-xs mb-2"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleFlag}>
                Sinalizar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowFlagInput(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Notas de revisão */}
        {message.review_notes && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
            <strong>Sinalização:</strong> {message.review_notes}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Análise da Conversa
const ConversationAnalysis: React.FC<{
  analysis: {
    totalMessages: number;
    sellerMessages: number;
    clientMessages: number;
    questionsCount: number;
    questionRatio: number;
    avgQualityScore: number;
    flaggedCount: number;
  };
}> = ({ analysis }) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Análise da Conversa</h4>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-xl font-bold">{analysis.totalMessages}</div>
          <div className="text-xs text-gray-600">Total Mensagens</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold">{analysis.questionRatio.toFixed(1)}%</div>
          <div className="text-xs text-gray-600">Taxa Perguntas</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold">{analysis.avgQualityScore.toFixed(1)}</div>
          <div className="text-xs text-gray-600">Score Médio</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-bold text-red-600">{analysis.flaggedCount}</div>
          <div className="text-xs text-gray-600">Sinalizações</div>
        </div>
      </div>
      
      {/* Recomendações */}
      <div className="space-y-2">
        {analysis.questionRatio < 30 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Taxa de perguntas baixa ({analysis.questionRatio.toFixed(1)}%). Vendedor deve usar mais perguntas SPIN.
            </AlertDescription>
          </Alert>
        )}
        
        {analysis.avgQualityScore < 6 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Score de qualidade baixo ({analysis.avgQualityScore.toFixed(1)}). Recomendado treinamento SPIN.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};
