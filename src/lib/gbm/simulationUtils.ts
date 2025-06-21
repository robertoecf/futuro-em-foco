// Shared utilities for Monte Carlo simulations to reduce code duplication
import { generateNormalRandom } from './randomGenerators';

/**
 * Converts monthly accumulation path to yearly values
 */
export function convertToYearlyValues(
  accumulationPath: number[], 
  accumulationYears: number
): number[] {
  const yearlyValues: number[] = [];
  for (let year = 0; year <= accumulationYears; year++) {
    const monthIndex = year * 12;
    if (monthIndex < accumulationPath.length) {
      yearlyValues.push(accumulationPath[monthIndex]);
    }
  }
  return yearlyValues;
}

/**
 * Simulates retirement phase with withdrawals using GBM
 */
export function simulateRetirementPhase(
  retirementStartValue: number,
  totalYears: number,
  accumulationYears: number,
  volatility: number,
  retirementMonthlyIncome: number,
  monthlyIncomeRate: number,
  retirementAnnualReturn: number,
  yearlyValues: number[]
): void {
  const retirementYears = totalYears - accumulationYears;
  if (retirementYears <= 0) return;

  const retirementVolatility = volatility * 0.7;
  const monthlyIncome = retirementMonthlyIncome > 0 
    ? retirementMonthlyIncome 
    : retirementStartValue * monthlyIncomeRate;

  let balance = retirementStartValue;
  const dt = 1/12;
  const drift = (retirementAnnualReturn - 0.5 * retirementVolatility * retirementVolatility) * dt;
  const diff = retirementVolatility * Math.sqrt(dt);

  for (let year = accumulationYears + 1; year <= totalYears; year++) {
    for (let month = 1; month <= 12; month++) {
      balance -= monthlyIncome;

      if (balance > 0) {
        const Z = generateNormalRandom();
        const growthFactor = Math.exp(drift + diff * Z);
        balance *= growthFactor;
      }
    }

    yearlyValues.push(Math.max(0, balance));
  }
}

/**
 * Process a single simulation combining accumulation and retirement phases
 */
export function processSingleSimulation(
  accumulationPath: number[],
  accumulationYears: number,
  totalYears: number,
  volatility: number,
  retirementMonthlyIncome: number,
  monthlyIncomeRate: number,
  retirementAnnualReturn: number
): number[] {
  const retirementStartValue = accumulationPath[accumulationPath.length - 1];
  
  // Convert to yearly values
  const yearlyValues = convertToYearlyValues(accumulationPath, accumulationYears);
  
  // Add retirement phase
  simulateRetirementPhase(
    retirementStartValue,
    totalYears,
    accumulationYears,
    volatility,
    retirementMonthlyIncome,
    monthlyIncomeRate,
    retirementAnnualReturn,
    yearlyValues
  );
  
  return yearlyValues;
} 