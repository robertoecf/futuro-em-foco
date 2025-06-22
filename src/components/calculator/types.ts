// 🚨 DEPRECATED: Este arquivo foi movido para src/components/calculator/types/index.ts
// Use `import { Type } from './types/index'` em vez deste arquivo
// Este arquivo será removido na próxima fase de limpeza

// Re-exports para manter compatibilidade temporária
export * from './types/index';

export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';

export interface CalculationResult {
  finalAmount: number;
  yearlyValues: number[];
  monthlyIncome: number;
}
