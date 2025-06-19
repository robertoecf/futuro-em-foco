
// Calculate percentiles and statistics using the Python reference approach
export function calculateStatistics(
  allSimulations: number[][],
  totalYears: number,
  accumulationYears: number,
  simulationCount: number
) {
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
  
  return {
    percentile5,
    percentile25,
    percentile50,
    percentile75,
    percentile95,
    successProbability,
    standardDeviation,
    averageReturn,
    volatilityRealized
  };
}
