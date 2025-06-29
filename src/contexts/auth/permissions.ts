
// Mapeamento de permissões por role
export const ROLE_PERMISSIONS = {
  admin: [
    'gerenciar_usuarios',
    'configurar_ia',
    'acessar_todos_relatorios',
    'modificar_configuracoes',
    'gerenciar_biblioteca',
    'acessar_auditoria',
    'fazer_backup',
    'gerenciar_integracao',
    'monitorar_conversas',
    'assumir_controle',
    'transferir_clientes',
    'visualizar_biblioteca_materiais',
    'acessar_painel_seguranca'
  ],
  supervisor: [
    'monitorar_conversas',
    'assumir_controle',
    'transferir_clientes',
    'acessar_relatorios_operacionais',
    'gerenciar_vendedores',
    'visualizar_biblioteca'
  ],
  seller: [
    'acessar_clientes_atribuidos',
    'visualizar_biblioteca_materiais',
    'baixar_materiais',
    'visualizar_metricas_pessoais',
    'receber_recomendacoes_ia',
    'visualizar_historico_conversas'
  ]
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  return userPermissions.includes(permission);
};
