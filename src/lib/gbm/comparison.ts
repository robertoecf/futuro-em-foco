
import { runBrownianMonteCarloSimulation } from './mainSimulation';
import { logger } from '../logger';

// Utility function to compare simple vs GBM Monte Carlo
export function compareMonteCarloMethods(
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
) {
  logger.log('🔬 Comparing Monte Carlo methods...');
  
  const gbmResults = runBrownianMonteCarloSimulation(
    initialAmount, monthlyContribution, accumulationYears, totalYears,
    expectedReturn, volatility, monthlyIncomeRate, retirementMonthlyIncome,
    retirementAnnualReturn, simulationCount
  );
  
  return {
    gbm: gbmResults,
    comparison: {
      gbmSuccessRate: gbmResults.statistics.successProbability,
      gbmAverageReturn: gbmResults.statistics.averageReturn,
      gbmVolatilityRealized: gbmResults.statistics.volatilityRealized
    }
  };
}
