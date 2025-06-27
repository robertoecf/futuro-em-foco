export const calculatePossibleRetirementAge = (
  data: number[],
  monthlyIncomeTarget: number,
  portfolioReturn: number,
  currentAge: number,
  accumulationYears: number
): number => {
  if (monthlyIncomeTarget <= 0) return currentAge + accumulationYears;

  // Required wealth to sustain the monthly income target
  const requiredWealth = (monthlyIncomeTarget * 12) / (portfolioReturn / 100);

  // Find the age where accumulated wealth reaches the required amount
  for (let i = 0; i < data.length; i++) {
    if (data[i] >= requiredWealth) {
      return currentAge + i;
    }
  }

  // If never reached, return the original retirement age
  return currentAge + accumulationYears;
};

export const calculatePerpetuityWealth = (
  monthlyIncomeTarget: number,
  portfolioReturn: number
): number => {
  return monthlyIncomeTarget > 0 && portfolioReturn > 0
    ? (monthlyIncomeTarget * 12) / (portfolioReturn / 100)
    : 0;
};

export const formatYAxis = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
