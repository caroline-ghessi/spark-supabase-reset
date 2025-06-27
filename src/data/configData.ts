
export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  foto: string;
  cargo: string;
  status: 'ativo' | 'inativo';
  especialidades: string[];
  configuracoes: {
    maxClientesSimultaneos: number;
    horarioTrabalho: {
      inicio: string;
      fim: string;
      diasSemana: string[];
    };
    tiposLeadPreferidos: string[];
    valorMinimoLead: number;
  };
  metricas: {
    taxaConversao: number;
    ticketMedio: number;
    tempoMedioFechamento: string;
    scoreQualidade: number;
    clientesAtivos: number;
    vendasMes: number;
  };
}

export interface AgenteIA {
  id: string;
  nome: string;
  descricao: string;
  status: 'ativo' | 'inativo';
  promptAtual: string;
  versao: string;
  ultimaAtualizacao: string;
  testesRealizados: number;
  taxaAcerto: string;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  empresa: string;
  cargo: string;
  classificacao: 'quente' | 'morno' | 'frio';
  valorPotencial: number;
  fonte: string;
  tags: string[];
  segmento: string;
  localizacao: {
    cidade: string;
    estado: string;
    regiao: string;
  };
  historico: {
    primeiroContato: string;
    ultimaInteracao: string;
    totalInteracoes: number;
    canalPreferido: string;
  };
  vendedorAtribuido: string;
  statusNegociacao: string;
  observacoes: string;
}

export interface TipoAlerta {
  nome: string;
  condicao: string;
  destinatario: string;
  canal: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  ativo: boolean;
}

export interface ContatoEscalacao {
  nome: string;
  cargo: string;
  whatsapp: string;
  email: string;
  nivelEscalacao: number;
  horarioAtendimento: string;
}

export const mockVendedores: Vendedor[] = [
  {
    id: 1,
    nome: "Antonio Silva",
    email: "antonio@empresa.com",
    telefone: "51 99999-0001",
    whatsapp: "51 99999-0001",
    foto: "https://avatar.iran.liara.run/public/1",
    cargo: "Vendedor Senior",
    status: "ativo",
    especialidades: [
      "Automação Industrial",
      "Projetos Grandes",
      "Clientes Corporativos"
    ],
    configuracoes: {
      maxClientesSimultaneos: 8,
      horarioTrabalho: {
        inicio: "08:00",
        fim: "18:00",
        diasSemana: ["seg", "ter", "qua", "qui", "sex"]
      },
      tiposLeadPreferidos: ["quente", "morno"],
      valorMinimoLead: 10000
    },
    metricas: {
      taxaConversao: 75,
      ticketMedio: 45000,
      tempoMedioFechamento: "7 dias",
      scoreQualidade: 8.9,
      clientesAtivos: 3,
      vendasMes: 180000
    }
  },
  {
    id: 2,
    nome: "Carla Mendes",
    email: "carla@empresa.com",
    telefone: "51 99999-0002",
    whatsapp: "51 99999-0002",
    foto: "https://avatar.iran.liara.run/public/2",
    cargo: "Especialista em Residencial",
    status: "ativo",
    especialidades: [
      "Projetos Residenciais",
      "Automação Residencial",
      "Clientes Pessoa Física"
    ],
    configuracoes: {
      maxClientesSimultaneos: 6,
      horarioTrabalho: {
        inicio: "09:00",
        fim: "17:00",
        diasSemana: ["seg", "ter", "qua", "qui", "sex", "sab"]
      },
      tiposLeadPreferidos: ["morno", "frio"],
      valorMinimoLead: 5000
    },
    metricas: {
      taxaConversao: 82,
      ticketMedio: 18000,
      tempoMedioFechamento: "5 dias",
      scoreQualidade: 9.1,
      clientesAtivos: 5,
      vendasMes: 95000
    }
  },
  {
    id: 3,
    nome: "Roberto Santos",
    email: "roberto@empresa.com",
    telefone: "51 99999-0003",
    whatsapp: "51 99999-0003",
    foto: "https://avatar.iran.liara.run/public/3",
    cargo: "Especialista em Prospecção",
    status: "ativo",
    especialidades: [
      "Prospecção",
      "Leads Frios",
      "Qualificação Inicial"
    ],
    configuracoes: {
      maxClientesSimultaneos: 10,
      horarioTrabalho: {
        inicio: "07:00",
        fim: "19:00",
        diasSemana: ["seg", "ter", "qua", "qui", "sex"]
      },
      tiposLeadPreferidos: ["frio", "morno"],
      valorMinimoLead: 2000
    },
    metricas: {
      taxaConversao: 42,
      ticketMedio: 12000,
      tempoMedioFechamento: "12 dias",
      scoreQualidade: 7.2,
      clientesAtivos: 8,
      vendasMes: 48000
    }
  }
];

export const mockAgentesIA: AgenteIA[] = [
  {
    id: "classificador_cliente",
    nome: "Classificador de Clientes",
    descricao: "Analisa mensagens e classifica leads como Quente/Morno/Frio",
    status: "ativo",
    promptAtual: `Você é um especialista em qualificação de leads de vendas.

Analise a conversa do cliente e classifique como:

🔥 QUENTE (pronto para comprar):
- Demonstra urgência ("preciso urgente", "para esta semana")
- Pergunta sobre preços, prazos, condições
- Menciona orçamento aprovado
- Tem deadline específico

🟡 MORNO (interesse demonstrado):
- Faz perguntas técnicas específicas
- Solicita informações detalhadas
- Demonstra conhecimento do produto
- Está comparando opções

🔵 FRIO (apenas pesquisando):
- Perguntas muito gerais
- "Só estou vendo preços"
- Sem urgência demonstrada
- Primeiro contato exploratório

DADOS DO CLIENTE:
Nome: {{cliente_nome}}
Telefone: {{cliente_telefone}}
Conversa: {{historico_mensagens}}

RESPONDA APENAS: QUENTE, MORNO ou FRIO
Justificativa em 1 linha.`,
    versao: "2.1",
    ultimaAtualizacao: "2024-01-15",
    testesRealizados: 147,
    taxaAcerto: "89%"
  },
  {
    id: "matcher_vendedor",
    nome: "Matcher Vendedor-Cliente",
    descricao: "Recomenda o melhor vendedor para cada cliente",
    status: "ativo",
    promptAtual: `Analise o perfil do cliente e as especialidades dos vendedores disponíveis para fazer o melhor matching.

CRITÉRIOS DE MATCHING:
1. Especialidade técnica do vendedor vs necessidade do cliente
2. Disponibilidade atual (capacidade vs clientes atuais)
3. Performance histórica com perfil similar
4. Valor do lead vs experiência do vendedor

DADOS DO CLIENTE:
{{dados_cliente}}

VENDEDORES DISPONÍVEIS:
{{lista_vendedores}}

RESPONDA com o nome do vendedor recomendado e justificativa em 2 linhas.`,
    versao: "1.8",
    ultimaAtualizacao: "2024-01-10",
    testesRealizados: 89,
    taxaAcerto: "94%"
  },
  {
    id: "monitor_qualidade",
    nome: "Monitor de Qualidade",
    descricao: "Avalia qualidade do atendimento em tempo real",
    status: "ativo",
    promptAtual: `Monitore a conversa entre vendedor e cliente e avalie a qualidade do atendimento.

CRITÉRIOS DE AVALIAÇÃO:
- Tempo de resposta (< 5min = ótimo, 5-15min = bom, >30min = ruim)
- Personalização (uso do nome, empresa, contexto)
- Técnicas de venda aplicadas
- Profissionalismo e cortesia
- Resolução de objeções

CONVERSA ATUAL:
{{conversa_completa}}

VENDEDOR: {{nome_vendedor}}
CLIENTE: {{nome_cliente}}

Avalie de 0 a 10 e forneça recomendações específicas se score < 7.`,
    versao: "3.0",
    ultimaAtualizacao: "2024-01-12",
    testesRealizados: 234,
    taxaAcerto: "91%"
  },
  {
    id: "gerador_resumo",
    nome: "Gerador de Resumos",
    descricao: "Cria resumos para transferência de clientes",
    status: "ativo",
    promptAtual: `Analise toda a conversa e crie um resumo estruturado para transferência do cliente.

ESTRUTURA DO RESUMO:
📋 **DADOS DO CLIENTE:**
- Nome, empresa, cargo
- Classificação (Quente/Morno/Frio)
- Valor potencial estimado

🎯 **NECESSIDADE IDENTIFICADA:**
- Problema/dor principal
- Solução desejada
- Urgência e timeline

💰 **SITUAÇÃO COMERCIAL:**
- Orçamento mencionado
- Autoridade de decisão
- Concorrentes citados

📞 **PRÓXIMOS PASSOS:**
- Ações recomendadas
- Informações pendentes
- Estratégia sugerida

CONVERSA COMPLETA:
{{historico_completo}}`,
    versao: "1.5",
    ultimaAtualizacao: "2024-01-08",
    testesRealizados: 67,
    taxaAcerto: "96%"
  }
];

export const mockClientes: Cliente[] = [
  {
    id: 1,
    nome: "João Silva",
    telefone: "51 99999-1234",
    email: "joao@silvaassociados.com",
    empresa: "Silva & Associados Ltda",
    cargo: "Diretor Técnico",
    classificacao: "quente",
    valorPotencial: 85000,
    fonte: "site",
    tags: ["urgente", "decisor", "orcamento_aprovado"],
    segmento: "industrial",
    localizacao: {
      cidade: "Porto Alegre",
      estado: "RS",
      regiao: "Sul"
    },
    historico: {
      primeiroContato: "2024-01-15",
      ultimaInteracao: "2024-01-15",
      totalInteracoes: 8,
      canalPreferido: "whatsapp"
    },
    vendedorAtribuido: "Antonio Silva",
    statusNegociacao: "proposta_enviada",
    observacoes: "Cliente tem projeto urgente, orçamento pré-aprovado de R$ 100k"
  },
  {
    id: 2,
    nome: "Maria Santos",
    telefone: "51 99999-5678",
    email: "maria@techcorp.com",
    empresa: "TechCorp Solutions",
    cargo: "Gerente de TI",
    classificacao: "morno",
    valorPotencial: 45000,
    fonte: "indicacao",
    tags: ["comparando_opcoes", "tecnico", "prazo_flexivel"],
    segmento: "tecnologia",
    localizacao: {
      cidade: "Caxias do Sul",
      estado: "RS",
      regiao: "Sul"
    },
    historico: {
      primeiroContato: "2024-01-12",
      ultimaInteracao: "2024-01-14",
      totalInteracoes: 5,
      canalPreferido: "email"
    },
    vendedorAtribuido: "Carla Mendes",
    statusNegociacao: "qualificacao",
    observacoes: "Precisa de aprovação da diretoria, processo mais longo"
  }
];

export const mockTiposAlerta: TipoAlerta[] = [
  {
    nome: "Tempo Resposta Alto",
    condicao: "vendedor_nao_responde > 30min",
    destinatario: "supervisor",
    canal: "dashboard + whatsapp",
    prioridade: "media",
    ativo: true
  },
  {
    nome: "Lead Quente Abandonado",
    condicao: "cliente_quente + sem_resposta > 15min",
    destinatario: "gerencia",
    canal: "whatsapp",
    prioridade: "critica",
    ativo: true
  },
  {
    nome: "Score Qualidade Baixo",
    condicao: "score_qualidade < 5.0",
    destinatario: "supervisor + vendedor",
    canal: "dashboard",
    prioridade: "alta",
    ativo: true
  },
  {
    nome: "Cliente Insatisfeito",
    condicao: "sentimento_negativo detectado",
    destinatario: "gerencia",
    canal: "dashboard + whatsapp",
    prioridade: "alta",
    ativo: false
  }
];

export const mockContatosEscalacao: ContatoEscalacao[] = [
  {
    nome: "Rodrigo Santos",
    cargo: "Gerente de Vendas",
    whatsapp: "51 99999-8888",
    email: "rodrigo@empresa.com",
    nivelEscalacao: 2,
    horarioAtendimento: "08:00-20:00"
  },
  {
    nome: "Fabio Costa",
    cargo: "Diretor",
    whatsapp: "51 99999-9999",
    email: "fabio@empresa.com",
    nivelEscalacao: 3,
    horarioAtendimento: "24h"
  }
];
