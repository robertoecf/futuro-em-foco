
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface InsightsCardsProps {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  retirementIncome: number;
  portfolioReturn: number;
  investorProfile: 'conservador' | 'moderado' | 'arrojado';
}

export const InsightsCards: React.FC<InsightsCardsProps> = ({
  initialAmount,
  monthlyAmount,
  currentAge,
  retirementAge,
  lifeExpectancy,
  retirementIncome,
  portfolioReturn,
  investorProfile
}) => {
  // Taxa de retorno anual com base no perfil do investidor (para fase de acumulação) - ATUALIZADA
  const getAccumulationAnnualReturn = () => {
    switch (investorProfile) {
      case 'conservador': return 0.04; // 4% a.a.
      case 'moderado': return 0.055; // 5.5% a.a. (ATUALIZADO)
      case 'arrojado': return 0.065; // 6.5% a.a. (ATUALIZADO)
      default: return 0.055;
    }
  };

  const accumulationYears = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const accumulationAnnualReturn = getAccumulationAnnualReturn();
  const retirementAnnualReturn = portfolioReturn / 100;

  // Cálculo do patrimônio acumulado na aposentadoria
  const calculateAccumulatedWealth = () => {
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
    const months = accumulationYears * 12;
    
    let balance = initialAmount;
    for (let i = 0; i < months; i++) {
      balance += monthlyAmount;
      balance *= (1 + monthlyReturn);
    }
    return balance;
  };

  // 1. Patrimônio necessário para gerar a renda desejada SEM dilapidar - CORRIGIDO
  const calculateRequiredWealthSustainable = () => {
    if (retirementIncome <= 0) return 0;
    // Fórmula: Patrimônio = (renda mensal * 12) / retorno anual
    // CORREÇÃO: Agora usa o portfolioReturn definido pelo usuário
    return (retirementIncome * 12) / (portfolioReturn / 100);
  };

  // 1b. Patrimônio mínimo para consumir até os 100 anos
  const calculateRequiredWealthDepleting = () => {
    if (retirementIncome <= 0) return 0;
    
    // Usando a fórmula de anuidade para calcular o patrimônio necessário
    const monthlyReturn = Math.pow(1 + retirementAnnualReturn, 1/12) - 1;
    const months = retirementYears * 12;
    
    if (monthlyReturn === 0) {
      return retirementIncome * months;
    }
    
    // Fórmula: PV = PMT * [(1 - (1 + r)^-n) / r]
    const presentValue = retirementIncome * ((1 - Math.pow(1 + monthlyReturn, -months)) / monthlyReturn);
    return presentValue;
  };

  // 2. Idade possível para se aposentar com a renda desejada
  const calculatePossibleRetirementAge = () => {
    if (retirementIncome <= 0) return retirementAge;
    
    const requiredWealth = calculateRequiredWealthDepleting();
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
    
    // Simulação para encontrar quantos anos são necessários
    let balance = initialAmount;
    let years = 0;
    const maxYears = 50; // Limite de segurança
    
    while (balance < requiredWealth && years < maxYears) {
      for (let month = 0; month < 12; month++) {
        balance += monthlyAmount;
        balance *= (1 + monthlyReturn);
      }
      years++;
    }
    
    return currentAge + years;
  };

  // 3. Renda que não dilapida o patrimônio (renda perpétua)
  const calculateSustainableIncome = () => {
    const accumulatedWealth = calculateAccumulatedWealth();
    // Renda que pode ser retirada indefinidamente usando apenas os rendimentos
    return accumulatedWealth * (portfolioReturn / 100) / 12;
  };

  // 4. Renda que esgota o patrimônio na expectativa de vida
  const calculateDepletingIncome = () => {
    const accumulatedWealth = calculateAccumulatedWealth();
    const monthlyReturn = Math.pow(1 + retirementAnnualReturn, 1/12) - 1;
    const months = retirementYears * 12;
    
    if (monthlyReturn === 0) {
      return accumulatedWealth / months;
    }
    
    // Fórmula: PMT = PV * [r / (1 - (1 + r)^-n)]
    const payment = accumulatedWealth * (monthlyReturn / (1 - Math.pow(1 + monthlyReturn, -months)));
    return payment;
  };

  // NOVO: 5. Sugestão de aporte mensal para atingir a renda desejada
  const calculateSuggestedMonthlyContribution = () => {
    if (retirementIncome <= 0) return 0;
    
    const requiredWealth = calculateRequiredWealthDepleting();
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
    const months = accumulationYears * 12;
    
    // Calcular crescimento do valor inicial
    const futureValueInitial = initialAmount * Math.pow(1 + monthlyReturn, months);
    
    // Valor que precisa ser acumulado através de aportes
    const remainingWealth = requiredWealth - futureValueInitial;
    
    if (remainingWealth <= 0) return 0;
    
    // Fórmula de anuidade para calcular PMT necessário
    if (monthlyReturn === 0) {
      return remainingWealth / months;
    }
    
    const suggestedPMT = remainingWealth * monthlyReturn / (Math.pow(1 + monthlyReturn, months) - 1);
    return Math.max(0, suggestedPMT);
  };

  // NOVO: 6. Rentabilidade mínima necessária durante acumulação
  const calculateMinimumAccumulationReturn = () => {
    if (retirementIncome <= 0) return accumulationAnnualReturn * 100;
    
    const requiredWealth = calculateRequiredWealthDepleting();
    const months = accumulationYears * 12;
    
    // Usando iteração para encontrar a taxa mínima necessária
    let minRate = 0.001; // 0.1% como ponto de partida
    let maxRate = 0.5; // 50% como limite superior
    const tolerance = 1; // R$ 1 de tolerância
    
    for (let iteration = 0; iteration < 100; iteration++) {
      const testRate = (minRate + maxRate) / 2;
      const monthlyReturn = Math.pow(1 + testRate, 1/12) - 1;
      
      // Simular acumulação com esta taxa
      let balance = initialAmount;
      for (let i = 0; i < months; i++) {
        balance += monthlyAmount;
        balance *= (1 + monthlyReturn);
      }
      
      if (Math.abs(balance - requiredWealth) < tolerance) {
        return testRate * 100;
      }
      
      if (balance < requiredWealth) {
        minRate = testRate;
      } else {
        maxRate = testRate;
      }
    }
    
    return ((minRate + maxRate) / 2) * 100;
  };

  // Cálculo do patrimônio necessário com descrição personalizada
  const getPatrimonioNecessarioInfo = () => {
    const sustentavel = calculateRequiredWealthSustainable();
    const minimo = calculateRequiredWealthDepleting();
    
    if (retirementIncome <= 0) {
      return {
        value: sustentavel,
        description: "Defina a renda desejada"
      };
    }
    
    return {
      value: sustentavel,
      description: `${formatCurrency(sustentavel)} (perpetuidade) | ${formatCurrency(minimo)} (até ${lifeExpectancy} anos)`
    };
  };

  const patrimonioInfo = getPatrimonioNecessarioInfo();

  const insights = [
    {
      title: "Patrimônio necessário",
      value: patrimonioInfo.value,
      description: patrimonioInfo.description,
      isCurrency: false,
      showValueAsDescription: true
    },
    {
      title: "Idade possível aposentadoria",
      value: calculatePossibleRetirementAge(),
      description: "Com a renda desejada",
      isCurrency: false,
      suffix: " anos"
    },
    {
      title: "Renda sustentável",
      value: calculateSustainableIncome(),
      description: "Preserva o patrimônio",
      isCurrency: true
    },
    {
      title: "Renda máxima",
      value: calculateDepletingIncome(),
      description: `Esgota aos ${lifeExpectancy} anos`,
      isCurrency: true
    },
    {
      title: "Sugestão aporte mensal",
      value: calculateSuggestedMonthlyContribution(),
      description: "Para atingir renda desejada",
      isCurrency: true
    },
    {
      title: "Rentabilidade mínima",
      value: calculateMinimumAccumulationReturn(),
      description: "Durante acumulação",
      isCurrency: false,
      suffix: "% a.a."
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="p-6 bg-white border-l-4 border-l-orange-500">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{insight.title}</h3>
              {!insight.showValueAsDescription && (
                <p className="text-2xl font-bold text-orange-600 mb-2">
                  {insight.isCurrency 
                    ? formatCurrency(insight.value) 
                    : Math.round(insight.value) + (insight.suffix || '')
                  }
                </p>
              )}
              <p className={`text-sm text-gray-600 ${insight.showValueAsDescription ? 'text-lg font-semibold text-orange-600' : ''}`}>
                {insight.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
