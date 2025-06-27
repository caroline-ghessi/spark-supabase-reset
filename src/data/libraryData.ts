
export interface Material {
  id: number;
  nome: string;
  tipo: 'powerpoint' | 'pdf' | 'excel' | 'video' | 'image' | 'template';
  tamanho: string;
  versao?: string;
  duracao?: string;
  resolucao?: string;
  paginas?: number;
  criadoEm: string;
  atualizadoEm?: string;
  criadoPor: string;
  url: string;
  thumbnail?: string;
  tags: string[];
  metricas: {
    downloads: number;
    visualizacoes: number;
    compartilhamentos: number;
    conversoes: number;
    taxaConversao: number;
    tempoMedioVisualizacao?: string;
    tempoMedioAssistido?: string;
    taxaCompleta?: number;
    tempoMedioLeitura?: string;
    acessos?: number;
  };
  recomendadoPara: string[];
  momentoIdeal: string;
  restricao?: string;
  alertaVencimento?: string;
}

export interface Category {
  id: number;
  nome: string;
  icone: string;
  cor: string;
  descricao: string;
  permissao: string;
  arquivos: Material[];
}

export interface LibraryRecommendation {
  contexto: string;
  clienteId: number;
  clienteNome: string;
  momentoConversa: string;
  materiaisRecomendados: {
    materialId: number;
    nome: string;
    motivo: string;
    probabilidadeConversao: number;
    prioridade: 'alta' | 'media' | 'baixa';
  }[];
  sugestaoMensagem: string;
  observacao: string;
}

export const mockLibraryData: Category[] = [
  {
    id: 1,
    nome: "Apresentações Comerciais",
    icone: "presentation",
    cor: "azul",
    descricao: "Materiais para apresentação de produtos e serviços",
    permissao: "todos",
    arquivos: [
      {
        id: 101,
        nome: "Apresentação Automação Industrial 2024",
        tipo: "powerpoint",
        tamanho: "2.3MB",
        versao: "1.4",
        criadoEm: "2024-01-10",
        atualizadoEm: "2024-01-15",
        criadoPor: "Carol",
        url: "/files/apresentacao-automacao-2024.pptx",
        thumbnail: "/thumbs/apresentacao-automacao.jpg",
        tags: ["industrial", "automacao", "b2b", "corporativo"],
        metricas: {
          downloads: 47,
          visualizacoes: 234,
          compartilhamentos: 89,
          conversoes: 34,
          taxaConversao: 87.2,
          tempoMedioVisualizacao: "4:32"
        },
        recomendadoPara: ["cliente_corporativo", "lead_quente", "projeto_grande"],
        momentoIdeal: "descoberta_necessidade"
      },
      {
        id: 102,
        nome: "Pitch Deck Soluções Residenciais",
        tipo: "powerpoint",
        tamanho: "1.8MB",
        versao: "2.1",
        criadoEm: "2024-01-08",
        atualizadoEm: "2024-01-14",
        criadoPor: "Carol",
        url: "/files/pitch-residencial.pptx",
        thumbnail: "/thumbs/pitch-residencial.jpg",
        tags: ["residencial", "automacao", "b2c", "familia"],
        metricas: {
          downloads: 62,
          visualizacoes: 187,
          compartilhamentos: 45,
          conversoes: 28,
          taxaConversao: 74.3
        },
        recomendadoPara: ["cliente_residencial", "lead_morno", "primeira_apresentacao"],
        momentoIdeal: "apresentacao_solucao"
      }
    ]
  },
  {
    id: 2,
    nome: "Vídeos Demonstrativos",
    icone: "video",
    cor: "roxo",
    descricao: "Demonstrações técnicas e cases de sucesso",
    permissao: "todos",
    arquivos: [
      {
        id: 201,
        nome: "Demo Sensor Inteligente IoT",
        tipo: "video",
        duracao: "3:45",
        tamanho: "45MB",
        resolucao: "1080p",
        criadoEm: "2024-01-12",
        url: "/videos/demo-sensor-iot.mp4",
        thumbnail: "/thumbs/demo-sensor.jpg",
        tags: ["sensor", "iot", "demo", "tecnico"],
        metricas: {
          visualizacoes: 156,
          downloads: 0,
          compartilhamentos: 23,
          conversoes: 19,
          taxaConversao: 12.2,
          tempoMedioAssistido: "2:48",
          taxaCompleta: 74.4
        },
        recomendadoPara: ["cliente_tecnico", "lead_quente", "objecao_tecnica"],
        momentoIdeal: "demonstracao_produto"
      }
    ]
  },
  {
    id: 3,
    nome: "Documentos Técnicos",
    icone: "file-text",
    cor: "verde",
    descricao: "Especificações, manuais e documentação",
    permissao: "vendedor_supervisor_admin",
    arquivos: [
      {
        id: 301,
        nome: "Especificações Técnicas Completas",
        tipo: "pdf",
        tamanho: "3.2MB",
        paginas: 24,
        criadoEm: "2024-01-09",
        url: "/docs/especificacoes-tecnicas.pdf",
        tags: ["especificacao", "tecnico", "detalhado"],
        restricao: "apenas_vendedores",
        metricas: {
          downloads: 89,
          visualizacoes: 89,
          compartilhamentos: 0,
          conversoes: 0,
          taxaConversao: 0,
          tempoMedioLeitura: "8:15"
        },
        recomendadoPara: ["cliente_tecnico"],
        momentoIdeal: "especificacao_tecnica"
      }
    ]
  },
  {
    id: 4,
    nome: "Tabelas de Preços",
    icone: "dollar-sign",
    cor: "laranja",
    descricao: "Preços, condições e propostas",
    permissao: "vendedor_supervisor_admin",
    arquivos: [
      {
        id: 401,
        nome: "Tabela Preços Q1 2024",
        tipo: "excel",
        tamanho: "890KB",
        versao: "1.2",
        criadoEm: "2024-01-01",
        atualizadoEm: "2024-01-15",
        url: "/pricing/tabela-precos-q1.xlsx",
        tags: ["precos", "confidencial", "vendas"],
        restricao: "confidencial",
        metricas: {
          acessos: 234,
          downloads: 67,
          visualizacoes: 234,
          compartilhamentos: 0,
          conversoes: 0,
          taxaConversao: 0
        },
        recomendadoPara: ["preparacao_proposta"],
        momentoIdeal: "negociacao_preco",
        alertaVencimento: "2024-03-31"
      }
    ]
  }
];

export const mockRecommendations: LibraryRecommendation[] = [
  {
    contexto: "Cliente mencionou 'automação industrial' e 'sensores'",
    clienteId: 1,
    clienteNome: "João Silva",
    momentoConversa: "descoberta_necessidade",
    materiaisRecomendados: [
      {
        materialId: 101,
        nome: "Apresentação Automação Industrial 2024",
        motivo: "Match perfeito com interesse do cliente",
        probabilidadeConversao: 89,
        prioridade: "alta"
      },
      {
        materialId: 201,
        nome: "Demo Sensor Inteligente IoT",
        motivo: "Cliente interessado em sensores",
        probabilidadeConversao: 76,
        prioridade: "media"
      }
    ],
    sugestaoMensagem: "João, baseado no seu interesse em automação industrial, preparei alguns materiais que podem ser úteis. Vou te enviar nossa apresentação sobre soluções para indústria via WhatsApp.",
    observacao: "LEMBRETE: Vendedor deve baixar os materiais e enviar pelo SEU WhatsApp Business. Sistema apenas sugere e monitora."
  }
];
