
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
    sales_type?: string;
    territory?: string;
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
      "Com que frequência precisam de ferramentas novas?",
      "Qual o orçamento mensal destinado para ferramentas?",
      "Que ferramentas vocês mais utilizam no dia a dia?"
    ],
    problema: [
      "As ferramentas atuais atendem todas as necessidades?",
      "Já tiveram problemas com quebra ou mau funcionamento?",
      "A produtividade está onde vocês gostariam?",
      "Têm dificuldade para encontrar peças de reposição?",
      "Os custos de manutenção estão altos?"
    ],
    implicacao: [
      "Quanto tempo perdem quando uma ferramenta quebra?",
      "Isso afeta os prazos de entrega dos trabalhos?",
      "Qual o custo de ter profissionais parados?",
      "Como isso impacta a qualidade do trabalho final?",
      "Vocês perdem clientes por atrasos relacionados a ferramentas?"
    ],
    necessidade: [
      "Como seria ter ferramentas mais confiáveis?",
      "Quanto vale aumentar a produtividade da equipe?",
      "Que impacto teria ferramentas profissionais no seu negócio?",
      "Seria útil ter garantia estendida nas ferramentas?",
      "O que significaria reduzir o tempo de manutenção?"
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
      "Quantos m² aproximadamente?",
      "Quando precisa finalizar a obra?",
      "Quantas pessoas trabalham no projeto?"
    ],
    problema: [
      "Está conseguindo manter o cronograma?",
      "Os materiais atuais atendem a qualidade esperada?",
      "Já teve retrabalho por problema em materiais?",
      "Tem enfrentado atrasos na entrega de materiais?",
      "O prazo está apertado para conclusão?"
    ],
    implicacao: [
      "Atrasos geram multa contratual?",
      "Como o cliente reage a atrasos?",
      "Qual custo de refazer um trabalho?",
      "Isso afeta outros projetos da empresa?",
      "Perder prazo compromete sua reputação no mercado?"
    ],
    necessidade: [
      "Como seria entregar sempre no prazo?",
      "Que valor tem a garantia de qualidade?",
      "O que significa ter um fornecedor confiável?",
      "Seria útil ter entrega garantida em 24h?",
      "Quanto vale ter materiais que não dão retrabalho?",
      "O que significaria nunca mais perder prazo por falta de material?"
    ]
  },
  materiais_construcao: {
    situacao: [
      "Que tipos de materiais vocês mais utilizam?",
      "Qual o volume médio de compras por mês?",
      "Trabalham com quantas obras simultaneamente?"
    ],
    problema: [
      "Já tiveram problemas com qualidade de materiais?",
      "A entrega tem sido dentro do prazo combinado?",
      "Os preços têm afetado a margem dos projetos?"
    ],
    implicacao: [
      "Material com defeito já causou retrabalho?",
      "Atraso na entrega impacta o cronograma da obra?",
      "Como isso afeta a relação com seus clientes?"
    ],
    necessidade: [
      "Seria importante ter garantia total dos materiais?",
      "Que valor tem um fornecedor sempre pontual?",
      "Como seria ter preços competitivos garantidos?"
    ]
  }
};
