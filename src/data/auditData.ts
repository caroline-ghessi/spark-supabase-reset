
export interface AuditLog {
  id: number;
  timestamp: string;
  usuario: string;
  nivel: 'admin' | 'supervisor' | 'vendedor';
  acao: string;
  recurso: string;
  detalhes: Record<string, any>;
  ip: string;
  userAgent?: string;
}

export interface BackupConfig {
  frequencia: string;
  horario: string;
  retencao: string;
  locais: string[];
  itens: string[];
  ultimoBackup: string;
  status: 'sucesso' | 'erro' | 'em_andamento';
  tamanho: string;
}

export const mockAuditLogs: AuditLog[] = [
  {
    id: 1001,
    timestamp: "2024-01-15 14:30:25",
    usuario: "Carol",
    nivel: "admin",
    acao: "upload_material",
    recurso: "biblioteca",
    detalhes: {
      arquivo: "Apresentação Automação Industrial 2024.pptx",
      categoria: "apresentacoes",
      tamanho: "2.3MB"
    },
    ip: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0"
  },
  {
    id: 1002,
    timestamp: "2024-01-15 15:45:12",
    usuario: "Antonio Silva",
    nivel: "vendedor",
    acao: "download_material",
    recurso: "biblioteca",
    detalhes: {
      arquivo: "Tabela Preços Q1 2024.xlsx",
      cliente: "João Silva",
      motivo: "preparacao_proposta"
    },
    ip: "192.168.1.105"
  },
  {
    id: 1003,
    timestamp: "2024-01-15 16:20:08",
    usuario: "Carla Mendes",
    nivel: "vendedor",
    acao: "envio_material",
    recurso: "chat",
    detalhes: {
      arquivo: "Pitch Deck Soluções Residenciais.pptx",
      cliente: "Maria Santos",
      canal: "whatsapp"
    },
    ip: "192.168.1.107"
  },
  {
    id: 1004,
    timestamp: "2024-01-15 10:15:30",
    usuario: "Carol",
    nivel: "admin",
    acao: "criar_usuario",
    recurso: "usuarios",
    detalhes: {
      usuario_criado: "Roberto Santos",
      nivel: "vendedor",
      email: "roberto@empresa.com"
    },
    ip: "192.168.1.100"
  },
  {
    id: 1005,
    timestamp: "2024-01-15 09:30:45",
    usuario: "Antonio Silva",
    nivel: "vendedor",
    acao: "acesso_cliente",
    recurso: "conversas",
    detalhes: {
      cliente: "João Silva",
      duracao_sessao: "45 minutos"
    },
    ip: "192.168.1.105"
  }
];

export const mockBackupConfig: BackupConfig = {
  frequencia: "diario",
  horario: "02:00",
  retencao: "90 dias",
  locais: ["servidor_local", "cloud_storage"],
  itens: [
    "conversas",
    "biblioteca_materiais",
    "configuracoes_usuarios",
    "logs_auditoria",
    "metricas_performance"
  ],
  ultimoBackup: "2024-01-15 02:00:00",
  status: "sucesso",
  tamanho: "245MB"
};
