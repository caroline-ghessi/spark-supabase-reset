
export interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  foto: string;
  nivel: 'admin' | 'supervisor' | 'vendedor';
  status: 'ativo' | 'inativo';
  ultimoAcesso: string;
  criadoEm: string;
  especialidades?: string[];
  metricas?: {
    clientesAtivos: number;
    conversaoMes: number;
    ticketMedio: number;
  };
  configuracoes: {
    tema?: string;
    notificacoes?: boolean;
    idioma?: string;
    notificacoesWhatsApp?: boolean;
    horarioTrabalho?: string;
  };
}

export interface Permission {
  id: string;
  nome: string;
  descricao: string;
}

export interface AccessLevel {
  nome: string;
  descricao: string;
  usuarios: string[];
  permissoes: string[];
  cor: string;
}

export const mockUsers: User[] = [
  {
    id: 1,
    nome: "Carol",
    email: "carol@empresa.com",
    telefone: "51 99999-0000",
    foto: "https://avatar.iran.liara.run/public/girl",
    nivel: "admin",
    status: "ativo",
    ultimoAcesso: "2024-01-15 14:30",
    criadoEm: "2024-01-01",
    configuracoes: {
      tema: "claro",
      notificacoes: true,
      idioma: "pt-BR"
    }
  },
  {
    id: 2,
    nome: "Antonio Silva",
    email: "antonio@empresa.com",
    telefone: "51 99999-0001",
    foto: "https://avatar.iran.liara.run/public/1",
    nivel: "vendedor",
    status: "ativo",
    ultimoAcesso: "2024-01-15 15:45",
    criadoEm: "2024-01-05",
    especialidades: ["Automação Industrial", "Projetos Grandes"],
    metricas: {
      clientesAtivos: 8,
      conversaoMes: 28,
      ticketMedio: 67800
    },
    configuracoes: {
      notificacoesWhatsApp: true,
      horarioTrabalho: "08:00-18:00"
    }
  },
  {
    id: 3,
    nome: "Carla Mendes",
    email: "carla@empresa.com",
    telefone: "51 99999-0002",
    foto: "https://avatar.iran.liara.run/public/2",
    nivel: "vendedor",
    status: "ativo",
    ultimoAcesso: "2024-01-15 16:20",
    criadoEm: "2024-01-05",
    especialidades: ["Projetos Residenciais", "Automação Residencial"],
    metricas: {
      clientesAtivos: 6,
      conversaoMes: 34,
      ticketMedio: 28500
    },
    configuracoes: {
      notificacoesWhatsApp: true,
      horarioTrabalho: "09:00-17:00"
    }
  }
];

export const accessLevels: Record<string, AccessLevel> = {
  admin: {
    nome: "Administrador",
    descricao: "Acesso total à plataforma",
    usuarios: ["Carol", "Admin Sistema"],
    permissoes: [
      "gerenciar_usuarios",
      "configurar_ia",
      "acessar_todos_relatorios",
      "modificar_configuracoes",
      "gerenciar_biblioteca",
      "acessar_auditoria",
      "fazer_backup",
      "gerenciar_integracao"
    ],
    cor: "vermelho"
  },
  supervisor: {
    nome: "Supervisor",
    descricao: "Monitoramento e controle operacional",
    usuarios: ["Gerente Operacional"],
    permissoes: [
      "monitorar_conversas",
      "assumir_controle",
      "transferir_clientes",
      "acessar_relatorios_operacionais",
      "gerenciar_vendedores",
      "visualizar_biblioteca"
    ],
    cor: "laranja"
  },
  vendedor: {
    nome: "Vendedor",
    descricao: "Atendimento e acesso a materiais",
    usuarios: ["Antonio Silva", "Carla Mendes", "Roberto Santos"],
    permissoes: [
      "acessar_clientes_atribuidos",
      "visualizar_biblioteca_materiais",
      "baixar_materiais",
      "visualizar_metricas_pessoais",
      "receber_recomendacoes_ia",
      "visualizar_historico_conversas"
    ],
    cor: "verde"
  }
};

export const permissions: Permission[] = [
  { id: "gerenciar_usuarios", nome: "Gerenciar Usuários", descricao: "Criar, editar e excluir usuários" },
  { id: "configurar_ia", nome: "Configurar IA", descricao: "Modificar prompts e configurações da IA" },
  { id: "acessar_todos_relatorios", nome: "Todos os Relatórios", descricao: "Acesso completo a relatórios" },
  { id: "gerenciar_biblioteca", nome: "Gerenciar Biblioteca", descricao: "Upload e gerenciamento de materiais" },
  { id: "monitorar_conversas", nome: "Monitorar Conversas", descricao: "Visualizar todas as conversas" },
  { id: "assumir_controle", nome: "Assumir Controle", descricao: "Assumir controle de conversas" },
  { id: "visualizar_biblioteca_materiais", nome: "Ver Biblioteca", descricao: "Acessar materiais de vendas" }
];
