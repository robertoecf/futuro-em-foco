# 🚀 PLANO DE IMPLEMENTAÇÃO MVP - GESTÃO PATRIMONIAL

## 📋 FASE 1: MVP BÁSICO (4-6 semanas)

### **SPRINT 1: Consolidação Patrimonial (2 semanas)**

#### **1.1 Estrutura de Dados**
```typescript
// src/types/patrimony.ts
export interface PatrimonyData {
  liquidAssets: LiquidAssets;
  illiquidAssets: IlliquidAssets;
  liabilities: Liabilities;
  netWorth: number;
  lastUpdated: Date;
}
```

#### **1.2 Components**
- [ ] `PatrimonyDashboard.tsx` - Dashboard principal
- [ ] `AssetInput.tsx` - Formulário de entrada de ativos
- [ ] `LiabilityInput.tsx` - Formulário de passivos  
- [ ] `NetWorthChart.tsx` - Gráfico de patrimônio líquido
- [ ] `AssetAllocationPie.tsx` - Pizza de alocação

#### **1.3 Hooks**
- [ ] `usePatrimonyData.ts` - Gerenciamento de estado
- [ ] `usePatrimonyCalculations.ts` - Cálculos automáticos
- [ ] `usePatrimonyStorage.ts` - Persistência local

### **SPRINT 2: Fluxo de Caixa (2 semanas)**

#### **2.1 Análise de Receitas/Despesas**
- [ ] `CashFlowAnalysis.tsx` - Componente principal
- [ ] `IncomeBreakdown.tsx` - Detalhamento de receitas
- [ ] `ExpenseCategories.tsx` - Categorização de gastos
- [ ] `SavingCapacityCalculator.tsx` - Capacidade de poupança

#### **2.2 Integrações**
- [ ] Conexão com dados existentes do calculator
- [ ] Sincronização bidirecionais de dados
- [ ] Validações e consistência

### **SPRINT 3: Dashboard e Integração (2 semanas)**

#### **3.1 Dashboard Unificado**
- [ ] `WealthDashboard.tsx` - Visão geral completa
- [ ] Navegação entre módulos
- [ ] Exportação de dados
- [ ] Relatórios básicos

#### **3.2 Integração com Projeções**
- [ ] Dados compartilhados entre módulos
- [ ] Atualização automática de projeções
- [ ] Consistência de dados

## 🎯 ESTRUTURA DE PASTAS

```
src/
├── components/
│   ├── patrimony/
│   │   ├── dashboard/
│   │   │   ├── PatrimonyDashboard.tsx
│   │   │   ├── WealthSummary.tsx
│   │   │   └── NetWorthChart.tsx
│   │   ├── assets/
│   │   │   ├── AssetInput.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── VehicleForm.tsx
│   │   │   └── InvestmentForm.tsx
│   │   ├── liabilities/
│   │   │   ├── LiabilityInput.tsx
│   │   │   ├── MortgageForm.tsx
│   │   │   └── LoanForm.tsx
│   │   ├── cashflow/
│   │   │   ├── CashFlowAnalysis.tsx
│   │   │   ├── IncomeBreakdown.tsx
│   │   │   └── ExpenseCategories.tsx
│   │   └── charts/
│   │       ├── AssetAllocationPie.tsx
│   │       ├── LiquidityChart.tsx
│   │       └── CashFlowChart.tsx
├── hooks/
│   ├── patrimony/
│   │   ├── usePatrimonyData.ts
│   │   ├── usePatrimonyCalculations.ts
│   │   ├── usePatrimonyStorage.ts
│   │   └── useCashFlowAnalysis.ts
├── lib/
│   ├── patrimony/
│   │   ├── calculations.ts
│   │   ├── validations.ts
│   │   └── storage.ts
└── types/
    └── patrimony.ts
```

## 📊 DADOS DE TESTE (CASO WARREN)

```typescript
export const warrenTestData: PatrimonyData = {
  liquidAssets: {
    onshore: {
      investments: [
        { type: 'FUND', name: 'Warren Life', value: 3000000 },
        { type: 'STOCKS', name: 'Ações diversas', value: 1500000 },
        { type: 'BONDS', name: 'Renda Fixa', value: 800000 }
      ],
      cash: 0,
      total: 5300000
    },
    offshore: {
      investments: [
        { type: 'ETF', name: 'UCITS ETFs', value: 300000, currency: 'USD' }
      ],
      total: 300000,
      totalBRL: 300000
    },
    totalLiquid: 5600000
  },
  illiquidAssets: {
    realEstate: {
      properties: [
        {
          id: '1',
          type: 'RESIDENTIAL',
          address: 'Apartamento São Paulo',
          city: 'São Paulo',
          state: 'SP',
          currentValue: 5000000,
          isMainResidence: true,
          hasFinancing: true
        },
        {
          id: '2', 
          type: 'VACATION',
          address: 'Casa Tatuamunha',
          city: 'Tatuamunha',
          state: 'AL',
          currentValue: 2250000,
          hasFinancing: true
        },
        {
          id: '3',
          type: 'COMMERCIAL',
          address: 'Apartamento Vitacon',
          city: 'São Paulo', 
          state: 'SP',
          currentValue: 750000,
          hasFinancing: false
        }
      ],
      totalValue: 8000000
    },
    vehicles: {
      cars: [
        { type: 'CAR', model: 'BYD Seal', value: 250000 }
      ],
      motorcycles: [
        { type: 'MOTORCYCLE', model: 'Motocicleta', value: 100000 }
      ],
      totalValue: 350000
    },
    businessParticipations: {
      companies: [
        { name: 'ISH', participation: 100, value: 25000000 }
      ],
      startups: [
        { name: 'Moto Morini', participation: 50, value: 500000 }
      ],
      totalValue: 25500000
    },
    totalIlliquid: 33850000
  },
  liabilities: {
    mortgages: [
      {
        id: '1',
        propertyId: '1',
        bank: 'Banco ABC',
        remainingBalance: 1700000,
        interestRate: 0.07,
        monthlyPayment: 15000
      },
      {
        id: '2', 
        propertyId: '2',
        bank: 'Banco XYZ',
        remainingBalance: 2250000,
        interestRate: 0.08,
        monthlyPayment: 20000
      }
    ],
    obligations: [
      {
        description: 'Mútuo MM',
        amount: 500000
      },
      {
        description: 'Compra ações ISH', 
        amount: 3000000
      }
    ],
    totalLiabilities: 7450000
  },
  netWorth: 32000000,
  lastUpdated: new Date()
};
```

## 🔧 IMPLEMENTAÇÃO PRIORITÁRIA

### **1. Começar por:**
- [ ] Estrutura básica de dados (`types/patrimony.ts`)
- [ ] Hook principal (`usePatrimonyData.ts`)
- [ ] Dashboard simples (`PatrimonyDashboard.tsx`)

### **2. Integração imediata:**
- [ ] Conectar com `useCalculator` existente
- [ ] Shared state para patrimônio atual
- [ ] Sincronização de dados

### **3. Testes com dados Warren:**
- [ ] Usar `warrenTestData` como seed
- [ ] Validar cálculos contra documento original
- [ ] Ajustar conforme necessário

## 🎯 SUCESSO DO MVP

**Critérios de aceitação:**
- [ ] Usuário consegue inserir patrimônio completo
- [ ] Cálculos automáticos funcionam corretamente  
- [ ] Integração com projeções está ativa
- [ ] Dashboard mostra visão consolidada
- [ ] Dados persistem entre sessões

**Roberto, posso começar implementando a estrutura básica de dados e o primeiro hook? Isso já vai criar a base para todo o módulo de gestão patrimonial!** 🚀 