# 🏦 MÓDULO GESTÃO PATRIMONIAL - ESPECIFICAÇÕES TÉCNICAS
*Baseado no padrão Warren Wealth Management*

## 📋 VISÃO GERAL

O Módulo de Gestão Patrimonial complementa o sistema de projeções de aposentadoria com uma **consolidação completa da situação patrimonial atual**, permitindo análises mais precisas e planejamento integrado.

## 🏗️ ARQUITETURA DO MÓDULO

### **1. CONSOLIDAÇÃO PATRIMONIAL**

#### **1.1 Ativos Líquidos**
```typescript
interface LiquidAssets {
  onshore: {
    investments: Investment[];
    cash: number;
    checkingAccounts: BankAccount[];
    savingsAccounts: BankAccount[];
    total: number;
  };
  offshore: {
    investments: Investment[];
    accounts: ForeignAccount[];
    currency: 'USD' | 'EUR' | 'OTHER';
    total: number;
    totalBRL: number; // Convertido pela cotação atual
  };
  totalLiquid: number;
}
```

#### **1.2 Ativos Ilíquidos**
```typescript
interface IlliquidAssets {
  realEstate: {
    properties: Property[];
    totalValue: number;
  };
  vehicles: {
    cars: Vehicle[];
    motorcycles: Vehicle[];
    boats: Vehicle[];
    totalValue: number;
  };
  businessParticipations: {
    companies: BusinessParticipation[];
    startups: Startup[];
    totalValue: number;
  };
  totalIlliquid: number;
}

interface Property {
  id: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'LAND' | 'VACATION';
  address: string;
  city: string;
  state: string;
  currentValue: number;
  purchaseValue: number;
  purchaseDate: Date;
  appreciation: number; // % ao ano
  isMainResidence: boolean;
  hasFinancing: boolean;
  financingDetails?: Financing;
}
```

#### **1.3 Passivos**
```typescript
interface Liabilities {
  mortgages: Mortgage[];
  loans: Loan[];
  creditCards: CreditCard[];
  obligations: Obligation[];
  totalLiabilities: number;
}

interface Mortgage {
  id: string;
  propertyId: string;
  bank: string;
  originalAmount: number;
  remainingBalance: number;
  interestRate: number; // % ao ano
  monthlyPayment: number;
  remainingMonths: number;
  type: 'SAC' | 'PRICE' | 'FIXED';
}
```

### **2. ANÁLISE DE FLUXO DE CAIXA**

#### **2.1 Estrutura de Receitas**
```typescript
interface IncomeAnalysis {
  primarySources: {
    salary: number;
    businessIncome: number;
    dividends: number;
    rentalIncome: number;
    lectures: number; // Palestras
    consulting: number;
    government: number; // Ex: Celepar
  };
  seasonalIncome: {
    bonuses: number;
    thirteenthSalary: number;
    profitSharing: number;
  };
  passiveIncome: {
    investments: number;
    realEstate: number;
    royalties: number;
  };
  totalAnnualIncome: number;
  monthlyAverage: number;
}
```

#### **2.2 Estrutura de Despesas**
```typescript
interface ExpenseAnalysis {
  fixedExpenses: {
    housing: number; // Moradia
    utilities: number; // Conta de luz, água, internet
    insurance: number; // Seguros
    loans: number; // Prestações
    education: number; // Educação filhos
    healthcare: number; // Plano de saúde
  };
  variableExpenses: {
    food: number;
    transportation: number;
    entertainment: number;
    travel: number;
    shopping: number;
    misc: number;
  };
  investmentContributions: number;
  taxes: number;
  totalAnnualExpenses: number;
  savingCapacity: number; // Receitas - Despesas
}
```

### **3. PLANEJAMENTO SUCESSÓRIO**

#### **3.1 Estrutura Familiar**
```typescript
interface FamilyStructure {
  holder: {
    name: string;
    age: number;
    profession: string;
  };
  spouse?: {
    name: string;
    age: number;
    profession: string;
    maritalRegime: 'COMUNHAO_PARCIAL' | 'COMUNHAO_UNIVERSAL' | 'SEPARACAO_TOTAL' | 'PARTICIPACAO_FINAL';
  };
  children: Child[];
  dependents: Dependent[];
}

interface Child {
  name: string;
  age: number;
  isMinor: boolean;
  profession?: string;
  financialDependency: boolean;
}
```

#### **3.2 Simulação Sucessória**
```typescript
interface SuccessionSimulation {
  scenarios: {
    separation: SuccessionScenario; // Separação
    death: SuccessionScenario; // Falecimento
  };
  costs: {
    itcmd: number; // Imposto sobre transmissão
    legalFees: number; // Honorários advocatícios
    inventoryFees: number; // Custos de inventário
    totalCosts: number;
    percentageOfEstate: number;
  };
  instruments: {
    publicTestament: boolean;
    wholeLifeInsurance: Insurance[];
    privatePension: PrivatePension[];
    offshoreStructures: OffshoreStructure[];
  };
}
```

### **4. GESTÃO DE RISCOS E SEGUROS**

#### **4.1 Mapeamento de Vulnerabilidades**
```typescript
interface VulnerabilityMap {
  categories: {
    succession: Vulnerability[];
    tax: Vulnerability[];
    investment: Vulnerability[];
    operational: Vulnerability[];
    insurance: Vulnerability[];
  };
}

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedCost: number;
  solutions: Solution[];
  status: 'IDENTIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'IGNORED';
}
```

#### **4.2 Cobertura de Seguros**
```typescript
interface InsuranceCoverage {
  life: {
    policies: LifeInsurance[];
    totalCoverage: number;
    adequacyRatio: number; // Cobertura / Necessidade
  };
  property: {
    residential: PropertyInsurance[];
    vehicles: VehicleInsurance[];
    totalCoverage: number;
  };
  business: {
    keyPerson: KeyPersonInsurance[];
    generalLiability: BusinessInsurance[];
    totalCoverage: number;
  };
  recommendations: InsuranceRecommendation[];
}
```

### **5. MANDATOS DE INVESTIMENTO**

#### **5.1 Objetivos e Estratégia**
```typescript
interface InvestmentMandates {
  objectives: {
    primary: 'PRESERVATION' | 'GROWTH' | 'INCOME' | 'BALANCED';
    targetReturn: number; // Ex: IPCA + 5.5%
    timeHorizon: number; // Anos
    retirementTarget: Date;
  };
  constraints: {
    riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    liquidity: number; // % que precisa ficar líquido
    concentration: number; // % máximo em um ativo
    geographic: GeographicAllocation;
  };
  performance: {
    current: PerformanceMetrics;
    benchmark: PerformanceMetrics;
    attribution: PerformanceAttribution;
  };
}
```

## 🎨 INTERFACE DO USUÁRIO

### **Dashboard Principal**
```typescript
interface PatrimonialDashboard {
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingCapacity: number;
  };
  charts: {
    assetAllocation: ChartConfig;
    incomeVsExpenses: ChartConfig;
    netWorthEvolution: ChartConfig;
    liquidity: ChartConfig;
  };
  alerts: Alert[];
  nextActions: Action[];
}
```

### **Telas Específicas**

#### **Tela 1: Consolidação**
- Input manual de ativos/passivos
- Conexão com APIs bancárias (Open Banking)
- Valorização automática (FIPE, imóveis, ações)
- Balanço patrimonial visual

#### **Tela 2: Fluxo de Caixa**
- Categorização de receitas/despesas
- Análise de sazonalidade
- Projeções de fluxo
- Alertas de desvios

#### **Tela 3: Sucessão**
- Chart familiar interativo
- Simulador de cenários
- Calculadora de custos ITCMD
- Recomendações de instrumentos

#### **Tela 4: Riscos**
- Mapa de vulnerabilidades
- Status de seguros
- Recomendações de cobertura
- Plano de ação

#### **Tela 5: Investimentos**
- Performance vs benchmark
- Asset allocation atual vs target
- Rebalanceamento sugerido
- Mandatos e objetivos

## 🔗 INTEGRAÇÃO COM MÓDULO DE PROJEÇÕES

### **Dados Compartilhados**
```typescript
interface SharedData {
  currentPatrimony: number; // Vem da consolidação
  monthlyIncome: number; // Vem do fluxo de caixa
  monthlyExpenses: number; // Vem do fluxo de caixa
  savingCapacity: number; // Calculado automaticamente
  riskProfile: InvestorProfile; // Vem dos mandatos
  retirementGoals: RetirementGoals; // Bidirecionais
}
```

### **Fluxo de Dados**
1. **Consolidação → Projeções**: Patrimônio atual mais preciso
2. **Fluxo → Projeções**: Capacidade de poupança real
3. **Projeções → Sucessão**: Patrimônio projetado para planejamento
4. **Riscos → Projeções**: Ajustes por vulnerabilidades identificadas

## 🛠️ IMPLEMENTAÇÃO TÉCNICA

### **Fase 1: MVP (4-6 semanas)**
- [ ] Consolidação básica (manual)
- [ ] Fluxo de caixa simples
- [ ] Dashboard principal
- [ ] Integração com projeções

### **Fase 2: Automação (6-8 semanas)**
- [ ] Integração Open Banking
- [ ] APIs de cotação (FIPE, B3)
- [ ] Calculadoras sucessórias
- [ ] Alertas e recomendações

### **Fase 3: IA e Analytics (4-6 semanas)**
- [ ] Categorização automática
- [ ] Projeções de fluxo
- [ ] Recomendações personalizadas
- [ ] Relatórios avançados

## 📊 DADOS DE EXEMPLO (CASO WARREN)

### **Configuração Inicial**
```typescript
const exemploWarren: PatrimonialData = {
  liquidAssets: {
    onshore: 5300000,
    offshore: 300000,
    total: 5600000
  },
  illiquidAssets: {
    realEstate: 8000000,
    vehicles: 350000,
    businesses: 25000000,
    total: 33350000
  },
  liabilities: {
    mortgages: 4650000,
    obligations: 3500000,
    total: 8150000
  },
  netWorth: 30800000,
  monthlyIncome: 150000,
  monthlyExpenses: 100000,
  savingCapacity: 50000
};
```

## 🎯 RESULTADO ESPERADO

Com este módulo, o usuário terá:

1. **Visão 360° do patrimônio** - Todos os ativos/passivos organizados
2. **Análise de fluxo precisa** - Entendimento real da capacidade de poupança
3. **Planejamento sucessório** - Instrumentos e custos mapeados
4. **Gestão de riscos** - Vulnerabilidades identificadas e priorizadas
5. **Mandatos claros** - Objetivos e estratégias definidas
6. **Projeções realistas** - Baseadas em dados reais, não estimativas

**Próximos passos**: Implementar o MVP começando pela consolidação patrimonial e integração com o módulo de projeções existente. 