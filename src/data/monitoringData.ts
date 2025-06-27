
export interface ConversaVendedor {
  id: number;
  vendedor: string;
  cliente: string;
  clientePhone: string;
  tempoConversa: string;
  ultimaResposta: string;
  qualityScore: number;
  status: 'em_andamento' | 'alerta' | 'critico';
  risco: 'baixo' | 'medio' | 'alto';
  alertasGerados: number;
  recomendacoesPendentes: number;
  leadType: 'quente' | 'morno' | 'frio';
}

export interface Recomendacao {
  id: number;
  tipo: 'tecnica_venda' | 'urgencia' | 'cross_sell';
  vendedor: string;
  cliente: string;
  situacao: string;
  recomendacao: string;
  prioridade: 'baixa' | 'media' | 'alta';
  enviado: boolean;
  timestamp: string;
}

export interface Escalacao {
  id: number;
  vendedor: string;
  cliente: string;
  clientePhone: string;
  problema: string;
  risco: string;
  valorEstimado: string;
  destinatarios: string[];
  mensagemEnviada: string;
  timestamp: string;
  status: 'enviado' | 'resolvido';
}

export interface Metrica {
  titulo: string;
  valor: string;
  cor: 'verde' | 'azul' | 'laranja' | 'vermelho';
  icon: string;
  variacao?: string;
}

export const mockConversasVendedores: ConversaVendedor[] = [
  {
    id: 1,
    vendedor: "Antonio Silva",
    cliente: "João Silva",
    clientePhone: "51 99999-1234",
    tempoConversa: "15 min",
    ultimaResposta: "3 min atrás",
    qualityScore: 8.5,
    status: "em_andamento",
    risco: "baixo",
    alertasGerados: 0,
    recomendacoesPendentes: 1,
    leadType: "quente"
  },
  {
    id: 2,
    vendedor: "Carla Mendes",
    cliente: "Maria Santos",
    clientePhone: "51 99999-5678",
    tempoConversa: "45 min",
    ultimaResposta: "25 min atrás",
    qualityScore: 6.2,
    status: "alerta",
    risco: "medio",
    alertasGerados: 2,
    recomendacoesPendentes: 3,
    leadType: "morno"
  },
  {
    id: 3,
    vendedor: "Roberto Santos",
    cliente: "Pedro Costa",
    clientePhone: "51 99999-9012",
    tempoConversa: "1h 20min",
    ultimaResposta: "40 min atrás",
    qualityScore: 4.1,
    status: "critico",
    risco: "alto",
    alertasGerados: 5,
    recomendacoesPendentes: 2,
    leadType: "quente"
  }
];

export const mockRecomendacoes: Recomendacao[] = [
  {
    id: 1,
    tipo: "tecnica_venda",
    vendedor: "Carla Mendes",
    cliente: "Maria Santos",
    situacao: "Cliente demonstrou objeção sobre preço",
    recomendacao: "Olá Carla! Para o cliente Maria Santos (51 99999-5678), tente criar valor mostrando o ROI do investimento. Pergunte sobre o custo de não resolver o problema atual.",
    prioridade: "media",
    enviado: false,
    timestamp: "14:25"
  },
  {
    id: 2,
    tipo: "urgencia",
    vendedor: "Roberto Santos",
    cliente: "Pedro Costa",
    situacao: "Cliente quente não está recebendo atenção adequada",
    recomendacao: "URGENTE Roberto! O cliente Pedro Costa (51 99999-9012) é um lead QUENTE mas você não respondeu há 40 minutos. Ofereça uma visita técnica gratuita para gerar confiança!",
    prioridade: "alta",
    enviado: true,
    timestamp: "14:45"
  },
  {
    id: 3,
    tipo: "cross_sell",
    vendedor: "Antonio Silva",
    cliente: "João Silva",
    situacao: "Oportunidade de venda adicional identificada",
    recomendacao: "Antonio, o cliente João mencionou automação. Aproveite para apresentar nosso pacote completo de sensores inteligentes. Valor adicional de R$ 15k!",
    prioridade: "baixa",
    enviado: false,
    timestamp: "14:30"
  }
];

export const mockEscalacoes: Escalacao[] = [
  {
    id: 1,
    vendedor: "Roberto Santos",
    cliente: "Pedro Costa",
    clientePhone: "51 99999-9012",
    problema: "Vendedor não aplicou 3 recomendações consecutivas",
    risco: "PERDA DE VENDA QUENTE",
    valorEstimado: "R$ 80.000",
    destinatarios: ["Rodrigo (Gerente)", "Fabio (Diretor)"],
    mensagemEnviada: "🚨 ESCALAÇÃO URGENTE 🚨\n\nVendedor: Roberto Santos\nCliente: Pedro Costa (51 99999-9012)\nProblema: Não respondeu cliente QUENTE há 40min\nValor em Risco: R$ 80.000\nAção Necessária: Intervenção Imediata",
    timestamp: "14:50",
    status: "enviado"
  }
];

export const mockMetricas: Metrica[] = [
  {
    titulo: "Vendedores Ativos",
    valor: "8/12",
    cor: "verde",
    icon: "users"
  },
  {
    titulo: "Conversas Monitoradas",
    valor: "23",
    cor: "azul",
    icon: "messages"
  },
  {
    titulo: "Alertas Pendentes",
    valor: "3",
    cor: "laranja",
    icon: "alert"
  },
  {
    titulo: "Escalações Hoje",
    valor: "1",
    cor: "vermelho",
    icon: "arrow-up"
  }
];
