import { calculateStatistics } from './statistics';
import { logger } from '../logger';
import type { BrownianMonteCarloResult } from './types';

// Create worker from inline code
const createWorker = () => {
  const workerCode = `
    ${self.crypto ? '' : 'var crypto = { getRandomValues: function(arr) { for(var i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; } };'}
    
    // Fast normal random generator
    function generateNormalRandom() {
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    
    // Portfolio GBM simulation
    function portfolioGBMSimulation(initialAmount, monthlyContribution, expectedReturn, volatility, years, numSimulations) {
      const months = years * 12;
      const dt = 1/12;
      const drift = (expectedReturn - 0.5 * volatility * volatility) * dt;
      const diffusion = volatility * Math.sqrt(dt);
      const simulations = [];
      
      for (let sim = 0; sim < numSimulations; sim++) {
        const path = new Float32Array(months + 1);
        path[0] = initialAmount;
        
        for (let month = 1; month <= months; month++) {
          const previousValue = path[month - 1] + monthlyContribution;
          const Z = generateNormalRandom();
          const growthFactor = Math.exp(drift + diffusion * Z);
          path[month] = previousValue * growthFactor;
        }
        
        simulations.push(path);
      }
      
      return simulations;
    }
    
    self.onmessage = function(e) {
      const { params, batchIndex } = e.data;
      const {
        initialAmount,
        monthlyContribution,
        accumulationYears,
        totalYears,
        expectedReturn,
        volatility,
        monthlyIncomeRate,
        retirementMonthlyIncome,
        retirementAnnualReturn,
        batchSize
      } = params;
      
      const batchSimulations = [];
      
      // Generate accumulation paths
      const accumulationPaths = portfolioGBMSimulation(
        initialAmount,
        monthlyContribution,
        expectedReturn,
        volatility,
        accumulationYears,
        batchSize
      );
      
      // Process each simulation
      for (let sim = 0; sim < batchSize; sim++) {
        const accumulationPath = accumulationPaths[sim];
        const retirementStartValue = accumulationPath[accumulationPath.length - 1];
        
        // Convert to yearly values with Float32Array for memory efficiency
        const yearlyValues = new Float32Array(totalYears + 1);
        
        // Accumulation phase yearly values
        for (let year = 0; year <= accumulationYears; year++) {
          const monthIndex = year * 12;
          yearlyValues[year] = monthIndex < accumulationPath.length ? accumulationPath[monthIndex] : 0;
        }
        
        // Retirement phase
        const retirementYears = totalYears - accumulationYears;
        if (retirementYears > 0) {
          // Calculate retirement volatility based on return:
          // ≤4% a.a. → 1% volatility (default)
          // >4% a.a. → +2 bps volatility per 1 bps return above 4%
          const baseVolatility = 0.01; // 1% base volatility
          const baseReturn = 0.04; // 4% base return
          const retirementVolatility = retirementAnnualReturn <= baseReturn 
            ? baseVolatility 
            : baseVolatility + ((retirementAnnualReturn - baseReturn) * 2);
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
                balance *= Math.exp(drift + diff * Z);
              }
            }
            
            yearlyValues[year] = Math.max(0, balance);
          }
        }
        
        batchSimulations.push(Array.from(yearlyValues));
      }
      
      self.postMessage({
        batchIndex,
        simulations: batchSimulations
      });
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  return new Worker(workerUrl);
};

// Ultra-optimized Monte Carlo simulation for 1001 paths
export async function runUltraOptimizedMonteCarloSimulation(
  initialAmount: number,
  monthlyContribution: number,
  accumulationYears: number,
  totalYears: number,
  expectedReturn: number,
  volatility: number,
  monthlyIncomeRate: number = 0.004,
  retirementMonthlyIncome: number = 0,
  retirementAnnualReturn: number = 0.04,
  simulationCount: number = 1001
): Promise<BrownianMonteCarloResult> {
  const startTime = performance.now();

  logger.log('🚀 Starting Ultra-Optimized Monte Carlo simulation:', {
    simulationCount,
    expectedReturn,
    volatility,
    totalYears,
    accumulationYears,
  });

  // Determine number of workers based on CPU cores
  const numWorkers = Math.min(navigator.hardwareConcurrency || 4, 8);
  const batchSize = Math.ceil(simulationCount / numWorkers);

  // Create workers
  const workers = Array.from({ length: numWorkers }, () => createWorker());
  const results: number[][][] = new Array(numWorkers);

  // Create promises for each worker
  const workerPromises = workers.map((worker, index) => {
    return new Promise<void>((resolve) => {
      const actualBatchSize =
        index === numWorkers - 1 ? simulationCount - index * batchSize : batchSize;

      worker.onmessage = (e) => {
        results[e.data.batchIndex] = e.data.simulations;
        worker.terminate();
        resolve();
      };

      worker.postMessage({
        params: {
          initialAmount,
          monthlyContribution,
          accumulationYears,
          totalYears,
          expectedReturn,
          volatility,
          monthlyIncomeRate,
          retirementMonthlyIncome,
          retirementAnnualReturn,
          batchSize: actualBatchSize,
        },
        batchIndex: index,
      });
    });
  });

  // Wait for all workers to complete
  await Promise.all(workerPromises);

  // Combine results
  const allSimulations = results.flat();

  // Calculate statistics
  const statistics = calculateStatistics(allSimulations, totalYears, simulationCount);

  const endTime = performance.now();
  logger.log(`✅ Ultra-Optimized Monte Carlo completed in ${endTime - startTime}ms:`, {
    successProbability: statistics.successProbability,
    averageReturn: statistics.averageReturn,
    volatilityRealized: statistics.volatilityRealized,
    workersUsed: numWorkers,
  });

  return {
    scenarios: {
      pessimistic: statistics.percentile5, // P5: pior 5% dos cenários
      median: statistics.percentile50, // P50: mediana (cenário central)
      optimistic: statistics.percentile95, // P95: melhor 5% dos cenários
    },
    statistics,
  };
}
