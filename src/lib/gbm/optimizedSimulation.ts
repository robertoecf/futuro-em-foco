
import { portfolioGBMSimulation } from './portfolioSimulation';
import { calculateStatistics } from './statistics';
import { logger } from '../logger';
import { processSingleSimulation } from './simulationUtils';
import type { BrownianMonteCarloResult } from './types';

// Optimized Monte Carlo with reduced simulation count and performance improvements
export async function runOptimizedMonteCarloSimulation(
  initialAmount: number,
  monthlyContribution: number,
  accumulationYears: number,
  totalYears: number,
  expectedReturn: number,
  volatility: number,
  monthlyIncomeRate: number = 0.004,
  retirementMonthlyIncome: number = 0,
  retirementAnnualReturn: number = 0.04,
  simulationCount: number = 50 // Reduced from 100 to 50
): Promise<BrownianMonteCarloResult> {
  const startTime = performance.now();
  
  logger.log('🚀 Starting Optimized Monte Carlo simulation:', {
    simulationCount,
    expectedReturn,
    volatility,
    totalYears,
    accumulationYears
  });

  // Use smaller batch sizes for better performance
  const batchSize = 10;
  const batches = Math.ceil(simulationCount / batchSize);
  const allSimulations: number[][] = [];
  
  for (let batch = 0; batch < batches; batch++) {
    const currentBatchSize = Math.min(batchSize, simulationCount - batch * batchSize);
    
    // Generate accumulation phase simulations using portfolio GBM
    const accumulationPaths = portfolioGBMSimulation(
      initialAmount,
      monthlyContribution,
      expectedReturn,
      volatility,
      accumulationYears,
      currentBatchSize
    );
    
    // Process each simulation in this batch using shared utility
    for (let sim = 0; sim < currentBatchSize; sim++) {
      const accumulationPath = accumulationPaths[sim];
      
      const yearlyValues = processSingleSimulation(
        accumulationPath,
        accumulationYears,
        totalYears,
        volatility,
        retirementMonthlyIncome,
        monthlyIncomeRate,
        retirementAnnualReturn
      );
      
      allSimulations.push(yearlyValues);
    }
    
    // Yield control to prevent blocking UI
    if (batch < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  const statistics = calculateStatistics(allSimulations, totalYears, simulationCount);
  
  const endTime = performance.now();
  logger.log(`✅ Optimized Monte Carlo completed in ${endTime - startTime}ms:`, {
    successProbability: statistics.successProbability,
    averageReturn: statistics.averageReturn,
    volatilityRealized: statistics.volatilityRealized
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
