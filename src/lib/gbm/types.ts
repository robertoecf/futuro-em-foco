export interface BrownianMonteCarloResult {
  scenarios: {
    pessimistic: number[]; // 25th percentile
    median: number[]; // 50th percentile
    optimistic: number[]; // 75th percentile
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
