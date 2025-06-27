
import type { Database } from '@/integrations/supabase/types';

export interface RealSeller {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  position: string;
  specialties: string[];
  performance_score: number;
  status: string;
  metadata: {
    description: string;
    performance_level: string;
    spin_trained: boolean;
    spin_expertise: string;
    categoria: string;
    tendency?: string;
    specialty_focus?: string;
    role?: string;
    whapi_integrated?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// Type alias for the database seller type
export type DatabaseSeller = Database['public']['Tables']['sellers']['Row'];

// Helper function to convert database seller to RealSeller
export const convertDatabaseSellerToRealSeller = (dbSeller: DatabaseSeller): RealSeller => {
  return {
    id: dbSeller.id,
    name: dbSeller.name,
    email: dbSeller.email,
    phone: dbSeller.phone,
    whatsapp_number: dbSeller.whatsapp_number,
    position: dbSeller.position || '',
    specialties: dbSeller.specialties || [],
    performance_score: dbSeller.performance_score || 0,
    status: dbSeller.status || 'active',
    metadata: (dbSeller.metadata as any) || {
      description: '',
      performance_level: 'average',
      spin_trained: false,
      spin_expertise: '',
      categoria: ''
    },
    created_at: dbSeller.created_at || undefined,
    updated_at: dbSeller.updated_at || undefined
  };
};

export const spinTrainingByCategory = {
  ferramentas: {
    situacao: [
      "Que tipo de trabalhos vocês realizam?",
      "Quantos profissionais usam ferramentas na empresa?",
      "Com que frequência precisam de ferramentas novas?"
    ],
    problema: [
      "As ferramentas atuais atendem todas as necessidades?",
      "Já tiveram problemas com quebra ou mau funcionamento?",
      "A produtividade está onde vocês gostariam?"
    ],
    implicacao: [
      "Quanto tempo perdem quando uma ferramenta quebra?",
      "Isso afeta os prazos de entrega dos trabalhos?",
      "Qual o custo de ter profissionais parados?"
    ],
    necessidade: [
      "Como seria ter ferramentas mais confiáveis?",
      "Quanto vale aumentar a produtividade da equipe?",
      "Que impacto teria ferramentas profissionais no seu negócio?"
    ]
  },
  energia: {
    situacao: [
      "Qual seu consumo médio de energia?",
      "Já analisou sua conta de luz recentemente?",
      "Tem espaço disponível para instalação?"
    ],
    problema: [
      "Como tem sido o aumento nas contas de energia?",
      "Já teve problemas com falta de energia?",
      "A bandeira vermelha tem impactado seu orçamento?"
    ],
    implicacao: [
      "Quanto representa a energia no custo total?",
      "Esses aumentos afetam a competitividade?",
      "Já calculou quanto pagará em 5 anos mantendo assim?"
    ],
    necessidade: [
      "Como seria ter previsibilidade no custo de energia?",
      "Qual valor de ser independente energeticamente?",
      "O que significaria economizar 90% na conta de luz?"
    ]
  },
  construcao: {
    situacao: [
      "Que tipo de obra está realizando?",
      "Qual o cronograma do projeto?",
      "Quantos m² aproximadamente?"
    ],
    problema: [
      "Está conseguindo manter o cronograma?",
      "Os materiais atuais atendem a qualidade esperada?",
      "Já teve retrabalho por problema em materiais?"
    ],
    implicacao: [
      "Atrasos geram multa contratual?",
      "Como o cliente reage a atrasos?",
      "Qual custo de refazer um trabalho?"
    ],
    necessidade: [
      "Como seria entregar sempre no prazo?",
      "Que valor tem a garantia de qualidade?",
      "O que significa ter um fornecedor confiável?"
    ]
  }
};
