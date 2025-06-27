
export interface KPICard {
  titulo: string;
  valor: string;
  meta?: string;
  baseline?: string;
  valor_estimado?: string;
  variacao: string;
  periodo: string;
  status: 'excelente' | 'bom' | 'atencao' | 'critico';
  cor: 'verde' | 'azul' | 'laranja' | 'vermelho';
  icone: string;
}

export interface ConversaoMensal {
  mes: string;
  conversoes: number;
  meta: number;
  valor: number;
}

export interface VendedorPerformance {
  posicao: number;
  vendedor: string;
  conversoes: number;
  meta: number;
  ticketMedio: number;
  taxaConversao: number;
  scoreQualidade: number;
  tempoMedioFechamento: string;
  clientesAtivos: number;
  recomendacoesIA: {
    recebidas: number;
    implementadas: number;
    taxa_implementacao: number;
  };
  trend: 'subindo' | 'estavel' | 'descendo';
}

export interface EtapaFunil {
  nome: string;
  quantidade: number;
  percentual: number;
  cor: string;
}

export interface GargaloFunil {
  etapa: string;
  perda: number;
  percentual_perda: number;
  motivo_principal: string;
  acao_sugerida: string;
}

export interface AgenteIA {
  agente: string;
  versao: string;
  precisao: number;
  recall?: number;
  f1_score?: number;
  classificacoes_mes?: number;
  acertos?: number;
  erros?: number;
  matches_realizados?: number;
  matches_corretos?: number;
  avaliacoes_realizadas?: number;
  alertas_gerados?: number;
  alertas_corretos?: number;
  principais_erros?: string[];
  melhorias_sugeridas?: string[];
  taxa_satisfacao_vendedor?: number;
  taxa_conversao_matches?: number;
  tempo_medio_match?: string;
  correlacao_resultado?: number;
  taxa_precisao_alertas?: number;
}

export const mockKPIs: KPICard[] = [
  {
    titulo: "Conversões Este Mês",
    valor: "127",
    meta: "150",
    variacao: "+23%",
    periodo: "vs mês anterior",
    status: "atencao",
    cor: "laranja",
    icone: "trending-up"
  },
  {
    titulo: "ROI da Plataforma",
    valor: "340%",
    baseline: "200%",
    variacao: "+15%",
    periodo: "últimos 6 meses",
    status: "excelente",
    cor: "verde",
    icone: "dollar-sign"
  },
  {
    titulo: "Leads Salvos pela IA",
    valor: "43",
    valor_estimado: "R$ 1.8M",
    variacao: "+67%",
    periodo: "este mês",
    status: "excelente",
    cor: "verde",
    icone: "shield-check"
  },
  {
    titulo: "Tempo Médio Fechamento",
    valor: "5.2 dias",
    meta: "7 dias",
    variacao: "-28%",
    periodo: "últimos 30 dias",
    status: "excelente",
    cor: "verde",
    icone: "clock"
  },
  {
    titulo: "Ticket Médio",
    valor: "R$ 42.5k",
    meta: "R$ 35k",
    variacao: "+18%",
    periodo: "últimos 90 dias",
    status: "excelente",
    cor: "verde",
    icone: "credit-card"
  },
  {
    titulo: "Taxa Conversão Geral",
    valor: "73%",
    baseline: "45%",
    variacao: "+8%",
    periodo: "média do setor",
    status: "excelente",
    cor: "verde",
    icone: "target"
  }
];

export const mockEvolucaoConversoes: ConversaoMensal[] = [
  { mes: "Jan", conversoes: 89, meta: 80, valor: 3850000 },
  { mes: "Fev", conversoes: 94, meta: 85, valor: 4120000 },
  { mes: "Mar", conversoes: 103, meta: 95, valor: 4890000 },
  { mes: "Abr", conversoes: 87, meta: 90, valor: 3920000 },
  { mes: "Mai", conversoes: 112, meta: 100, valor: 5340000 },
  { mes: "Jun", conversoes: 127, meta: 110, valor: 6180000 },
  { mes: "Jul", conversoes: 134, meta: 120, valor: 6720000 },
  { mes: "Ago", conversoes: 145, meta: 130, valor: 7290000 },
  { mes: "Set", conversoes: 139, meta: 135, valor: 6950000 },
  { mes: "Out", conversoes: 156, meta: 140, valor: 7890000 },
  { mes: "Nov", conversoes: 163, meta: 145, valor: 8240000 },
  { mes: "Dez", conversoes: 127, meta: 150, valor: 6480000 }
];

export const mockRankingVendedores: VendedorPerformance[] = [
  {
    posicao: 1,
    vendedor: "Carla Mendes",
    conversoes: 34,
    meta: 25,
    ticketMedio: 28500,
    taxaConversao: 91,
    scoreQualidade: 9.4,
    tempoMedioFechamento: "3.2 dias",
    clientesAtivos: 6,
    recomendacoesIA: {
      recebidas: 45,
      implementadas: 42,
      taxa_implementacao: 93
    },
    trend: "subindo"
  },
  {
    posicao: 2,
    vendedor: "Antonio Silva", 
    conversoes: 28,
    meta: 30,
    ticketMedio: 67800,
    taxaConversao: 78,
    scoreQualidade: 8.9,
    tempoMedioFechamento: "6.1 dias",
    clientesAtivos: 8,
    recomendacoesIA: {
      recebidas: 32,
      implementadas: 28,
      taxa_implementacao: 87
    },
    trend: "estavel"
  },
  {
    posicao: 3,
    vendedor: "Roberto Santos",
    conversoes: 19,
    meta: 22,
    ticketMedio: 34200,
    taxaConversao: 64,
    scoreQualidade: 7.1,
    tempoMedioFechamento: "8.7 dias",
    clientesAtivos: 12,
    recomendacoesIA: {
      recebidas: 67,
      implementadas: 23,
      taxa_implementacao: 34
    },
    trend: "descendo"
  }
];

export const mockFunnelEtapas: EtapaFunil[] = [
  {
    nome: "Mensagens Recebidas",
    quantidade: 1847,
    percentual: 100,
    cor: "azul"
  },
  {
    nome: "Classificadas pela IA",
    quantidade: 1723,
    percentual: 93.3,
    cor: "roxo"
  },
  {
    nome: "Atendidas por Vendedor",
    quantidade: 892,
    percentual: 48.3,
    cor: "laranja"
  },
  {
    nome: "Propostas Enviadas",
    quantidade: 456,
    percentual: 24.7,
    cor: "amarelo"
  },
  {
    nome: "Vendas Fechadas",
    quantidade: 267,
    percentual: 14.5,
    cor: "verde"
  }
];

export const mockGargalos: GargaloFunil[] = [
  {
    etapa: "Classificadas -> Atendidas",
    perda: 831,
    percentual_perda: 48.2,
    motivo_principal: "Leads frios não priorizados",
    acao_sugerida: "Automatizar nurturing de leads frios"
  },
  {
    etapa: "Atendidas -> Propostas",
    perda: 436,
    percentual_perda: 48.9,
    motivo_principal: "Qualificação inadequada",
    acao_sugerida: "Melhorar script de qualificação"
  }
];

export const mockAgentesIA: AgenteIA[] = [
  {
    agente: "Classificador de Clientes",
    versao: "2.1",
    precisao: 91.4,
    recall: 88.7,
    f1_score: 90.0,
    classificacoes_mes: 1723,
    acertos: 1575,
    erros: 148,
    principais_erros: [
      "Classificou morno como quente (23 casos)",
      "Classificou frio como morno (15 casos)"
    ],
    melhorias_sugeridas: [
      "Ajustar peso de palavras de urgência",
      "Considerar histórico do cliente"
    ]
  },
  {
    agente: "Matcher Vendedor-Cliente",
    versao: "1.8",
    precisao: 94.2,
    matches_realizados: 892,
    matches_corretos: 841,
    taxa_satisfacao_vendedor: 87.3,
    taxa_conversao_matches: 76.8,
    tempo_medio_match: "0.3 segundos"
  },
  {
    agente: "Monitor de Qualidade",
    versao: "3.0",
    precisao: 85.9,
    avaliacoes_realizadas: 2847,
    correlacao_resultado: 0.89,
    alertas_gerados: 234,
    alertas_corretos: 201,
    taxa_precisao_alertas: 85.9
  }
];

export const mockImpactoIA = {
  leadsClassificados: {
    quente: { quantidade: 234, conversao: 189, percentual: 38 },
    morno: { quantidade: 445, conversao: 267, percentual: 60 },
    frio: { quantidade: 189, conversao: 23, percentual: 12 }
  },
  recomendacoesImplementadas: {
    total: 892,
    implementadas: 674,
    taxa_implementacao: 75.6,
    resultado_positivo: 589,
    taxa_sucesso: 87.4
  }
};

export const mockROIAutomacao = {
  economia_mensal: {
    horas_economizadas: 287,
    custo_hora_operador: 45,
    economia_total: 12915,
    percentual_reducao_custo: 34.7
  },
  melhoria_conversao: {
    conversao_antes_ia: 52.3,
    conversao_com_ia: 73.1,
    melhoria_percentual: 39.8,
    vendas_adicionais_mes: 67,
    receita_adicional: 2890000
  },
  leads_salvos: {
    leads_que_seriam_perdidos: 43,
    valor_medio_lead_salvo: 42000,
    valor_total_salvo: 1806000
  }
};
