
// Geometric Brownian Motion Monte Carlo Simulation
// Based on the formula: S(t+1) = S(t) * exp((μ - σ²/2) * dt + σ * sqrt(dt) * Z)

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

// Gerador Box-Muller para distribuição normal (melhorado)
function generateNormalRandom(): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Geometric Brownian Motion simulation for a single path
function simulateGBMPath(
  initialValue: number,
  driftRate: number,
  volatility: number,
  timeSteps: number,
  dt: number = 1/12 // Monthly timesteps
): number[] {
  const path = [initialValue];
  let currentValue = initialValue;
  
  for (let t = 1; t <= timeSteps; t++) {
    const randomShock = generateNormalRandom();
    const growthFactor = Math.exp(
      (driftRate - volatility * volatility / 2) * dt + 
      volatility * Math.sqrt(dt) * randomShock
    );
    
    currentValue *= growthFactor;
    path.push(currentValue);
  }
  
  return path;
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
  const dt = 1/12; // Monthly timesteps
  const totalMonths = totalYears * 12;
  const accumulationMonths = accumulationYears * 12;
  const allSimulations: number[][] = [];
  
  console.log('🎲 Starting Geometric Brownian Motion Monte Carlo simulation:', {
    simulationCount,
    expectedReturn,
    volatility,
    totalYears,
    accumulationYears
  });

  for (let sim = 0; sim < simulationCount; sim++) {
    const monthlyValues: number[] = [initialAmount];
    let balance = initialAmount;
    
    // Accumulation phase with GBM
    for (let month = 1; month <= accumulationMonths; month++) {
      // Add monthly contribution first
      balance += monthlyContribution;
      
      // Apply Geometric Brownian Motion
      const randomShock = generateNormalRandom();
      const monthlyGrowthFactor = Math.exp(
        (expectedReturn - volatility * volatility / 2) * dt + 
        volatility * Math.sqrt(dt) * randomShock
      );
      
      balance *= monthlyGrowthFactor;
      monthlyValues.push(Math.max(0, balance));
    }
    
    // Retirement phase - using GBM for retirement return as well
    const retirementVolatility = volatility * 0.7; // Reduced volatility in retirement
    const monthlyIncome = retirementMonthlyIncome > 0 ? 
      retirementMonthlyIncome : 
      balance * monthlyIncomeRate;
    
    for (let month = accumulationMonths + 1; month <= totalMonths; month++) {
      // Withdraw monthly income first
      balance -= monthlyIncome;
      
      // Apply GBM to remaining balance
      if (balance > 0) {
        const randomShock = generateNormalRandom();
        const monthlyGrowthFactor = Math.exp(
          (retirementAnnualReturn - retirementVolatility * retirementVolatility / 2) * dt + 
          retirementVolatility * Math.sqrt(dt) * randomShock
        );
        
        balance *= monthlyGrowthFactor;
      }
      
      monthlyValues.push(Math.max(0, balance));
    }
    
    // Convert monthly to yearly for compatibility
    const yearlyValues: number[] = [];
    for (let year = 0; year <= totalYears; year++) {
      const monthIndex = year * 12;
      if (monthIndex < monthlyValues.length) {
        yearlyValues.push(monthlyValues[monthIndex]);
      }
    }
    
    allSimulations.push(yearlyValues);
  }
  
  // Calculate percentiles and statistics
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
    volatilityRealized
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
  // ... same parameters as above
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
