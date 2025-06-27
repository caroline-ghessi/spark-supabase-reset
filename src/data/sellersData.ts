
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

export const mockSellers: Seller[] = [
  {
    id: 1,
    nome: "Antonio Silva",
    especialidade: "Automação Industrial",
    clientesAtuais: 3,
    maxClientes: 8,
    performance: 4.8,
    disponivel: true
  },
  {
    id: 2,
    nome: "Carla Mendes",
    especialidade: "Projetos Residenciais",
    clientesAtuais: 5,
    maxClientes: 6,
    performance: 4.9,
    disponivel: true
  },
  {
    id: 3,
    nome: "Roberto Santos",
    especialidade: "Prospecção",
    clientesAtuais: 8,
    maxClientes: 10,
    performance: 4.2,
    disponivel: false
  }
];
