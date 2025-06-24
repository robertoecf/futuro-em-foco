import { formatCurrency } from '@/lib/utils';
import type { InvestorProfile } from '../types';
import {
  getAccumulationAnnualReturn,
  calculateAccumulatedWealth,
  calculateRequiredWealthSustainable,
  calculateRequiredWealthDepleting,
  calculateSustainableIncome,
  calculateDepletingIncome,
  calculateSuggestedMonthlyContribution,
  calculateMinimumAccumulationReturn
} from './insightsCalculations';

interface UseInsightsDataProps {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  retirementIncome: number;
  portfolioReturn: number;
  investorProfile: InvestorProfile;
  possibleRetirementAge: number;
}

export const useInsightsData = ({
  initialAmount,
  monthlyAmount,
  currentAge,
  retirementAge,
  lifeExpectancy,
  retirementIncome,
  portfolioReturn,
  investorProfile,
  possibleRetirementAge: _possibleRetirementAge
}: UseInsightsDataProps) => {
  const accumulationYears = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;
  const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
  const retirementAnnualReturn = portfolioReturn / 100;

  const calculateCorrectPossibleRetirementAge = () => {
    if (retirementIncome <= 0) return retirementAge;
    
    const requiredWealth = (retirementIncome * 12) / (portfolioReturn / 100);
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
    
    let balance = initialAmount;
    let years = 0;
    const maxYears = 50;
    
    while (balance < requiredWealth && years < maxYears) {
      for (let month = 0; month < 12; month++) {
        balance += monthlyAmount;
        balance *= (1 + monthlyReturn);
      }
      years++;
    }
    
    return currentAge + years;
  };

  const correctPossibleRetirementAge = calculateCorrectPossibleRetirementAge();

  const accumulatedWealth = calculateAccumulatedWealth(
    initialAmount,
    monthlyAmount,
    accumulationYears,
    accumulationAnnualReturn
  );

  const getPatrimonioNecessarioInfo = () => {
    const sustentavel = calculateRequiredWealthSustainable(retirementIncome, portfolioReturn);
    const minimo = calculateRequiredWealthDepleting(retirementIncome, retirementYears, retirementAnnualReturn);
    
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
      value: correctPossibleRetirementAge,
      description: "Com a renda desejada",
      isCurrency: false,
      suffix: " anos"
    },
    {
      title: "Renda sustentável",
      value: calculateSustainableIncome(accumulatedWealth, portfolioReturn),
      description: "Preserva o patrimônio",
      isCurrency: true
    },
    {
      title: "Renda máxima",
      value: calculateDepletingIncome(accumulatedWealth, retirementYears, retirementAnnualReturn),
      description: `Esgota aos ${lifeExpectancy} anos`,
      isCurrency: true
    },
    {
      title: "Sugestão aporte mensal",
      value: calculateSuggestedMonthlyContribution(
        retirementIncome,
        retirementYears,
        retirementAnnualReturn,
        initialAmount,
        accumulationYears,
        accumulationAnnualReturn
      ),
      description: "Para atingir renda desejada",
      isCurrency: true
    },
    {
      title: "Rentabilidade mínima",
      value: calculateMinimumAccumulationReturn(
        retirementIncome,
        retirementYears,
        retirementAnnualReturn,
        monthlyAmount,
        initialAmount,
        accumulationYears
      ),
      description: "Durante acumulação",
      isCurrency: false,
      suffix: "% a.a."
    }
  ];

  return insights;
};
