# Futuro em Foco - Plataforma de Planejamento Financeiro

![Futuro em Foco Logo](./public/futuroemfoco-icon.png)

Uma aplicação moderna de planejamento financeiro e patrimonial construída com tecnologias de ponta.

**🌐 Aplicação Online:** [https://futuroemfoco.vercel.app/](https://futuroemfoco.vercel.app/)

## 🚀 Tecnologias Utilizadas

### **Core Framework**
- **React 18.3.1** - Biblioteca para interfaces de usuário
- **TypeScript 5.8.3** - Tipagem estática para JavaScript
- **Vite 5.4.19** - Build tool e dev server ultra-rápido

### **UI/UX & Design System**
- **Tailwind CSS 3.4.11** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e customizáveis
- **shadcn/ui** - Sistema de design baseado em Radix UI
- **Framer Motion 12.19.2** - Animações e transições
- **Lucide React** - Ícones modernos
- **next-themes** - Gerenciamento de temas (dark/light)

### **Formulários & Validação**
- **React Hook Form 7.53.0** - Gerenciamento de formulários
- **Zod 3.23.8** - Validação de schemas
- **@hookform/resolvers** - Integração React Hook Form + Zod

### **Roteamento & Estado**
- **React Router DOM 6.26.2** - Roteamento client-side
- **@tanstack/react-query 5.56.2** - Gerenciamento de estado e cache

### **Visualização de Dados**
- **Recharts 2.12.7** - Biblioteca de gráficos React
- **Framer Motion** - Animações em gráficos

### **Backend & Integrações**
- **Supabase 2.50.0** - Backend-as-a-Service (banco de dados, auth, realtime)
- **PostHog 1.252.0** - Analytics e product analytics

### **Ferramentas de Desenvolvimento**
- **ESLint 9.29.0** - Linting de código
- **Prettier 3.5.3** - Formatação de código
- **Vitest 3.2.4** - Framework de testes
- **Testing Library** - Utilitários para testes de componentes
- **Husky 9.1.7** - Git hooks
- **lint-staged** - Linting apenas de arquivos staged

### **Outras Dependências**
- **date-fns 3.6.0** - Manipulação de datas
- **clsx & tailwind-merge** - Utilitários para classes CSS
- **sonner** - Sistema de notificações toast
- **embla-carousel-react** - Carrossel responsivo
- **vaul** - Drawer/sheet components

## 🤖 MCPs (Model Context Protocol) Utilizados

O projeto utiliza um conjunto avançado de MCPs para automação e desenvolvimento inteligente:

### **MCPs Principais**

#### **1. GitHub MCP**
- **Função:** Integração total com GitHub
- **Capacidades:** Pull Requests, issues, workflows, CI/CD, revisões
- **Autenticação:** GitHub Personal Access Token
- **Implementação:** ghcr.io/github/github-mcp-server (Docker)

#### **2. Supabase MCP**
- **Função:** Automação avançada do Supabase
- **Capacidades:** Migrations, edge functions, SQL, dados, auth, storage
- **Autenticação:** Supabase Access Token
- **Implementação:** @supabase/mcp-server-supabase (npx)
- **Modo:** Read-only para segurança

#### **3. Context7 MCP**
- **Função:** Análise de contexto e busca semântica
- **Capacidades:** Embeddings, semantic_search, análise de código
- **Uso:** Análise de código, documentação, busca inteligente

#### **4. Sequential Thinking MCP**
- **Função:** Execução de fluxos lógicos encadeados
- **Capacidades:** run_sequence, chain_tools, raciocínio estruturado
- **Uso:** Automação de workflows complexos, debugging

### **MCPs via Proxy (mcp-proxy)**

O projeto utiliza um proxy MCP que orquestra múltiplos agentes:

| MCP | Função | Ferramentas Principais |
|-----|--------|----------------------|
| **context7** | Análise de contexto | semantic_search, embedding_generate |
| **sequential_thinking** | Fluxos lógicos | run_sequence, chain_tools |
| **browser-tools** | Diagnóstico web | getConsoleLogs, takeScreenshot |
| **selenium** | Automação web | click_element, input_text |
| **playwright** | Automação avançada | goto, screenshot, evaluate |
| **firecrawl** | Crawling/scraping | generate_llmstxt, crawl_site |
| **filesystem** | Manipulação de arquivos | read_file, write_file, list_dir |
| **postgres** | Operações PostgreSQL | execute_sql, list_tables |
| **docker** | Gerenciamento containers | list_containers, start_container |

### **Casos de Uso dos MCPs**

#### **Desenvolvimento Inteligente**
- **GitHub MCP:** Automação de PRs, code review, CI/CD
- **Context7:** Análise de código e documentação
- **Sequential Thinking:** Debugging complexo e workflows

#### **Backend e Dados**
- **Supabase MCP:** Migrations automáticas, edge functions
- **PostgreSQL:** Operações diretas no banco
- **Filesystem:** Manipulação de arquivos de configuração

#### **Automação Web**
- **Selenium/Playwright:** Testes automatizados
- **Browser-tools:** Debugging de interface
- **Firecrawl:** Análise de conteúdo web

#### **Infraestrutura**
- **Docker:** Gerenciamento de containers
- **Filesystem:** Automação de arquivos
- **Sequential Thinking:** Orquestração de workflows

### **Configuração MCP**

```bash
# GitHub MCP (Docker)
docker run -p 3000:3000 ghcr.io/github/github-mcp-server

# Supabase MCP (Node.js)
npx @supabase/mcp-server-supabase --read-only

# MCP Proxy (Python)
python3.13 -m mcpproxy
```

## 🏗️ Estrutura do Projeto

```
futuro-em-foco/
├── 📁 src/                          # Código fonte principal
│   ├── 📁 components/               # Componentes React
│   │   ├── 📁 calculator/           # Calculadora financeira
│   │   │   ├── Calculator.tsx       # Componente principal
│   │   │   ├── CalculatorForm.tsx   # Formulário de entrada
│   │   │   ├── ResultsCards.tsx     # Exibição de resultados
│   │   │   ├── InsightsCards.tsx    # Insights e análises
│   │   │   ├── constants.ts         # Constantes da calculadora
│   │   │   ├── types.ts             # Tipos TypeScript
│   │   │   └── 📁 insights/         # Componentes de insights
│   │   ├── 📁 chart/                # Componentes de gráficos
│   │   │   ├── ChartRenderer.tsx    # Renderizador principal
│   │   │   ├── ChartControls.tsx    # Controles de gráfico
│   │   │   ├── ChartLegend.tsx      # Legenda do gráfico
│   │   │   ├── CustomTooltip.tsx    # Tooltip customizado
│   │   │   ├── ExportButton.tsx     # Botão de exportação
│   │   │   └── 📁 hooks/            # Hooks para animações
│   │   ├── 📁 forms/                # Formulários
│   │   │   └── LeadFormFields.tsx   # Campos de lead
│   │   ├── 📁 ui/                   # Componentes UI base (shadcn/ui)
│   │   │   ├── button.tsx           # Botões
│   │   │   ├── card.tsx             # Cards
│   │   │   ├── dialog.tsx           # Diálogos
│   │   │   ├── form.tsx             # Formulários
│   │   │   ├── input.tsx            # Inputs
│   │   │   ├── select.tsx           # Selects
│   │   │   ├── toast.tsx            # Notificações
│   │   │   └── ...                  # +30 componentes UI
│   │   ├── HeroSection.tsx          # Seção hero
│   │   ├── LeadCaptureForm.tsx      # Formulário de captura
│   │   ├── MatrixRain.tsx           # Efeito matrix
│   │   ├── PostHogProvider.tsx      # Provider do PostHog
│   │   └── Recommendations.tsx      # Recomendações
│   ├── 📁 hooks/                    # Custom hooks
│   │   ├── use-mobile.tsx           # Hook para mobile
│   │   ├── useDebounce.ts           # Debounce hook
│   │   ├── useLeadFormValidation.ts # Validação de formulário
│   │   ├── useOverscroll.ts         # Hook de overscroll
│   │   └── usePlanningData.ts       # Hook de dados
│   ├── 📁 integrations/             # Integrações externas
│   │   └── 📁 supabase/             # Integração Supabase
│   │       ├── client.ts            # Cliente Supabase
│   │       └── types.ts             # Tipos Supabase
│   ├── 📁 layouts/                  # Layouts da aplicação
│   │   └── AreaLogadaLayout.tsx     # Layout área logada
│   ├── 📁 lib/                      # Utilitários e lógica
│   │   ├── 📁 calculations/         # Cálculos financeiros
│   │   │   ├── financialCalculations.ts
│   │   │   ├── financialCalculations.test.ts
│   │   │   └── constants.ts
│   │   ├── 📁 gbm/                  # Movimento Browniano Geométrico
│   │   │   ├── coreGBM.ts           # Core do GBM
│   │   │   ├── monteCarloWorker.ts  # Worker para simulações
│   │   │   ├── optimizedSimulation.ts
│   │   │   ├── portfolioSimulation.ts
│   │   │   ├── statistics.ts        # Estatísticas
│   │   │   └── types.ts             # Tipos GBM
│   │   ├── 📁 data/                 # Dados estáticos
│   │   │   └── profileData.ts       # Dados de perfis
│   │   ├── brownianMotionUtils.ts   # Utilitários GBM
│   │   ├── encryption.ts            # Criptografia
│   │   ├── logger.ts                # Sistema de logs
│   │   ├── optimizedStorage.ts      # Storage otimizado
│   │   ├── posthog.ts               # Configuração PostHog
│   │   ├── secureStorage.ts         # Storage seguro
│   │   ├── utils.ts                 # Utilitários gerais
│   │   └── validation.ts            # Validações
│   ├── 📁 pages/                    # Páginas da aplicação
│   │   ├── Index.tsx                # Página inicial
│   │   ├── NotFound.tsx             # Página 404
│   │   ├── ProjecaoPatrimonial.tsx # Projeção patrimonial
│   │   └── 📁 area-logada/          # Área logada
│   │       ├── VisaoGeral.tsx       # Visão geral
│   │       ├── GestaoGastos.tsx     # Gestão de gastos
│   │       ├── RiscosSeguros.tsx    # Riscos e seguros
│   │       ├── Aposentadoria.tsx    # Aposentadoria
│   │       ├── Investimentos.tsx    # Investimentos
│   │       ├── Tributario.tsx       # Tributário
│   │       └── Sucessorio.tsx       # Sucessório
│   ├── 📁 styles/                   # Estilos globais
│   │   ├── base.css                 # Estilos base
│   │   ├── index.css                # Estilos principais
│   │   ├── utilities.pcss           # Utilitários CSS
│   │   └── ...                      # Outros estilos
│   ├── 📁 test/                     # Configuração de testes
│   │   └── setup.ts                 # Setup dos testes
│   ├── 📁 utils/                    # Utilitários
│   │   └── csvExport.ts             # Exportação CSV
│   ├── App.tsx                      # Componente principal
│   └── main.tsx                     # Entry point
├── 📁 public/                       # Arquivos estáticos
│   ├── favicon.ico                  # Favicon
│   ├── placeholder.svg              # Placeholder
│   └── robots.txt                   # Robots.txt
├── 📁 docs/                         # Documentação
│   ├── 📁 archive/                  # Documentação arquivada
│   ├── 📁 temp/                     # Documentação temporária
│   ├── AGENTS.md                    # Instruções para agentes AI
│   ├── BEST_PRACTICES_NEXTJS.md     # Boas práticas Next.js
│   ├── DAILY_WORKFLOW.md            # Workflow diário
│   ├── DESIGN_STATEMENT.md          # Declaração de design
│   ├── DEVELOPMENT_BEST_PRACTICES.md # Melhores práticas
│   ├── FASE_5_PERFORMANCE_PYTHON_MIGRATION.md
│   ├── FINANCIAL_MODELING.md        # Modelagem financeira
│   ├── GUIA_DE_QUALIDADE_E_LINTING.md
│   ├── PERFORMANCE_OPTIMIZATIONS.md # Otimizações de performance
│   └── PROTOCOLO_INTELIGENTE_GIT_2025.md
├── 📁 supabase/                     # Configuração Supabase
│   ├── 📁 functions/                # Edge functions
│   │   ├── 📁 insert-lead/          # Função inserir lead
│   │   └── 📁 send-lead-email/      # Função enviar email
│   ├── 📁 migrations/               # Migrações do banco
│   └── config.toml                  # Configuração Supabase
├── 📁 automation/                    # Automações
│   ├── 📁 command-proxy-agent/      # Agente proxy
│   └── 📁 python-selenium-mcp-server/
├── 📄 package.json                  # Dependências e scripts
├── 📄 vite.config.ts                # Configuração Vite
├── 📄 tailwind.config.ts            # Configuração Tailwind
├── 📄 tsconfig.json                 # Configuração TypeScript
├── 📄 eslint.config.js              # Configuração ESLint
└── 📄 README.md                     # Este arquivo
```

## 📚 Documentação em `/docs`

### **📋 Documentação Ativa**

#### **AGENTS.md** - Instruções para Agentes AI
- Protocolos para agentes AI trabalharem no projeto
- Configuração de MCPs (Model Context Protocol)
- Árvore de decisão para Pull Requests vs Commits diretos
- Instruções de qualidade de código

#### **DEVELOPMENT_BEST_PRACTICES.md** - Melhores Práticas
- Stack tecnológico 2025 baseado em Context7
- Protocolos obrigatórios de Git
- Padrões de código modernos
- Rotina de desenvolvimento otimizada
- Testing com Vitest + Testing Library

#### **FINANCIAL_MODELING.md** - Modelagem Financeira
- Projeção patrimonial com Monte Carlo
- Movimento Browniano Geométrico (GBM)
- Simulações com ruído Laplace e saltos Poisson
- Fundamentos teóricos e implementação prática
- Como explicar modelos complexos ao cliente

#### **PROTOCOLO_INTELIGENTE_GIT_2025.md** - Protocolo Git
- Árvore de decisão automatizada
- Critérios para PR vs Commit direto
- Protocolos de segurança e qualidade
- Automação de workflows

#### **DESIGN_STATEMENT.md** - Declaração de Design
- Princípios de design da aplicação
- Padrões de UI/UX
- Acessibilidade e responsividade

#### **PERFORMANCE_OPTIMIZATIONS.md** - Otimizações
- Estratégias de performance
- Code splitting e lazy loading
- Otimizações de bundle
- Métricas de performance

#### **GUIA_DE_QUALIDADE_E_LINTING.md** - Qualidade
- Configuração ESLint 9.x
- Prettier e formatação
- Husky e git hooks
- Padrões de qualidade

#### **DAILY_WORKFLOW.md** - Workflow Diário
- Rotina de desenvolvimento
- Checklist diário
- Protocolos de commit

#### **BEST_PRACTICES_NEXTJS.md** - Práticas Next.js
- Adaptações para Vite/React
- Padrões de roteamento
- Otimizações específicas

#### **FASE_5_PERFORMANCE_PYTHON_MIGRATION.md**
- Migração de cálculos para Python
- Otimizações de performance
- Integração com Web Workers

### **📁 Documentação Arquivada (`/docs/archive`)**

#### **FASE_4_QUALIDADE_MANUTENIBILIDADE.md**
- Implementação de qualidade de código
- Refatoração e manutenibilidade

#### **MAGIC_MOMENT_BUG_FIX.md**
- Correção de bugs críticos
- Debugging avançado

#### **PULL_REQUEST_MAGIC_MOMENT_FIX.md**
- Processo de Pull Request
- Code review e merge

#### **REFACTORING_PLAN.md**
- Plano de refatoração
- Estratégias de melhoria

#### **MCP.md & MCP_Project.md**
- Model Context Protocol
- Configuração de agentes

#### **PULL_REQUEST.md**
- Templates de Pull Request
- Processos de review

### **📁 Documentação Temporária (`/docs/temp`)**

#### **Formulário Life 360.md**
- Documentação de formulário específico
- Requisitos e implementação

## 🛠️ Como Editar o Código

### **Usando sua IDE Preferida**
Clone o repositório e trabalhe localmente:

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd futuro-em-foco

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### **Editando Diretamente no GitHub**
- Navegue até o arquivo desejado
- Clique no botão "Edit" (ícone de lápis)
- Faça suas mudanças e commit

### **Usando GitHub Codespaces**
- Vá para a página principal do repositório
- Clique no botão "Code" (verde)
- Selecione a aba "Codespaces"
- Clique em "New codespace"

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run dev:8084         # Servidor na porta 8084

# Build
npm run build            # Build de produção
npm run build:dev        # Build de desenvolvimento
npm run preview          # Preview do build

# Qualidade de Código
npm run lint             # Verificar linting
npm run lint:fix         # Corrigir problemas de linting
npm run marco-zero       # Lint + Build (verificação completa)

# Testes
npm run test             # Executar testes
npm run test:ui          # Interface de testes
npm run test:run         # Executar testes uma vez
npm run test:coverage    # Cobertura de testes
npm run test:watch       # Modo watch dos testes
```

## 🌍 Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example` com as seguintes variáveis:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# PostHog Analytics
VITE_POSTHOG_TOKEN=your_posthog_token
VITE_POSTHOG_HOST=https://us.i.posthog.com  # opcional
```

## 🚀 Deploy

### **Via Vercel**
O projeto está atualmente deployado no Vercel:
- **Dashboard:** [https://vercel.com/futuroemfoco/futuro-em-foco/deployments](https://vercel.com/futuroemfoco/futuro-em-foco/deployments)
- **Aplicação Online:** [https://futuroemfoco.vercel.app/](https://futuroemfoco.vercel.app/)

### **Configuração de Domínio**
Para conectar um domínio customizado:
1. Acesse o dashboard do Vercel
2. Vá para Settings > Domains
3. Adicione seu domínio customizado

## 🧪 Testes

O projeto usa Vitest com Testing Library para testes modernos:

```bash
# Executar todos os testes
npm run test

# Executar com interface visual
npm run test:ui

# Verificar cobertura
npm run test:coverage
```

## 📊 Qualidade de Código

- **ESLint 9.x** com configuração flat config
- **TypeScript** em modo strict
- **Prettier** para formatação
- **Husky** para git hooks
- **lint-staged** para linting automático

## 🔒 Segurança

- Headers de segurança configurados no Vite
- Variáveis de ambiente para credenciais sensíveis
- PostHog configurado apenas em produção
- Supabase com autenticação segura

## 📈 Performance

- **Vite** para build ultra-rápido
- **Code splitting** automático
- **Tree shaking** para reduzir bundle size
- **HMR** (Hot Module Replacement) para desenvolvimento
- **Lazy loading** de componentes
- **Optimized chunks** para vendor libraries
