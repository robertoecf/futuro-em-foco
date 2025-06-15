
// Geometric Brownian Motion Monte Carlo Simulation
// Based on the Python reference: S[t] = S[t-1] * exp(drift + diff * Z[t])
// Where: drift = (μ - σ²/2) * dt, diff = σ * sqrt(dt)

export interface BrownianMonteCarloResult {
  scenarios: {
    pessimistic: number[]; // 25th percentile
    median: number[];      // 50th percentile
    optimistic: number[];  // 75th percentile
  };
  statistics: {
    percentile5: number[];
    percentile25: number[];
    percentile50: number[];
    percentile75: number[];
    percentile95: number[];
    successProbability: number;
    standardDeviation: number[];
    averageReturn: number;
    volatilityRealized: number;
  };
}

// Gerador Box-Muller para distribuição normal
function generateNormalRandom(): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Core GBM simulation following the Python reference exactly
function monteCarloGBM(
  S0: number,
  mu: number,
  sigma: number,
  T: number,
  steps: number = 252,
  sims: number = 100
): number[] {
  const dt = T / steps;
  const drift = (mu - 0.5 * sigma * sigma) * dt;
  const diff = sigma * Math.sqrt(dt);
  
  const finalValues: number[] = [];
  
  for (let sim = 0; sim < sims; sim++) {
    let S = S0;
    
    for (let t = 1; t <= steps; t++) {
      const Z = generateNormalRandom();
      S = S * Math.exp(drift + diff * Z);
    }
    
    finalValues.push(S);
  }
  
  return finalValues;
}

// Enhanced GBM simulation for portfolio with monthly contributions
function portfolioGBMSimulation(
  initialAmount: number,
  monthlyContribution: number,
  mu: number,
  sigma: number,
  years: number,
  sims: number = 100
): number[][] {
  const monthsPerYear = 12;
  const totalMonths = years * monthsPerYear;
  const dt = 1 / monthsPerYear; // Monthly timesteps
  const drift = (mu - 0.5 * sigma * sigma) * dt;
  const diff = sigma * Math.sqrt(dt);
  
  const allPaths: number[][] = [];
  
  for (let sim = 0; sim < sims; sim++) {
    const path: number[] = [initialAmount];
    let balance = initialAmount;
    
    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution first
      balance += monthlyContribution;
      
      // Apply GBM growth
      const Z = generateNormalRandom();
      const growthFactor = Math.exp(drift + diff * Z);
      balance *= growthFactor;
      
      path.push(Math.max(0, balance));
    }
    
    allPaths.push(path);
  }
  
  return allPaths;
}

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
  
  console.log('🎲 Starting Geometric Brownian Motion Monte Carlo simulation:', {
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
  const yearCount = totalYears + 1;
  const percentile5: number[] = [];
  const percentile25: number[] = [];
  const percentile50: number[] = [];
  const percentile75: number[] = [];
  const percentile95: number[] = [];
  const standardDeviation: number[] = [];
  
  for (let yearIndex = 0; yearIndex < yearCount; yearIndex++) {
    const yearValues = allSimulations
      .map(sim => sim[yearIndex])
      .filter(val => val !== undefined)
      .sort((a, b) => a - b);
    
    if (yearValues.length > 0) {
      // Calculate percentiles exactly like numpy.percentile
      percentile5.push(yearValues[Math.floor(yearValues.length * 0.05)]);
      percentile25.push(yearValues[Math.floor(yearValues.length * 0.25)]);
      percentile50.push(yearValues[Math.floor(yearValues.length * 0.50)]);
      percentile75.push(yearValues[Math.floor(yearValues.length * 0.75)]);
      percentile95.push(yearValues[Math.floor(yearValues.length * 0.95)]);
      
      // Calculate standard deviation for this year
      const mean = yearValues.reduce((sum, val) => sum + val, 0) / yearValues.length;
      const variance = yearValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / yearValues.length;
      standardDeviation.push(Math.sqrt(variance));
    }
  }
  
  // Calculate success probability and realized statistics
  const retirementValues = allSimulations.map(sim => sim[accumulationYears] || 0);
  const successfulSimulations = retirementValues.filter(val => val > 0).length;
  const successProbability = successfulSimulations / simulationCount;
  
  // Calculate average realized return and volatility
  const finalValues = allSimulations.map(sim => sim[sim.length - 1] || 0);
  const averageReturn = finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length;
  const finalVariance = finalValues.reduce((sum, val) => sum + Math.pow(val - averageReturn, 2), 0) / finalValues.length;
  const volatilityRealized = Math.sqrt(finalVariance) / averageReturn;
  
  console.log('✅ GBM Monte Carlo simulation completed:', {
    successProbability,
    averageReturn,
    volatilityRealized,
    percentiles: {
      p5: percentile5[accumulationYears],
      p50: percentile50[accumulationYears],
      p95: percentile95[accumulationYears]
    }
  });
  
  return {
    scenarios: {
      pessimistic: percentile25,
      median: percentile50,
      optimistic: percentile75
    },
    statistics: {
      percentile5,
      percentile25,
      percentile50,
      percentile75,
      percentile95,
      successProbability,
      standardDeviation,
      averageReturn,
      volatilityRealized
    }
  };
}

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
  console.log('🔬 Comparing Monte Carlo methods...');
  
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
