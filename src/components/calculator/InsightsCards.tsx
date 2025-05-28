
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
  // Taxa de retorno anual com base no perfil do investidor (para fase de acumulação)
  const getAccumulationAnnualReturn = () => {
    switch (investorProfile) {
      case 'conservador': return 0.04;
      case 'moderado': return 0.05;
      case 'arrojado': return 0.06;
      default: return 0.05;
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

  // 1. Patrimônio necessário para gerar a renda desejada
  const calculateRequiredWealth = () => {
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
    
    const requiredWealth = calculateRequiredWealth();
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

  const insights = [
    {
      title: "Patrimônio necessário",
      value: calculateRequiredWealth(),
      description: `Para gerar R$ ${formatCurrency(retirementIncome)} mensais`,
      isCurrency: true
    },
    {
      title: "Idade possível para aposentadoria",
      value: calculatePossibleRetirementAge(),
      description: "Com a renda desejada",
      isCurrency: false,
      suffix: " anos"
    },
    {
      title: "Renda sustentável",
      value: calculateSustainableIncome(),
      description: "Que preserva o patrimônio",
      isCurrency: true
    },
    {
      title: "Renda máxima",
      value: calculateDepletingIncome(),
      description: "Que esgota o patrimônio aos " + lifeExpectancy + " anos",
      isCurrency: true
    }
  ];

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="p-6 bg-white border-l-4 border-l-orange-500">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{insight.title}</h3>
              <p className="text-2xl font-bold text-orange-600 mb-2">
                {insight.isCurrency 
                  ? formatCurrency(insight.value) 
                  : Math.round(insight.value) + (insight.suffix || '')
                }
              </p>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
