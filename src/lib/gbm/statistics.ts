
// Calculate percentiles and statistics using the Python reference approach
export function calculateStatistics(
  allSimulations: number[][],
  totalYears: number,
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
      // Calculate percentiles with linear interpolation (like numpy default)
      const calculatePercentile = (arr: number[], p: number): number => {
        const n = arr.length;
        const index = (n - 1) * p;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        
        if (upper >= n) return arr[n - 1];
        if (lower < 0) return arr[0];
        
        return arr[lower] * (1 - weight) + arr[upper] * weight;
      };
      
      percentile5.push(calculatePercentile(yearValues, 0.05));
      percentile25.push(calculatePercentile(yearValues, 0.25));
      percentile50.push(calculatePercentile(yearValues, 0.50));
      percentile75.push(calculatePercentile(yearValues, 0.75));
      percentile95.push(calculatePercentile(yearValues, 0.95));
      
      // Calculate standard deviation for this year
      const mean = yearValues.reduce((sum, val) => sum + val, 0) / yearValues.length;
      const variance = yearValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / yearValues.length;
      standardDeviation.push(Math.sqrt(variance));
    }
  }
  
  // Calculate success probability: scenarios with patrimônio > 0 at life expectancy
  const lifeExpectancyValues = allSimulations.map(sim => sim[sim.length - 1] || 0);
  const successfulSimulations = lifeExpectancyValues.filter(val => val > 0).length;
  const successProbability = successfulSimulations / simulationCount;
  
  // Calculate average realized return and volatility
  const finalValues = lifeExpectancyValues;
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
