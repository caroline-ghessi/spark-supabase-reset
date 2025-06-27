
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
    }
  ]
};
