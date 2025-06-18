
import { generateNormalRandom } from './randomGenerators';
import { portfolioGBMSimulation } from './portfolioSimulation';
import { calculateStatistics } from './statistics';
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
  
  console.log('🚀 Starting Optimized Monte Carlo simulation:', {
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
    
    // Process each simulation in this batch
    for (let sim = 0; sim < currentBatchSize; sim++) {
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
      
      // Retirement phase using optimized GBM with withdrawals
      const retirementYears = totalYears - accumulationYears;
      if (retirementYears > 0) {
        const retirementVolatility = volatility * 0.7;
        const monthlyIncome = retirementMonthlyIncome > 0 ? 
          retirementMonthlyIncome : 
          retirementStartValue * monthlyIncomeRate;
        
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
      
      allSimulations.push(yearlyValues);
    }
    
    // Yield control to prevent blocking UI
    if (batch < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  const statistics = calculateStatistics(allSimulations, totalYears, accumulationYears, simulationCount);
  
  const endTime = performance.now();
  console.log(`✅ Optimized Monte Carlo completed in ${endTime - startTime}ms:`, {
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
