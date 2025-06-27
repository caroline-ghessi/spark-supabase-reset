
export interface Notification {
  id: number;
  tipo: string;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  titulo: string;
  mensagem: string;
  timestamp: string;
  lida: boolean;
  fixada: boolean;
  destinatario: string;
  acao?: {
    tipo: string;
    clienteId?: number;
    conversaId?: number;
    materialId?: number;
    vendedorId?: number;
  };
  icone: string;
  cor: string;
  som?: string;
  canais: string[];
  contexto: any;
}

export interface NotificationConfig {
  inApp: {
    sons: boolean;
    toast: boolean;
    badges: boolean;
    modal: boolean;
  };
  whatsapp: {
    ativo: boolean;
    tipos: string[];
    horario: string;
    dias?: string[];
  };
  email: {
    ativo: boolean;
    tipos?: string[];
    frequencia?: string;
  };
}

export interface EscalationRule {
  id: number;
  nome: string;
  condicao: any;
  acoes: Array<{
    tipo: string;
    destinatario: string | string[];
    template: string;
    prioridade?: string;
  }>;
}

export const mockNotifications: Notification[] = [
  {
    id: 1001,
    tipo: "cliente_aguardando",
    prioridade: "critica",
    titulo: "Cliente Quente Aguardando",
    mensagem: "João Silva aguarda resposta há 15 minutos",
    timestamp: "2024-01-15 14:30:00",
    lida: false,
    fixada: true,
    destinatario: "carol",
    acao: {
      tipo: "abrir_chat",
      clienteId: 1,
      conversaId: 1001
    },
    icone: "clock",
    cor: "red",
    som: "urgente.mp3",
    canais: ["inApp", "whatsapp"],
    contexto: {
      cliente: "João Silva",
      telefone: "51 99999-1234",
      classificacao: "quente",
      valorPotencial: 85000
    }
  },
  {
    id: 1002,
    tipo: "nova_mensagem",
    prioridade: "alta",
    titulo: "Nova Mensagem Recebida",
    mensagem: "Maria Santos enviou uma mensagem",
    timestamp: "2024-01-15 14:25:00",
    lida: false,
    fixada: false,
    destinatario: "carol",
    acao: {
      tipo: "abrir_chat",
      clienteId: 2,
      conversaId: 1002
    },
    icone: "message-circle",
    cor: "blue",
    canais: ["inApp", "push"],
    contexto: {
      cliente: "Maria Santos",
      ultimaMensagem: "Gostaria de agendar uma visita",
      classificacao: "morno"
    }
  },
  {
    id: 1003,
    tipo: "vendedor_inativo",
    prioridade: "alta",
    titulo: "Vendedor Sem Resposta",
    mensagem: "Roberto Santos não responde cliente há 30 minutos",
    timestamp: "2024-01-15 14:20:00",
    lida: true,
    fixada: true,
    destinatario: "carol",
    acao: {
      tipo: "escalar_vendedor",
      vendedorId: 3,
      clienteId: 3
    },
    icone: "user-x",
    cor: "orange",
    canais: ["inApp", "whatsapp"],
    contexto: {
      vendedor: "Roberto Santos",
      cliente: "Pedro Costa",
      tempoSemResposta: "30 minutos",
      valorVenda: 45000
    }
  },
  {
    id: 1004,
    tipo: "recomendacao_ia",
    prioridade: "media",
    titulo: "Recomendação da IA",
    mensagem: "Envie demo do sensor para João Silva",
    timestamp: "2024-01-15 14:00:00",
    lida: false,
    fixada: false,
    destinatario: "antonio_silva",
    acao: {
      tipo: "abrir_biblioteca",
      materialId: 201,
      clienteId: 1
    },
    icone: "lightbulb",
    cor: "purple",
    canais: ["inApp", "whatsapp"],
    contexto: {
      cliente: "João Silva",
      material: "Demo Sensor Inteligente IoT",
      motivo: "Cliente mencionou interesse em sensores",
      probabilidadeConversao: 89
    }
  },
  {
    id: 1005,
    tipo: "meta_atingida",
    prioridade: "baixa",
    titulo: "Meta Atingida! 🎉",
    mensagem: "Você atingiu 150% da meta diária",
    timestamp: "2024-01-15 13:45:00",
    lida: true,
    fixada: false,
    destinatario: "carla_mendes",
    acao: {
      tipo: "abrir_metricas",
    },
    icone: "trophy",
    cor: "green",
    canais: ["inApp", "push"],
    contexto: {
      metaOriginal: 5,
      vendaRealizadas: 7,
      valorTotal: 196000
    }
  },
  {
    id: 1006,
    tipo: "novo_cliente",
    prioridade: "alta",
    titulo: "Novo Cliente Atribuído",
    mensagem: "Pedro Costa foi atribuído para você",
    timestamp: "2024-01-15 13:30:00",
    lida: false,
    fixada: false,
    destinatario: "antonio_silva",
    acao: {
      tipo: "abrir_chat",
      clienteId: 4,
      conversaId: 1004
    },
    icone: "user-plus",
    cor: "blue",
    canais: ["inApp", "whatsapp"],
    contexto: {
      cliente: "Pedro Costa",
      telefone: "51 99999-5678",
      classificacao: "quente",
      valorPotencial: 120000,
      observacao: "Cliente interessado em automação industrial"
    }
  }
];

export const mockNotificationConfigs: Record<string, NotificationConfig> = {
  carol: {
    inApp: {
      sons: true,
      toast: true,
      badges: true,
      modal: true
    },
    whatsapp: {
      ativo: true,
      tipos: ["urgente", "escalacao", "sistema"],
      horario: "24h"
    },
    email: {
      ativo: true,
      tipos: ["relatorio_diario", "backup", "escalacao"],
      frequencia: "diario"
    }
  },
  antonio_silva: {
    inApp: {
      sons: true,
      toast: true,
      badges: false,
      modal: false
    },
    whatsapp: {
      ativo: true,
      tipos: ["novo_cliente", "recomendacao", "alerta_tempo"],
      horario: "08:00-18:00",
      dias: ["seg", "ter", "qua", "qui", "sex"]
    },
    email: {
      ativo: false
    }
  },
  carla_mendes: {
    inApp: {
      sons: true,
      toast: true,
      badges: true,
      modal: false
    },
    whatsapp: {
      ativo: true,
      tipos: ["novo_cliente", "meta_atingida", "recomendacao"],
      horario: "09:00-17:00",
      dias: ["seg", "ter", "qua", "qui", "sex"]
    },
    email: {
      ativo: false
    }
  }
};

export const mockEscalationRules: EscalationRule[] = [
  {
    id: 1,
    nome: "Cliente Quente Sem Resposta",
    condicao: {
      cliente_tipo: "quente",
      tempo_sem_resposta: "> 15min",
      valor_potencial: "> 50000"
    },
    acoes: [
      {
        tipo: "notificar_whatsapp",
        destinatario: "gerencia",
        template: "escalacao_critica"
      },
      {
        tipo: "notificar_inapp",
        destinatario: "carol",
        prioridade: "critica"
      }
    ]
  },
  {
    id: 2,
    nome: "Vendedor Múltiplas Falhas",
    condicao: {
      vendedor_score: "< 6.0",
      recomendacoes_ignoradas: "> 3",
      periodo: "hoje"
    },
    acoes: [
      {
        tipo: "notificar_whatsapp",
        destinatario: ["rodrigo", "fabio"],
        template: "vendedor_problematico"
      }
    ]
  }
];

export const whatsappTemplates = {
  novo_cliente: "🎯 *Novo Cliente Atribuído*\n\n📋 Cliente: {{cliente_nome}}\n📱 Telefone: {{cliente_telefone}}\n🔥 Classificação: {{classificacao}}\n💰 Valor Potencial: {{valor_estimado}}\n\n📄 Resumo:\n{{resumo_conversa}}\n\n💡 Recomendação: {{recomendacao_ia}}",
  recomendacao_ia: "💡 *Recomendação IA*\n\n👤 Cliente: {{cliente_nome}}\n📞 {{cliente_telefone}}\n\n🎯 Sugestão: {{recomendacao}}\n\n📊 Probabilidade de Conversão: {{probabilidade}}%\n\n⏰ Melhor momento: {{momento_ideal}}",
  alerta_tempo: "⏰ *Alerta de Tempo*\n\n👤 {{cliente_nome}} ({{cliente_telefone}}) aguarda resposta há {{tempo_aguardando}}.\n\n🔥 Cliente {{classificacao}} - Valor: {{valor_potencial}}\n\n⚡ Ação necessária: Responder urgentemente!",
  escalacao_critica: "🚨 *ESCALAÇÃO URGENTE*\n\n👨‍💼 Vendedor: {{vendedor_nome}}\n👤 Cliente: {{cliente_nome}} ({{cliente_telefone}})\n⚠️ Problema: {{problema_descricao}}\n💰 Valor em Risco: {{valor_venda}}\n\n🎯 Ação Necessária: {{acao_recomendada}}\n\n📊 Contexto:\n{{contexto_completo}}"
};

export const notificationMetrics = {
  periodo: "últimos 30 dias",
  envios: {
    total: 2847,
    inApp: 1923,
    whatsapp: 678,
    email: 246
  },
  engagement: {
    taxa_abertura: 89.4,
    tempo_medio_resposta: "3.2 minutos",
    acoes_tomadas: 2134,
    taxa_acao: 75.0
  },
  eficacia_por_tipo: [
    {
      tipo: "cliente_aguardando",
      enviadas: 234,
      respondidas: 218,
      taxa_resposta: 93.2,
      tempo_medio_resposta: "2.1 minutos"
    },
    {
      tipo: "recomendacao_ia",
      enviadas: 567,
      implementadas: 423,
      taxa_implementacao: 74.6,
      conversoes_resultantes: 89
    }
  ]
};
