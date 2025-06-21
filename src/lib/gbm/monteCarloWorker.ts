// Monte Carlo simulation worker for parallel processing
import { portfolioGBMSimulation } from './portfolioSimulation';
import { processSingleSimulation } from './simulationUtils';
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
    
    // Process each simulation using shared utility
    for (let sim = 0; sim < batchSize; sim++) {
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