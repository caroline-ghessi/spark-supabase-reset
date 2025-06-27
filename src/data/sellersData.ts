
// Manter para compatibilidade mas marcado como deprecated
// Os dados reais agora vêm do banco de dados

export interface Seller {
  id: number;
  nome: string;
  especialidade: string;
  clientesAtuais: number;
  maxClientes: number;
  performance: number;
  disponivel: boolean;
  avatar?: string;
}

// DEPRECATED: Use RealSellersPanel em vez deste mock
export const mockSellers: Seller[] = [
  {
    id: 999,
    nome: "⚠️ DADOS MOCKADOS - USE VENDEDORES REAIS",
    especialidade: "Dados atualizados no banco",
    clientesAtuais: 0,
    maxClientes: 0,
    performance: 0,
    disponivel: false
  }
];
