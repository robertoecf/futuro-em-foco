import { calculateStatistics } from './statistics';
import { logger } from '../logger';
import type { BrownianMonteCarloResult } from './types';

// Enhanced worker creation with better resource management
const createWorker = (): Worker => {
  const workerCode = `
    ${self.crypto ? '' : 'var crypto = { getRandomValues: function(arr) { for(var i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; } };'}
    
    // Optimized normal random generator using Box-Muller transform
    let spare = null;
    let hasSpare = false;
    
    function generateNormalRandom() {
      if (hasSpare) {
        hasSpare = false;
        return spare;
      }
      
      hasSpare = true;
      const u1 = Math.random();
      const u2 = Math.random();
      const mag = Math.sqrt(-2 * Math.log(u1));
      spare = mag * Math.sin(2 * Math.PI * u2);
      return mag * Math.cos(2 * Math.PI * u2);
    }
    
    // Ultra-optimized portfolio GBM simulation with pre-calculated constants
    function portfolioGBMSimulation(initialAmount, monthlyContribution, expectedReturn, volatility, years, numSimulations) {
      const months = years * 12;
      const dt = 1/12;
      const drift = (expectedReturn - 0.5 * volatility * volatility) * dt;
      const diffusion = volatility * Math.sqrt(dt);
      const simulations = [];
      
      // Pre-allocate arrays for better memory management
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
    
    // Worker message handler with error handling
    self.onmessage = function(e) {
      try {
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
        
        // Generate accumulation paths with optimized memory usage
        const accumulationPaths = portfolioGBMSimulation(
          initialAmount,
          monthlyContribution,
          expectedReturn,
          volatility,
          accumulationYears,
          batchSize
        );
        
        // Pre-calculate retirement phase constants
        const retirementYears = totalYears - accumulationYears;
        const retirementVolatility = volatility * 0.7;
        const dt = 1/12;
        const retirementDrift = (retirementAnnualReturn - 0.5 * retirementVolatility * retirementVolatility) * dt;
        const retirementDiff = retirementVolatility * Math.sqrt(dt);
        
        // Process each simulation with optimized loops
        for (let sim = 0; sim < batchSize; sim++) {
          const accumulationPath = accumulationPaths[sim];
          const retirementStartValue = accumulationPath[accumulationPath.length - 1];
          
          // Use Float32Array for memory efficiency
          const yearlyValues = new Float32Array(totalYears + 1);
          
          // Accumulation phase yearly values (vectorized)
          for (let year = 0; year <= accumulationYears; year++) {
            const monthIndex = year * 12;
            yearlyValues[year] = monthIndex < accumulationPath.length ? accumulationPath[monthIndex] : 0;
          }
          
          // Retirement phase with pre-calculated constants
          if (retirementYears > 0) {
            const monthlyIncome = retirementMonthlyIncome > 0 ? 
              retirementMonthlyIncome : 
              retirementStartValue * monthlyIncomeRate;
            
            let balance = retirementStartValue;
            
            for (let year = accumulationYears + 1; year <= totalYears; year++) {
              // Process 12 months at once with optimized inner loop
              for (let month = 1; month <= 12; month++) {
                balance -= monthlyIncome;
                
                if (balance > 0) {
                  const Z = generateNormalRandom();
                  balance *= Math.exp(retirementDrift + retirementDiff * Z);
                } else {
                  balance = 0;
                  break; // Early exit if balance depleted
                }
              }
              
              yearlyValues[year] = balance;
              
              // Early exit optimization if balance is zero for remaining years
              if (balance === 0 && year < totalYears) {
                for (let remainingYear = year + 1; year <= totalYears; remainingYear++) {
                  yearlyValues[remainingYear] = 0;
                }
                break;
              }
            }
          }
          
          batchSimulations.push(Array.from(yearlyValues));
        }
        
        // Send results with success status
        self.postMessage({
          batchIndex,
          simulations: batchSimulations,
          success: true
        });
        
      } catch (error) {
        // Enhanced error handling
        self.postMessage({
          batchIndex: e.data.batchIndex,
          error: error.message || 'Unknown worker error',
          success: false
        });
      }
    };
    
    // Handle worker termination
    self.onerror = function(error) {
      self.postMessage({
        error: 'Worker error: ' + error.message,
        success: false
      });
    };
  `;
  
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl);
  
  // Clean up URL after worker creation
  worker.addEventListener('message', () => {
    URL.revokeObjectURL(workerUrl);
  }, { once: true });
  
  return worker;
};

// Enhanced ultra-optimized Monte Carlo simulation with better resource management
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
    availableCores: navigator.hardwareConcurrency || 'unknown'
  });

  // Optimized worker count based on simulation size and CPU cores
  const maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 8);
  const minSimulationsPerWorker = 50; // Minimum batch size for efficiency
  const optimalWorkerCount = Math.min(
    maxWorkers,
    Math.max(1, Math.floor(simulationCount / minSimulationsPerWorker))
  );
  
  const batchSize = Math.ceil(simulationCount / optimalWorkerCount);
  
  logger.log(`📊 Using ${optimalWorkerCount} workers with batch size ${batchSize}`);

  // Create workers with enhanced resource management
  const workers: Worker[] = [];
  const results: number[][][] = new Array(optimalWorkerCount);
  const workerPromises: Promise<void>[] = [];
  
  try {
    // Create worker promises with enhanced error handling
    for (let i = 0; i < optimalWorkerCount; i++) {
      const worker = createWorker();
      workers.push(worker);
      
      const promise = new Promise<void>((resolve, reject) => {
        const actualBatchSize = i === optimalWorkerCount - 1 
          ? simulationCount - (i * batchSize)
          : batchSize;
        
        // Enhanced message handler with timeout
        const timeout = setTimeout(() => {
          reject(new Error(`Worker ${i} timeout after 30 seconds`));
        }, 30000);
        
        worker.onmessage = (e) => {
          clearTimeout(timeout);
          
          if (e.data.success) {
            results[e.data.batchIndex] = e.data.simulations;
            resolve();
          } else {
            reject(new Error(`Worker ${i} error: ${e.data.error}`));
          }
        };
        
        worker.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error(`Worker ${i} failed: ${error.message}`));
        };
        
        // Send work to worker
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
            batchSize: actualBatchSize
          },
          batchIndex: i
        });
      });
      
      workerPromises.push(promise);
    }
    
    // Wait for all workers to complete with enhanced error handling
    await Promise.all(workerPromises);
    
    // Combine results efficiently
    const allSimulations = results.flat();
    
    // Validate results
    if (allSimulations.length !== simulationCount) {
      throw new Error(`Simulation count mismatch: expected ${simulationCount}, got ${allSimulations.length}`);
    }
    
    // Calculate statistics
    const statistics = calculateStatistics(allSimulations, totalYears, accumulationYears, simulationCount);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    logger.log(`✅ Ultra-Optimized Monte Carlo completed in ${executionTime.toFixed(2)}ms:`, {
      successProbability: statistics.successProbability,
      averageReturn: statistics.averageReturn,
      volatilityRealized: statistics.volatilityRealized,
      workersUsed: optimalWorkerCount,
      simulationsPerSecond: Math.round(simulationCount / (executionTime / 1000)),
      performance: {
        executionTime: `${executionTime.toFixed(2)}ms`,
        throughput: `${Math.round(simulationCount / (executionTime / 1000))} sims/sec`
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
    
  } catch (error) {
    logger.error('❌ Monte Carlo simulation failed:', error);
    throw error;
  } finally {
    // Clean up all workers
    workers.forEach(worker => {
      try {
        worker.terminate();
      } catch (e) {
        logger.error('Worker cleanup warning:', e);
      }
    });
  }
} 