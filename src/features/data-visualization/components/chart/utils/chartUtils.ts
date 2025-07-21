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
  // Check if mobile (screen width < 640px)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  if (value === 0) return 'R$ 0';

  const absValue = Math.abs(value);

  if (isMobile) {
    // Mobile: Ultra compact format
    if (absValue >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(0)}t`;
    } else if (absValue >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(0)}b`;
    } else if (absValue >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)}mm`;
    } else if (absValue >= 1_000) {
      return `${(value / 1_000).toFixed(0)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
  } else {
    // Desktop: More readable format
    if (absValue >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(0)} trilhão`;
    } else if (absValue >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(0)} bilhão`;
    } else if (absValue >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)} milhão`;
    } else if (absValue >= 100_000) {
      return `${(value / 1_000).toFixed(0)} mil`;
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
};
