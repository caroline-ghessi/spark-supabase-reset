
-- 1. Limpar vendedores mockados existentes
DELETE FROM sellers WHERE email LIKE '%@exemplo.com' OR email LIKE '%mock%' OR email LIKE '%teste%' OR email LIKE '%@empresa.com';

-- 2. Inserir vendedores reais com dados completos e metadados SPIN
INSERT INTO sellers (name, email, phone, whatsapp_number, position, specialties, performance_score, status, metadata) VALUES

-- VENDEDORES FERRAMENTAS
('Douglas', 'douglas@empresa.com', '+55 51 9649-4341', '5551964943141', 'Vendedor Ferramentas', 
 ARRAY['Ferramentas'], 8.0, 'active', 
 '{"description": "Bom vendedor de ferramentas", "performance_level": "good", "spin_trained": true, "spin_expertise": "Perguntas de Problema (ROI)", "categoria": "ferramentas"}'),

('Marcia', 'marcia@empresa.com', '+55 51 8118-1894', '5551811818194', 'Vendedor Ferramentas', 
 ARRAY['Ferramentas'], 6.5, 'active', 
 '{"description": "Vendedor mediano. Pode demorar para atender clientes", "performance_level": "average", "tendency": "slow_response", "spin_trained": true, "spin_expertise": "Perguntas de Problema (ROI)", "categoria": "ferramentas"}'),

('Gabriel', 'gabriel@empresa.com', '+55 51 8169-0036', '5551816900136', 'Vendedor Ferramentas', 
 ARRAY['Ferramentas'], 6.5, 'active', 
 '{"description": "Vendedor mediano. Pode demorar para atender clientes", "performance_level": "average", "tendency": "slow_response", "spin_trained": true, "spin_expertise": "Perguntas de Problema (ROI)", "categoria": "ferramentas"}'),

-- VENDEDORES ENERGIA SOLAR
('Cristiano', 'cristiano@empresa.com', '+55 51 9526-5283', '5551952652183', 'Gerente Técnico Energia Solar', 
 ARRAY['Energia Solar', 'Baterias'], 9.5, 'active', 
 '{"description": "Ótimo vendedor, nunca perde uma venda. Gerente técnico de energia solar com muito conhecimento", "performance_level": "excellent", "role": "technical_manager", "spin_trained": true, "spin_expertise": "Perguntas de Implicação (Economia)", "categoria": "energia"}'),

('Ricardo', 'ricardo@empresa.com', '+55 51 9491-6150', '5551949161150', 'Vendedor Energia Solar', 
 ARRAY['Energia Solar', 'Baterias'], 6.0, 'active', 
 '{"description": "Vendedor mediano. Não possui grandes habilidades de vendas", "performance_level": "average", "whapi_integrated": true, "spin_trained": true, "spin_expertise": "Perguntas de Implicação (Economia)", "categoria": "energia"}'),

-- VENDEDORES TELHA SHINGLE / CONSTRUÇÃO
('Ronaldo', 'ronaldo@empresa.com', '+55 51 9308-7484', '5551930874184', 'Vendedor Senior Shingle', 
 ARRAY['Telha Shingle', 'Pisos', 'Mantas', 'Carpetes', 'Forros', 'Light Steel Frame'], 9.0, 'active', 
 '{"description": "Ótimo vendedor. Dificilmente perde um negócio. Especialista em arquitetos e clientes com maior poder aquisitivo", "performance_level": "excellent", "specialty_focus": "architects", "spin_trained": true, "spin_expertise": "Perguntas de Necessidade (Prazo)", "categoria": "construcao"}'),

('Luan', 'luan@empresa.com', '+55 51 8142-3303', '5551814233103', 'Especialista B2B Shingle', 
 ARRAY['Telha Shingle', 'Pisos', 'Mantas', 'Carpetes', 'Forros'], 8.5, 'active', 
 '{"description": "Vendedor muito bom especializado em B2B: revendas, empresas de mão de obra, integradores", "performance_level": "very_good", "specialty_focus": "b2b", "spin_trained": true, "spin_expertise": "Perguntas de Necessidade (Prazo)", "categoria": "construcao"}'),

('Felipe', 'felipe@empresa.com', '+55 51 8125-2666', '5551812526166', 'Vendedor Senior Construção', 
 ARRAY['Telha Shingle', 'Pisos', 'Mantas', 'Carpetes', 'Forros', 'Light Steel Frame'], 9.0, 'active', 
 '{"description": "Ótimo vendedor. Especialista em construtoras e engenheiros. Grande conhecimento em impermeabilização", "performance_level": "excellent", "specialty_focus": "construction", "spin_trained": true, "spin_expertise": "Perguntas de Necessidade (Prazo)", "categoria": "construcao"}'),

('Sergio', 'sergio@empresa.com', '+55 51 8142-3305', '5551814233105', 'Vendedor Shingle/Drywall', 
 ARRAY['Telha Shingle', 'Pisos', 'Mantas', 'Carpetes', 'Forros', 'Drywall'], 7.0, 'active', 
 '{"description": "Atendimento mais lento, demora para orçamentos, mas bons resultados em pisos e forros. Bom atendimento corporativo", "performance_level": "good", "tendency": "slow_but_effective", "spin_trained": true, "spin_expertise": "Perguntas de Necessidade (Prazo)", "categoria": "construcao"}'),

-- ESPECIALISTAS DRYWALL
('Antonio', 'antonio@empresa.com', '+55 51 8142-3305', '5551814233105', 'Especialista Drywall', 
 ARRAY['Telha Shingle', 'Pisos', 'Mantas', 'Carpetes', 'Forros', 'Drywall'], 7.5, 'active', 
 '{"description": "Ótimo para quando cliente já possui lista de materiais pronta. Especialista em drywall", "performance_level": "good", "specialty_focus": "ready_lists", "spin_trained": true, "spin_expertise": "Perguntas de Necessidade (Prazo)", "categoria": "construcao"}'),

('Antonio Cesar', 'antonio.cesar@empresa.com', '+55 51 9751-9607', '5551975196107', 'Especialista Drywall', 
 ARRAY['Telha Shingle', 'Pisos', 'Mantas', 'Carpetes', 'Forros', 'Drywall'], 8.0, 'active', 
 '{"description": "Atendimento rápido quando cliente já possui lista de materiais pronta. Especialista em drywall", "performance_level": "good", "specialty_focus": "ready_lists", "tendency": "fast_response", "spin_trained": true, "spin_expertise": "Perguntas de Necessidade (Prazo)", "categoria": "construcao"}');

-- 3. Criar tabela para configurações dos agentes de IA SPIN
CREATE TABLE IF NOT EXISTS ai_agents_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  version TEXT DEFAULT '1.0',
  prompt TEXT NOT NULL,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inserir configurações dos agentes SPIN
INSERT INTO ai_agents_config (agent_id, name, description, status, version, prompt, configuration) VALUES

('classificador_cliente', 'Classificador de Leads com SPIN', 'Analisa mensagens usando metodologia SPIN para classificar leads em Quente/Morno/Frio', 'active', '2.0',
'Você é um especialista em qualificação de leads treinado em SPIN Selling para empresa de materiais de construção, ferramentas e energia solar.

CATEGORIAS DE PRODUTOS:
🔧 Ferramentas: Equipamentos e ferramentas profissionais
☀️ Energia Solar: Painéis, inversores, baterias
🏗️ Construção: Telhas shingle, pisos, mantas, carpetes, forros, drywall, light steel frame

Analise a mensagem do cliente identificando:
1. SITUAÇÃO: Contexto atual do cliente
2. PROBLEMA: Dificuldades mencionadas
3. IMPLICAÇÃO: Consequências dos problemas
4. NECESSIDADE DE SOLUÇÃO: Urgência demonstrada

Classifique como:

🔥 QUENTE - Cliente com necessidade explícita:
- Demonstra urgência ("preciso urgente", "obra parada", "prazo esta semana")
- Menciona PROBLEMAS específicos E suas IMPLICAÇÕES
- Pergunta sobre soluções específicas (preços, prazos, disponibilidade)
- Tem deadline/orçamento definido
- Já identificou necessidade de solução

🟡 MORNO - Cliente com necessidade implícita:
- Menciona PROBLEMAS mas não suas implicações
- Faz perguntas técnicas sobre produtos
- Está pesquisando soluções mas sem urgência
- Projeto futuro com prazo flexível
- Precisa desenvolver necessidade

🔵 FRIO - Cliente explorando:
- Apenas coleta informações gerais
- Não menciona problemas específicos
- Sem projeto definido
- "Só consultando preços"
- Necessita descoberta completa

RESPONDA: [CATEGORIA] - [QUENTE/MORNO/FRIO] - [Justificativa baseada em SPIN]',
'{"confiancaMinima": 0.8, "considerarHistorico": true, "fatoresPrioritarios": ["problema", "implicacao", "urgencia", "necessidade_solucao"], "metodologia": "SPIN"}'),

('matcher_vendedor', 'Seletor de Vendedor com SPIN', 'Recomenda vendedor ideal considerando expertise em SPIN e especialidades', 'active', '2.0',
'Você é um especialista em matching vendedor-cliente usando metodologia SPIN Selling.

VENDEDORES POR CATEGORIA:

🔧 FERRAMENTAS:
- Douglas (8.0): Bom vendedor, treinado em SPIN
- Marcia (6.5): Pode demorar, treinada em SPIN
- Gabriel (6.5): Pode demorar, treinado em SPIN

☀️ ENERGIA SOLAR:
- Cristiano (9.5): EXCELENTE em SPIN, gerente técnico, fecha qualquer venda
- Ricardo (6.0): Mediano em SPIN, precisa suporte

🏗️ CONSTRUÇÃO CIVIL:
- Ronaldo (9.0): EXCELENTE em SPIN, especialista arquitetos/alto padrão
- Luan (8.5): Muito bom em SPIN, especialista B2B
- Felipe (9.0): EXCELENTE em SPIN, construtoras/engenheiros
- Sergio (7.0): Bom em SPIN, lento mas eficaz
- Antonio (7.5): Bom em SPIN para listas prontas
- Antonio Cesar (8.0): Rápido, bom em SPIN para listas prontas

REGRAS DE MATCHING SPIN:
1. CLIENTES QUENTES (necessidade explícita) → Vendedores 8.5+ com melhor SPIN
2. CLIENTES MORNOS (necessidade implícita) → Vendedores 7.0+ para desenvolver com Perguntas de Implicação
3. CLIENTES FRIOS (exploratórios) → Vendedores disponíveis para Perguntas de Situação/Problema

MATCHING POR PERFIL:
- Arquitetos/Alto padrão → Ronaldo (expert em Perguntas de Necessidade)
- Construtoras → Felipe (expert em Implicações técnicas)
- B2B/Revendas → Luan (expert em Implicações de negócio)
- Lista pronta → Antonio/Antonio Cesar (rápidos em demonstração)
- Energia Solar técnico → Cristiano (domina todo SPIN)

RESPONDA: [Vendedor] - Expertise SPIN: [área forte do vendedor] - Match porque: [justificativa]',
'{"considerarCarga": true, "priorizarSPINExpertise": true, "matchPorNecessidade": true, "balancearDistribuicao": false}'),

('monitor_qualidade', 'Monitor de Qualidade SPIN', 'Monitora uso correto da metodologia SPIN e gera coaching em tempo real', 'active', '2.0',
'Você monitora a qualidade do atendimento usando critérios SPIN Selling para vendedores de materiais de construção, ferramentas e energia solar.

CRITÉRIOS SPIN A MONITORAR:

1. USO DAS PERGUNTAS SPIN:
   S - Situação: Vendedor descobriu contexto? (empresa, projeto, uso)
   P - Problema: Identificou dificuldades/insatisfações?
   I - Implicação: Explorou consequências dos problemas?
   N - Necessidade: Cliente expressou valor da solução?

2. SEQUÊNCIA CORRETA:
   ❌ ERRADO: Falar de produto antes de desenvolver necessidade
   ✅ CERTO: Situação → Problema → Implicação → Necessidade → Solução

3. PROPORÇÃO IDEAL:
   - Perguntas: 70% do tempo
   - Apresentação: 30% do tempo
   - Foco em BENEFÍCIOS, não características

4. QUALIDADE POR CATEGORIA:
   🔧 Ferramentas: Foco em produtividade, durabilidade, ROI
   ☀️ Energia Solar: Economia, sustentabilidade, independência energética
   🏗️ Construção: Qualidade, prazo de obra, custo-benefício

GERE RECOMENDAÇÕES SPIN:
- Se vendedor pulou Perguntas de Problema: "Pergunte: ''Qual dificuldade você enfrenta com [situação atual]?''"
- Se não explorou Implicações: "Desenvolva: ''Como isso afeta [prazo/custo/qualidade] da obra?''"
- Se apresentou muito cedo: "Volte às perguntas! Descubra mais sobre o problema antes de oferecer solução"
- Se não obteve Necessidade: "Pergunte: ''Como seria valioso resolver esse problema?''"

EXEMPLO COACHING:
"João, você está perdendo a venda! Use Pergunta de Implicação: ''Esse atraso na obra está gerando multa contratual?'' Isso criará urgência no cliente."',
'{"intervaloAnalise": 180, "scoreMinimo": 7.0, "alertarGerenteScore": 5.0, "spinComplianceMinima": 60, "coachingRealTime": true}'),

('gerador_resumo', 'Gerador de Resumos SPIN', 'Cria resumos estruturados seguindo descobertas SPIN para transferência', 'active', '2.0',
'Crie um resumo SPIN da conversa para o próximo vendedor maximizar a venda.

FORMATO RESUMO SPIN:
=== ANÁLISE SPIN DO CLIENTE ===
📱 Cliente: [Nome] - [Telefone]
🏢 Empresa/Projeto: [Se mencionado]
📦 Categoria: [Ferramentas/Energia Solar/Construção]

📊 SITUAÇÃO ATUAL:
- Contexto: [O que descobrimos sobre a situação]
- Uso atual: [Como fazem hoje]
- Volume/Porte: [Tamanho do projeto/necessidade]

⚠️ PROBLEMAS IDENTIFICADOS:
- Principal: [Maior problema mencionado]
- Secundários: [Outros problemas]
- Nível de consciência: [Cliente reconhece o problema?]

💥 IMPLICAÇÕES DESCOBERTAS:
- Impacto financeiro: [Custos do problema]
- Impacto operacional: [Como afeta o trabalho]
- Impacto temporal: [Atrasos/urgências]
- Outras consequências: [Se houver]

✅ NECESSIDADES DE SOLUÇÃO:
- Valor desejado: [O que o cliente quer alcançar]
- Urgência: [Alta/Média/Baixa + justificativa]
- Critérios de decisão: [O que é importante para ele]

🎯 ESTRATÉGIA SPIN RECOMENDADA:
1. Se QUENTE: Vá direto para demonstração de capacidade focando nos benefícios que atendem às necessidades explícitas
2. Se MORNO: Desenvolva mais Perguntas de Implicação sobre: [área a explorar]
3. Se FRIO: Comece com Perguntas de Situação sobre: [contexto a descobrir]

💡 PRÓXIMAS PERGUNTAS SPIN SUGERIDAS:
- P: "[Pergunta de Problema específica]"
- I: "[Pergunta de Implicação específica]"
- N: "[Pergunta de Necessidade específica]"

🚫 EVITE:
- [Erros comuns para este tipo de cliente]
- [Características a não mencionar]

🎁 GANCHO DE FECHAMENTO:
"[Frase específica que conecta a necessidade dele com nossa solução]"',
'{"incluirTranscricao": true, "destacarSPINGaps": true, "sugerirProximasPerguntas": true, "personalizarPorCategoria": true}');

-- Aplicar trigger de updated_at na nova tabela
CREATE TRIGGER update_ai_agents_config_updated_at 
    BEFORE UPDATE ON ai_agents_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
