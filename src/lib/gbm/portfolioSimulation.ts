import { generateNormalRandom } from './randomGenerators';

// Enhanced GBM simulation for portfolio with monthly contributions
export function portfolioGBMSimulation(
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
