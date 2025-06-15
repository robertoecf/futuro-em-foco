
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { CalculationResult } from './types';
import type { MonteCarloResult } from '@/lib/utils';

interface ResultsCardsProps {
  calculationResult: CalculationResult | null;
  retirementAge: number;
  lifeExpectancy: number;
  initialAmount: number;
  monteCarloResult?: MonteCarloResult | null;
  isMonteCarloEnabled?: boolean;
}

export const ResultsCards: React.FC<ResultsCardsProps> = ({
  calculationResult,
  retirementAge,
  lifeExpectancy,
  initialAmount,
  monteCarloResult,
  isMonteCarloEnabled = false
}) => {
  if (!calculationResult) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 bg-gray-50 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  // Se Monte Carlo estiver habilitado e tiver resultados, use os dados probabilísticos
  if (isMonteCarloEnabled && monteCarloResult) {
    const retirementIndex = retirementAge - calculationResult.finalAmount > 0 ? 
      Math.min(monteCarloResult.scenarios.pessimistic.length - 1, retirementAge - 30) : // Assumindo idade atual 30
      0;
    
    const pessimisticWealth = monteCarloResult.scenarios.pessimistic[retirementIndex] || 0;
    const medianWealth = monteCarloResult.scenarios.median[retirementIndex] || 0;
    const optimisticWealth = monteCarloResult.scenarios.optimistic[retirementIndex] || 0;

    // Calcular rendas mensais baseadas no patrimônio de cada cenário
    const monthlyIncomeRate = 0.004; // 0.4% mensal
    const pessimisticIncome = pessimisticWealth * monthlyIncomeRate;
    const medianIncome = medianWealth * monthlyIncomeRate;
    const optimisticIncome = optimisticWealth * monthlyIncomeRate;

    return (
      <div className="space-y-6 mb-8">
        {/* Título das Projeções Monte Carlo */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Projeções Patrimoniais (Monte Carlo)</h3>
          <p className="text-sm text-gray-600">Baseado em 100 simulações considerando volatilidade do mercado</p>
        </div>

        {/* Cards das Três Projeções */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cenário Pessimista */}
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="text-center">
              <h4 className="text-sm font-medium text-red-800 mb-2">Cenário Pessimista (25%)</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-red-600 mb-1">Patrimônio aos {retirementAge} anos</p>
                  <p className="text-xl font-bold text-red-900">{formatCurrency(pessimisticWealth)}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600 mb-1">Renda mensal</p>
                  <p className="text-lg font-semibold text-red-800">{formatCurrency(pessimisticIncome)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Cenário Neutro */}
          <Card className="p-6 border-blue-200 bg-blue-50 ring-2 ring-blue-300">
            <div className="text-center">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Cenário Neutro (50%)</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Patrimônio aos {retirementAge} anos</p>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(medianWealth)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Renda mensal</p>
                  <p className="text-lg font-semibold text-blue-800">{formatCurrency(medianIncome)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Cenário Otimista */}
          <Card className="p-6 border-green-200 bg-green-50">
            <div className="text-center">
              <h4 className="text-sm font-medium text-green-800 mb-2">Cenário Otimista (75%)</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-green-600 mb-1">Patrimônio aos {retirementAge} anos</p>
                  <p className="text-xl font-bold text-green-900">{formatCurrency(optimisticWealth)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 mb-1">Renda mensal</p>
                  <p className="text-lg font-semibold text-green-800">{formatCurrency(optimisticIncome)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Investimento inicial</p>
            <p className="text-xl font-bold">{formatCurrency(initialAmount)}</p>
          </Card>
          
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">Probabilidade de sucesso</p>
            <p className="text-xl font-bold text-blue-800">
              {(monteCarloResult.statistics.successProbability * 100).toFixed(1)}%
            </p>
          </Card>
          
          <Card className="p-4 bg-gray-50">
            <p className="text-sm text-gray-500">Duração da renda</p>
            <p className="text-xl font-bold">{lifeExpectancy - retirementAge} anos</p>
          </Card>
        </div>
      </div>
    );
  }

  // Layout original para cálculo determinístico
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Investimento inicial</p>
        <p className="text-2xl font-bold">{formatCurrency(initialAmount)}</p>
      </Card>
      
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Patrimônio aos {retirementAge} anos</p>
        <p className="text-2xl font-bold">{formatCurrency(calculationResult.finalAmount)}</p>
      </Card>
      
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Renda mensal na aposentadoria</p>
        <p className="text-2xl font-bold">{formatCurrency(calculationResult.monthlyIncome)}</p>
      </Card>
      
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Duração da renda</p>
        <p className="text-2xl font-bold">{lifeExpectancy - retirementAge} anos</p>
      </Card>
    </div>
  );
};
