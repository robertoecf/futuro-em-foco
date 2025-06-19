
import { generateNormalRandom } from './randomGenerators';
import { portfolioGBMSimulation } from './portfolioSimulation';
import { calculateStatistics } from './statistics';
import type { BrownianMonteCarloResult } from './types';
import { logger } from '../logger';

// Main Geometric Brownian Motion Monte Carlo simulation
export function runBrownianMonteCarloSimulation(
  initialAmount: number,
  monthlyContribution: number,
  accumulationYears: number,
  totalYears: number,
  expectedReturn: number, // μ (drift rate)
  volatility: number, // σ (volatility)
  monthlyIncomeRate: number = 0.004,
  retirementMonthlyIncome: number = 0,
  retirementAnnualReturn: number = 0.04,
  simulationCount: number = 100
): BrownianMonteCarloResult {
  const allSimulations: number[][] = [];
  
  logger.log('🎲 Starting Geometric Brownian Motion Monte Carlo simulation:', {
    simulationCount,
    expectedReturn,
    volatility,
    totalYears,
    accumulationYears
  });

  // Generate accumulation phase simulations using portfolio GBM
  const accumulationPaths = portfolioGBMSimulation(
    initialAmount,
    monthlyContribution,
    expectedReturn,
    volatility,
    accumulationYears,
    simulationCount
  );
  
  // Process each simulation
  for (let sim = 0; sim < simulationCount; sim++) {
    const accumulationPath = accumulationPaths[sim];
    const retirementStartValue = accumulationPath[accumulationPath.length - 1];
    
    // Convert monthly path to yearly for accumulation phase
    const yearlyValues: number[] = [];
    for (let year = 0; year <= accumulationYears; year++) {
      const monthIndex = year * 12;
      if (monthIndex < accumulationPath.length) {
        yearlyValues.push(accumulationPath[monthIndex]);
      }
    }
    
    // Retirement phase using GBM with withdrawals
    const retirementYears = totalYears - accumulationYears;
    if (retirementYears > 0) {
      const retirementVolatility = volatility * 0.7; // Reduced volatility in retirement
      const monthlyIncome = retirementMonthlyIncome > 0 ? 
        retirementMonthlyIncome : 
        retirementStartValue * monthlyIncomeRate;
      
      let balance = retirementStartValue;
      const dt = 1/12; // Monthly timesteps
      const drift = (retirementAnnualReturn - 0.5 * retirementVolatility * retirementVolatility) * dt;
      const diff = retirementVolatility * Math.sqrt(dt);
      
      for (let year = accumulationYears + 1; year <= totalYears; year++) {
        // Process 12 months for this year
        for (let month = 1; month <= 12; month++) {
          // Withdraw monthly income first
          balance -= monthlyIncome;
          
          // Apply GBM to remaining balance
          if (balance > 0) {
            const Z = generateNormalRandom();
            const growthFactor = Math.exp(drift + diff * Z);
            balance *= growthFactor;
          }
        }
        
        yearlyValues.push(Math.max(0, balance));
      }
    }
    
    allSimulations.push(yearlyValues);
  }
  
  // Calculate percentiles and statistics using the Python reference approach
  const statistics = calculateStatistics(allSimulations, totalYears, accumulationYears, simulationCount);
  
  logger.log('✅ GBM Monte Carlo simulation completed:', {
    successProbability: statistics.successProbability,
    averageReturn: statistics.averageReturn,
    volatilityRealized: statistics.volatilityRealized,
    percentiles: {
      p5: statistics.percentile5[accumulationYears],
      p50: statistics.percentile50[accumulationYears],
      p95: statistics.percentile95[accumulationYears]
    }
  });
  
  return {
    scenarios: {
      pessimistic: statistics.percentile25,
      median: statistics.percentile50,
      optimistic: statistics.percentile75
    },
    statistics
  };
}
