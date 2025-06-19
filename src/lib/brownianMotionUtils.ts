
// Re-export all GBM functionality from the modular structure
export type { BrownianMonteCarloResult } from './gbm';
export {
  generateNormalRandom,
  monteCarloGBM,
  portfolioGBMSimulation,
  calculateStatistics,
  runBrownianMonteCarloSimulation,
  compareMonteCarloMethods
} from './gbm';
