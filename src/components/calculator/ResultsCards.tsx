
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
  portfolioReturn
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
    const monthlyReturnRate = (portfolioReturn / 100) / 12;
    const pessimisticIncome = pessimisticWealth * monthlyReturnRate;
    const medianIncome = medianWealth * monthlyReturnRate;
    const optimisticIncome = optimisticWealth * monthlyReturnRate;

    const scenarios = [
      {
        title: "Cenário Pessimista",
        subtitle: "25% dos casos",
        wealth: pessimisticWealth,
        income: pessimisticIncome,
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-900",
        subtitleColor: "text-red-600",
        icon: TrendingDown,
        iconColor: "text-red-500"
      },
      {
        title: "Cenário Neutro",
        subtitle: "50% dos casos",
        wealth: medianWealth,
        income: medianIncome,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-900",
        subtitleColor: "text-blue-600",
        icon: Minus,
        iconColor: "text-blue-500"
      },
      {
        title: "Cenário Otimista",
        subtitle: "75% dos casos",
        wealth: optimisticWealth,
        income: optimisticIncome,
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-900",
        subtitleColor: "text-green-600",
        icon: TrendingUp,
        iconColor: "text-green-500"
      }
    ];

    return (
      <div className="space-y-6 mb-8">
        {/* Título das Projeções Monte Carlo */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Projeções Patrimoniais (Monte Carlo)</h3>
          <p className="text-sm text-gray-600">Baseado em 100 simulações considerando volatilidade do mercado</p>
        </div>

        {/* Cards das Três Projeções */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => {
            const IconComponent = scenario.icon;
            return (
              <Card key={index} className={`p-6 monte-carlo-card ${scenario.bgColor} ${scenario.borderColor} hover:shadow-lg transition-shadow duration-200`}>
                <div className="text-center space-y-4">
                  {/* Header com ícone */}
                  <div className="flex items-center justify-center space-x-2">
                    <IconComponent className={`w-5 h-5 ${scenario.iconColor}`} />
                    <h4 className={`text-lg font-bold ${scenario.textColor}`}>{scenario.title}</h4>
                  </div>
                  
                  <p className={`text-sm font-medium ${scenario.subtitleColor}`}>{scenario.subtitle}</p>
                  
                  {/* Patrimônio */}
                  <div className="space-y-1">
                    <p className={`text-xs ${scenario.subtitleColor} uppercase tracking-wide`}>
                      Patrimônio aos {retirementAge} anos
                    </p>
                    <p className={`text-2xl font-bold ${scenario.textColor}`}>
                      {formatCurrency(scenario.wealth)}
                    </p>
                  </div>
                  
                  {/* Renda Mensal */}
                  <div className="space-y-1 pt-2 border-t border-gray-200">
                    <p className={`text-xs ${scenario.subtitleColor} uppercase tracking-wide`}>
                      Renda mensal sustentável
                    </p>
                    <p className={`text-lg font-semibold ${scenario.textColor}`}>
                      {formatCurrency(scenario.income)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Métricas Adicionais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 glass-card">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Investimento inicial</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(initialAmount)}</p>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="text-center">
              <p className="text-sm text-blue-700 font-medium">Probabilidade de sucesso</p>
              <p className="text-xl font-bold text-blue-900">
                {(monteCarloResult.statistics.successProbability * 100).toFixed(1)}%
              </p>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="text-center">
              <p className="text-sm text-orange-700 font-medium">Duração da renda</p>
              <p className="text-xl font-bold text-orange-900">{lifeExpectancy - retirementAge} anos</p>
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
        <p className="text-sm text-gray-500">Investimento inicial</p>
        <p className="text-2xl font-bold">{formatCurrency(initialAmount)}</p>
      </Card>
      
      <Card className="p-4 glass-card">
        <p className="text-sm text-gray-500">Patrimônio aos {retirementAge} anos</p>
        <p className="text-2xl font-bold">{formatCurrency(calculationResult.finalAmount)}</p>
      </Card>
      
      <Card className="p-4 glass-card">
        <p className="text-sm text-gray-500">Renda mensal na aposentadoria</p>
        <p className="text-2xl font-bold">{formatCurrency(calculationResult.monthlyIncome)}</p>
      </Card>
      
      <Card className="p-4 glass-card">
        <p className="text-sm text-gray-500">Duração da renda</p>
        <p className="text-2xl font-bold">{lifeExpectancy - retirementAge} anos</p>
      </Card>
    </div>
  );
};
