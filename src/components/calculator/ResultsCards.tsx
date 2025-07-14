import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { CalculationResult } from './types';
import type { MonteCarloResult } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ResultsCardsProps {
  calculationResult: CalculationResult | null;
  retirementAge: number;
  lifeExpectancy: number;
  initialAmount: number;
  monteCarloResult?: MonteCarloResult | null;
  isMonteCarloEnabled?: boolean;
  currentAge: number;
  portfolioReturn: number;
}

export const ResultsCards: React.FC<ResultsCardsProps> = ({
  calculationResult,
  retirementAge,
  lifeExpectancy,
  initialAmount,
  monteCarloResult,
  isMonteCarloEnabled = false,
  currentAge,
  portfolioReturn,
}) => {
  if (!calculationResult) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 glass-card animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  // Se Monte Carlo estiver habilitado e tiver resultados, use os dados probabilísticos
  if (isMonteCarloEnabled && monteCarloResult) {
    const retirementIndex = retirementAge - currentAge;

    // Garantir que o índice está dentro do range dos dados
    const safeIndex = Math.min(retirementIndex, monteCarloResult.scenarios.pessimistic.length - 1);

    const pessimisticWealth = monteCarloResult.scenarios.pessimistic[safeIndex] || 0;
    const medianWealth = monteCarloResult.scenarios.median[safeIndex] || 0;
    const optimisticWealth = monteCarloResult.scenarios.optimistic[safeIndex] || 0;

    // Calcular rendas mensais baseadas no patrimônio de cada cenário usando o retorno definido pelo usuário
    const monthlyReturnRate = portfolioReturn / 100 / 12;
    const pessimisticIncome = pessimisticWealth * monthlyReturnRate;
    const medianIncome = medianWealth * monthlyReturnRate;
    const optimisticIncome = optimisticWealth * monthlyReturnRate;

    const scenarios = [
      {
        title: 'Cenário Pessimista',
        subtitle: '5% chance de resultado pior',
        wealth: pessimisticWealth,
        income: pessimisticIncome,
        icon: TrendingDown,
        iconColor: 'text-red-500',
      },
      {
        title: 'Cenário Mediano',
        subtitle: '50% dos cenários',
        wealth: medianWealth,
        income: medianIncome,
        icon: Minus,
        iconColor: 'text-blue-500',
      },
      {
        title: 'Cenário Otimista',
        subtitle: '5% chance de resultado melhor',
        wealth: optimisticWealth,
        income: optimisticIncome,
        icon: TrendingUp,
        iconColor: 'text-green-500',
      },
    ];

    return (
      <div className="mb-4 w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 [grid-auto-rows:1fr]">
          {scenarios.map((scenario, index) => {
            const IconComponent = scenario.icon;
            return (
              <Card key={index} className="p-4 glass-card flex flex-col h-full justify-between">
                <div className="space-y-2 text-center">
                  {/* Header com ícone (sem emoji) */}
                  <div className="flex items-center justify-center space-x-2 mb-1 text-center">
                    <IconComponent className={`w-5 h-5 ${scenario.iconColor}`} />
                    <h4 className="text-base font-bold text-white">{scenario.title}</h4>
                  </div>
                  <p className="text-xs font-medium text-white">{scenario.subtitle}</p>
                  {/* Explicação científica */}
                  <p className="text-xs text-white/80 leading-relaxed break-words max-w-xs mx-auto text-center">
                    {index === 0 && 'Apenas 5% dos cenários simulados apresentam resultado pior'}
                    {index === 1 && 'Resultado típico esperado - mediana das simulações'}
                    {index === 2 && 'Apenas 5% dos cenários simulados apresentam resultado melhor'}
                  </p>
                  {/* Patrimônio */}
                  <div className="space-y-1">
                    <p className="text-xs text-white uppercase tracking-wide">
                      Patrimônio aos {retirementAge} anos
                    </p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(scenario.wealth)}
                    </p>
                  </div>
                  {/* Renda Mensal */}
                  <div className="space-y-1 pt-2 border-t border-white/20">
                    <p className="text-xs text-white uppercase tracking-wide">
                      Renda mensal sustentável
                    </p>
                    <p className="text-base font-semibold text-white">
                      {formatCurrency(scenario.income)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 [grid-auto-rows:1fr]">
          <Card className="p-4 glass-card flex flex-col h-full justify-between">
            <div className="text-center">
              <p className="text-sm text-white font-medium">Investimento inicial</p>
              <p className="text-xl font-bold text-white">{formatCurrency(initialAmount)}</p>
            </div>
          </Card>

          <Card className="p-4 glass-card flex flex-col h-full justify-between">
            <div className="text-center">
              <p className="text-sm text-white font-medium">Probabilidade de sucesso</p>
              <p className="text-xl font-bold text-white">
                {(monteCarloResult.statistics.successProbability * 100).toFixed(1)}%
              </p>
            </div>
          </Card>

          <Card className="p-4 glass-card flex flex-col h-full justify-between">
            <div className="text-center">
              <p className="text-sm text-white font-medium">Duração da renda</p>
              <p className="text-xl font-bold text-white">{lifeExpectancy - retirementAge} anos</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Layout original para cálculo determinístico
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 glass-card">
        <p className="text-sm text-white">Investimento inicial</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(initialAmount)}</p>
      </Card>

      <Card className="p-4 glass-card">
        <p className="text-sm text-white">Patrimônio aos {retirementAge} anos</p>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(calculationResult.finalAmount)}
        </p>
      </Card>

      <Card className="p-4 glass-card">
        <p className="text-sm text-white">Renda mensal na aposentadoria</p>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(calculationResult.monthlyIncome)}
        </p>
      </Card>

      <Card className="p-4 glass-card">
        <p className="text-sm text-white">Duração da renda</p>
        <p className="text-2xl font-bold text-white">{lifeExpectancy - retirementAge} anos</p>
      </Card>
    </div>
  );
};
