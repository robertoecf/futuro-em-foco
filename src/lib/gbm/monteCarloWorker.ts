// Monte Carlo simulation worker for parallel processing
import { portfolioGBMSimulation } from './portfolioSimulation';
import { generateNormalRandom } from './randomGenerators';
// import { calculateStatistics } from './statistics';

interface WorkerMessage {
  type: 'START_SIMULATION';
  params: {
    initialAmount: number;
    monthlyContribution: number;
    accumulationYears: number;
    totalYears: number;
    expectedReturn: number;
    volatility: number;
    monthlyIncomeRate: number;
    retirementMonthlyIncome: number;
    retirementAnnualReturn: number;
    simulationCount: number;
    batchIndex: number;
    batchSize: number;
  };
}

interface WorkerResponse {
  type: 'BATCH_COMPLETE';
  batchIndex: number;
  simulations: number[][];
}

// Worker message handler
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, params } = event.data;
  
  if (type === 'START_SIMULATION') {
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
      batchSize,
      batchIndex
    } = params;
    
    const batchSimulations: number[][] = [];
    
    // Generate accumulation phase simulations
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
      
      // Convert to yearly values
      const yearlyValues: number[] = [];
      for (let year = 0; year <= accumulationYears; year++) {
        const monthIndex = year * 12;
        if (monthIndex < accumulationPath.length) {
          yearlyValues.push(accumulationPath[monthIndex]);
        }
      }
      
      // Retirement phase
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
      
      batchSimulations.push(yearlyValues);
    }
    
    // Send results back
    const response: WorkerResponse = {
      type: 'BATCH_COMPLETE',
      batchIndex,
      simulations: batchSimulations
    };
    
    self.postMessage(response);
  }
};

export {}; 