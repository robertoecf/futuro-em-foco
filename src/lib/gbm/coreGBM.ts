import { generateNormalRandom } from './randomGenerators';

// Core GBM simulation following the Python reference exactly
export function monteCarloGBM(
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
