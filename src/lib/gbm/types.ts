export interface BrownianMonteCarloResult {
  scenarios: {
    pessimistic: number[]; // P5 or P25
    median: number[]; // P50
    optimistic: number[]; // P95 or P75
  };
  statistics: {
    percentile5: number[];
    percentile25: number[];
    percentile50: number[];
    percentile75: number[];
    percentile95: number[];
    successProbability: number;
    standardDeviation: number[];
    averageReturn?: number;
    volatilityRealized?: number;
  };
  // NEW: Store all individual simulation paths
  allPaths?: number[][];
}
