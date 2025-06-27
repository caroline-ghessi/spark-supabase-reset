
import { Conversation } from '../types/conversation';
import { Message } from '../types/message';

export const mockConversations: Conversation[] = [
  {
    id: 1,
    clientName: "João Silva",
    clientPhone: "51 99999-1234",
    status: "bot",
    leadType: "hot",
    lastMessage: "Preciso de orçamento urgente para projeto",
    lastMessageTime: "2 min atrás",
    unreadCount: 3,
    assignedSeller: null
  },
  {
    id: 2,
    clientName: "Maria Santos",
    clientPhone: "51 99999-5678",
    status: "manual",
    leadType: "warm",
    lastMessage: "Gostaria de mais informações sobre o serviço",
    lastMessageTime: "15 min atrás",
    unreadCount: 1,
    assignedSeller: null
  },
  {
    id: 3,
    clientName: "Pedro Costa",
    clientPhone: "51 99999-9012",
    status: "seller",
    leadType: "cold",
    lastMessage: "Só estou pesquisando por enquanto",
    lastMessageTime: "1h atrás",
    unreadCount: 0,
    assignedSeller: "Antonio"
  },
  {
    id: 4,
    clientName: "Ana Oliveira",
    clientPhone: "51 99999-3456",
    status: "waiting",
    leadType: "hot",
    lastMessage: "Quando vocês podem fazer a instalação?",
    lastMessageTime: "30 min atrás",
    unreadCount: 2,
    assignedSeller: null
  },
  {
    id: 5,
    clientName: "Carlos Ferreira",
    clientPhone: "51 99999-7890",
    status: "bot",
    leadType: "warm",
    lastMessage: "Qual o prazo de entrega?",
    lastMessageTime: "45 min atrás",
    unreadCount: 0,
    assignedSeller: null
  },
  {
    id: 6,
    clientName: "Luciana Reis",
    clientPhone: "51 99999-1111",
    status: "seller",
    leadType: "hot",
    lastMessage: "Vou fechar o pedido hoje mesmo!",
    lastMessageTime: "10 min atrás",
    unreadCount: 1,
    assignedSeller: "Carla"
  },
  {
    id: 7,
    clientName: "Roberto Gomes",
    clientPhone: "51 99999-2222",
    status: "manual",
    leadType: "cold",
    lastMessage: "Ainda estou analisando as opções",
    lastMessageTime: "2h atrás",
    unreadCount: 0,
    assignedSeller: null
  }
];

export const mockMessages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      sender: "client",
      senderName: "João Silva",
      content: "Olá, preciso de um orçamento urgente para meu projeto",
      timestamp: "14:30",
      type: "text"
    },
    {
      id: 2,
      sender: "bot",
      senderName: "Bot",
      content: "Olá João! Posso te ajudar com o orçamento. Qual tipo de projeto você precisa?",
      timestamp: "14:31",
      type: "text"
    },
    {
      id: 3,
      sender: "client",
      senderName: "João Silva",
      content: "É um projeto de automação industrial, preciso para esta semana",
      timestamp: "14:32",
      type: "text"
    },
    {
      id: 4,
      sender: "bot",
      senderName: "Bot",
      content: "Entendi! Projeto de automação industrial é nossa especialidade. Vou conectar você com um especialista para um atendimento personalizado.",
      timestamp: "14:33",
      type: "text"
    }
  ],
  2: [
    {
      id: 4,
      sender: "client",
      senderName: "Maria Santos",
      content: "Gostaria de mais informações sobre seus serviços",
      timestamp: "13:45",
      type: "text"
    },
    {
      id: 5,
      sender: "operator",
      senderName: "Operador",
      content: "Olá Maria! Claro, posso te ajudar. Que tipo de serviço você está procurando?",
      timestamp: "13:46",
      type: "text"
    },
    {
      id: 6,
      sender: "client",
      senderName: "Maria Santos",
      content: "Estou interessada em automação residencial, principalmente para segurança",
      timestamp: "13:47",
      type: "text"
    }
  ],
  3: [
    {
      id: 6,
      sender: "client",
      senderName: "Pedro Costa",
      content: "Só estou pesquisando preços por enquanto",
      timestamp: "12:30",
      type: "text"
    },
    {
      id: 7,
      sender: "seller",
      senderName: "Antonio",
      content: "Sem problemas Pedro! Quando você estiver pronto para decidir, estarei aqui para te ajudar.",
      timestamp: "12:35",
      type: "text"
    },
    {
      id: 8,
      sender: "seller",
      senderName: "Antonio",
      content: "Posso te enviar alguns cases de projetos similares que fizemos? Isso pode te ajudar na pesquisa.",
      timestamp: "12:36",
      type: "text"
    }
  ],
  4: [
    {
      id: 9,
      sender: "client",
      senderName: "Ana Oliveira",
      content: "Quando vocês podem fazer a instalação?",
      timestamp: "14:00",
      type: "text"
    },
    {
      id: 10,
      sender: "client",
      senderName: "Ana Oliveira",
      content: "Preciso muito que seja ainda esta semana",
      timestamp: "14:15",
      type: "text"
    }
  ],
  6: [
    {
      id: 11,
      sender: "client",
      senderName: "Luciana Reis",
      content: "Vou fechar o pedido hoje mesmo!",
      timestamp: "14:50",
      type: "text"
    },
    {
      id: 12,
      sender: "seller",
      senderName: "Carla",
      content: "Que ótima notícia, Luciana! Vou preparar o contrato agora mesmo. Em quanto tempo você precisa da instalação?",
      timestamp: "14:51",
      type: "text"
    }
  ]
};
