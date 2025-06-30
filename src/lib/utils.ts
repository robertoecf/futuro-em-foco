import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { profiles } from '@/lib/data/profileData';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Gerador Box-Muller para distribuição normal
function boxMullerRandom(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Interface para resultados Monte Carlo
export interface MonteCarloResult {
  scenarios: {
    pessimistic: number[]; // 25th percentile
    median: number[]; // 50th percentile
    optimistic: number[]; // 75th percentile
  };
  statistics: {
    percentile5: number[];
    percentile25: number[];
    percentile50: number[];
    percentile75: number[];
    percentile95: number[];
    successProbability: number; // Probability of reaching retirement goal
    standardDeviation: number[];
  };
  // Optional: Store all individual simulation paths
  allPaths?: number[][];
}

// Re-export GBM types for compatibility
export type { BrownianMonteCarloResult } from './brownianMotionUtils';
export { runBrownianMonteCarloSimulation, compareMonteCarloMethods } from './brownianMotionUtils';

// Volatilidade por perfil de investidor
export function getVolatilityByProfile(profile: string): number {
  const selectedProfile = profiles.find((p) => p.id === profile);

  // Retorna a volatilidade do perfil encontrado, convertida para decimal.
  // Se não encontrar, usa a do moderado como padrão.
  if (selectedProfile) {
    return selectedProfile.volatility / 100;
  }

  const moderateProfile = profiles.find((p) => p.id === 'moderado');
  return moderateProfile ? moderateProfile.volatility / 100 : 0.055;
}

// Simulação Monte Carlo
export function runMonteCarloSimulation(
  initialAmount: number,
  monthlyContribution: number,
  accumulationYears: number,
  totalYears: number,
  expectedReturn: number,
  volatility: number,
  monthlyIncomeRate: number = 0.004,
  retirementMonthlyIncome: number = 0,
  retirementAnnualReturn: number = 0.04,
  simulationCount: number = 100
): MonteCarloResult {
  const allSimulations: number[][] = [];

  for (let sim = 0; sim < simulationCount; sim++) {
    const yearlyValues: number[] = [initialAmount];
    let balance = initialAmount;

    // Accumulation phase with Monte Carlo
    for (let year = 1; year <= accumulationYears; year++) {
      // Generate random annual return
      const randomReturn = expectedReturn + boxMullerRandom() * volatility;
      const monthlyReturn = Math.pow(1 + randomReturn, 1 / 12) - 1;

      for (let month = 1; month <= 12; month++) {
        balance += monthlyContribution;
        balance *= 1 + monthlyReturn;
      }
      yearlyValues.push(Math.round(balance));
    }

    // Retirement phase - using fixed return for now
    const retirementMonthlyReturn = Math.pow(1 + retirementAnnualReturn, 1 / 12) - 1;
    const monthlyIncome =
      retirementMonthlyIncome > 0 ? retirementMonthlyIncome : balance * monthlyIncomeRate;

    for (let year = accumulationYears + 1; year <= totalYears; year++) {
      for (let month = 1; month <= 12; month++) {
        balance -= monthlyIncome;
        balance *= 1 + retirementMonthlyReturn;
      }
      yearlyValues.push(Math.max(0, Math.round(balance)));
    }

    allSimulations.push(yearlyValues);
  }

  // Calculate percentiles for each year
  const yearCount = totalYears + 1;
  const percentile5: number[] = [];
  const percentile25: number[] = [];
  const percentile50: number[] = [];
  const percentile75: number[] = [];
  const percentile95: number[] = [];
  const standardDeviation: number[] = [];

  for (let yearIndex = 0; yearIndex < yearCount; yearIndex++) {
    const yearValues = allSimulations.map((sim) => sim[yearIndex]).sort((a, b) => a - b);

    // Calculate percentiles with linear interpolation (like numpy default)
    const calculatePercentile = (arr: number[], p: number): number => {
      const n = arr.length;
      const index = (n - 1) * p;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;

      if (upper >= n) return arr[n - 1];
      if (lower < 0) return arr[0];

      return arr[lower] * (1 - weight) + arr[upper] * weight;
    };

    percentile5.push(calculatePercentile(yearValues, 0.05));
    percentile25.push(calculatePercentile(yearValues, 0.25));
    percentile50.push(calculatePercentile(yearValues, 0.5));
    percentile75.push(calculatePercentile(yearValues, 0.75));
    percentile95.push(calculatePercentile(yearValues, 0.95));

    // Calculate standard deviation for this year
    const mean = yearValues.reduce((sum, val) => sum + val, 0) / simulationCount;
    const variance =
      yearValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / simulationCount;
    standardDeviation.push(Math.sqrt(variance));
  }

  // Calculate success probability: scenarios with patrimônio > 0 at life expectancy
  const lifeExpectancyValues = allSimulations.map((sim) => sim[sim.length - 1] || 0);
  const successfulSimulations = lifeExpectancyValues.filter((val) => val > 0).length;
  const successProbability = successfulSimulations / simulationCount;

  return {
    scenarios: {
      pessimistic: percentile5, // P5: pior 5% dos cenários
      median: percentile50, // P50: mediana (cenário central)
      optimistic: percentile95, // P95: melhor 5% dos cenários
    },
    statistics: {
      percentile5,
      percentile25,
      percentile50,
      percentile75,
      percentile95,
      successProbability,
      standardDeviation,
    },
  };
}

export function calculateFutureValue(
  initialAmount: number,
  monthlyContribution: number,
  years: number,
  annualReturn: number
): number {
  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const months = years * 12;

  let futureValue = initialAmount;

  for (let i = 0; i < months; i++) {
    futureValue = (futureValue + monthlyContribution) * (1 + monthlyReturn);
  }

  return futureValue;
}

export function calculateFullProjection(
  initialAmount: number,
  monthlyContribution: number,
  accumulationYears: number,
  totalYears: number,
  accumulationAnnualReturn: number,
  monthlyIncomeRate: number = 0.004, // Default monthly income rate (0.4%)
  retirementMonthlyIncome: number = 0, // Fixed monthly retirement income
  retirementAnnualReturn: number = 0.04 // Default to 4% if not provided
): {
  yearlyValues: number[];
  retirementAmount: number;
  monthlyIncome: number;
} {
  // Monthly return rate for accumulation phase
  const accumulationMonthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1 / 12) - 1;

  // Monthly return rate for retirement phase - using user-defined portfolio return
  const retirementMonthlyReturn = Math.pow(1 + retirementAnnualReturn, 1 / 12) - 1;

  let balance = initialAmount;
  const yearlyValues: number[] = [initialAmount];

  // Accumulation phase - using selected investor profile return
  for (let year = 1; year <= accumulationYears; year++) {
    for (let month = 1; month <= 12; month++) {
      // Add monthly contribution and apply return
      balance += monthlyContribution;
      balance *= 1 + accumulationMonthlyReturn;
    }
    yearlyValues.push(Math.round(balance));
  }

  const retirementAmount = balance;
  // If no fixed retirement income is specified, calculate it based on balance
  const monthlyIncome =
    retirementMonthlyIncome > 0 ? retirementMonthlyIncome : balance * monthlyIncomeRate;

  // Retirement phase - drawing income using user-defined portfolio return
  for (let year = accumulationYears + 1; year <= totalYears; year++) {
    for (let month = 1; month <= 12; month++) {
      // Withdraw monthly income
      balance -= monthlyIncome;
      // Apply user-defined return to remaining balance
      balance *= 1 + retirementMonthlyReturn;
    }

    // Ensure we don't show negative values
    yearlyValues.push(Math.max(0, Math.round(balance)));
  }

  return {
    yearlyValues,
    retirementAmount,
    monthlyIncome,
  };
}
