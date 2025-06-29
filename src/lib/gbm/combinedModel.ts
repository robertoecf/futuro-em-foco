import { logger } from '../logger';
import { calculateStatistics } from './statistics';
import type { BrownianMonteCarloResult } from './types';

// Gerador de ruído Laplace (caudas mais gordas)
function generateLaplaceRandom(scale: number = 1): number {
  // Método da transformada inversa para distribuição Laplace
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

// Gerador de Poisson para saltos
function generatePoissonJumps(lambda: number): number {
  // Algoritmo de Knuth para Poisson
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  
  return k - 1;
}

/**
 * Simulação Monte Carlo Combinada: GBM + Laplace + Poisson
 * Conforme especificado em FINANCIAL_MODELING.md seção 3.5
 * 
 * - GBM: Movimento base do mercado
 * - Laplace: Caudas mais gordas (eventos extremos mais frequentes)
 * - Poisson: Saltos súbitos (crises/booms)
 */
export async function runCombinedMonteCarloSimulation(
  initialAmount: number,
  monthlyContribution: number,
  accumulationYears: number,
  totalYears: number,
  expectedReturn: number,
  volatility: number,
  monthlyIncomeRate: number = 0.004,
  retirementMonthlyIncome: number = 0,
  retirementAnnualReturn: number = 0.04,
  simulationCount: number = 1001,
  // Parâmetros dos modelos adicionais
  crisisFrequency: number = 0.1, // λ: frequência anual de crises (default: 1 a cada 10 anos)
  crisisMeanImpact: number = -0.15, // μ_J: impacto médio de uma crise (-15%)
  crisisVolatility: number = 0.1 // σ_J: volatilidade do impacto da crise
): Promise<BrownianMonteCarloResult> {
  const startTime = performance.now();
  
  logger.log('🚀 Starting Combined Monte Carlo (GBM + Laplace + Poisson):', {
    simulationCount,
    expectedReturn,
    volatility,
    crisisFrequency,
    crisisMeanImpact,
  });

  const allSimulations: number[][] = [];
  const monthsPerYear = 12;
  const dt = 1 / monthsPerYear;
  
  // Ajustar escala Laplace para manter mesma variância que Normal
  // Var(Laplace) = 2b², Var(Normal) = σ²
  // Para mesma variância: b = σ/√2
  const laplaceScale = volatility / Math.sqrt(2);
  
  // Ajustar drift para compensar saltos esperados
  // E[J] = λ * (exp(μ_J + σ_J²/2) - 1)
  const expectedJumpImpact = crisisFrequency * (Math.exp(crisisMeanImpact + crisisVolatility * crisisVolatility / 2) - 1);
  const adjustedDrift = expectedReturn - expectedJumpImpact;

  for (let sim = 0; sim < simulationCount; sim++) {
    const yearlyValues: number[] = [initialAmount];
    let balance = initialAmount;

    // Fase de acumulação com modelo combinado
    for (let year = 1; year <= accumulationYears; year++) {
      for (let month = 1; month <= monthsPerYear; month++) {
        // Adicionar contribuição mensal
        balance += monthlyContribution;
        
        // 1. Componente GBM com ruído Laplace (caudas gordas)
        const drift = (adjustedDrift - 0.5 * volatility * volatility) * dt;
        const Z_laplace = generateLaplaceRandom(1); // Normalizado
        const diffusion = laplaceScale * Math.sqrt(dt) * Z_laplace;
        
        // 2. Componente de salto Poisson (crises/booms)
        const numJumps = generatePoissonJumps(crisisFrequency * dt);
        let jumpImpact = 0;
        
        if (numJumps > 0) {
          // Cada salto tem impacto log-normal
          for (let j = 0; j < numJumps; j++) {
            const jumpMagnitude = crisisMeanImpact + crisisVolatility * generateLaplaceRandom(1);
            jumpImpact += Math.exp(jumpMagnitude) - 1;
          }
        }
        
        // Aplicar crescimento combinado
        balance *= Math.exp(drift + diffusion) * (1 + jumpImpact);
        balance = Math.max(0, balance);
      }
      
      yearlyValues.push(balance);
    }

    // Fase de aposentadoria - modelo mais conservador
    const retirementYears = totalYears - accumulationYears;
    if (retirementYears > 0) {
      // Na aposentadoria: volatilidade reduzida, menos crises
      const retirementVolatility = retirementAnnualReturn <= 0.04 
        ? 0.01 
        : 0.01 + ((retirementAnnualReturn - 0.04) * 2);
      
      const retirementLaplaceScale = retirementVolatility / Math.sqrt(2);
      const retirementCrisisFrequency = crisisFrequency * 0.5; // Metade da frequência
      
      const monthlyIncome = retirementMonthlyIncome > 0 
        ? retirementMonthlyIncome 
        : balance * monthlyIncomeRate;

      for (let year = accumulationYears + 1; year <= totalYears; year++) {
        for (let month = 1; month <= monthsPerYear; month++) {
          // Retirar renda mensal
          balance -= monthlyIncome;
          
          if (balance > 0) {
            // Modelo combinado mais conservador
            const retDrift = (retirementAnnualReturn - 0.5 * retirementVolatility * retirementVolatility) * dt;
            const Z_laplace = generateLaplaceRandom(1);
            const diffusion = retirementLaplaceScale * Math.sqrt(dt) * Z_laplace;
            
            // Saltos menos frequentes e menores
            const numJumps = generatePoissonJumps(retirementCrisisFrequency * dt);
            let jumpImpact = 0;
            
            if (numJumps > 0) {
              for (let j = 0; j < numJumps; j++) {
                const jumpMagnitude = crisisMeanImpact * 0.5 + crisisVolatility * 0.5 * generateLaplaceRandom(1);
                jumpImpact += Math.exp(jumpMagnitude) - 1;
              }
            }
            
            balance *= Math.exp(retDrift + diffusion) * (1 + jumpImpact);
          }
        }
        
        yearlyValues.push(Math.max(0, balance));
      }
    }

    allSimulations.push(yearlyValues);
    
    // Yield control periodicamente
    if (sim % 100 === 0 && sim > 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Calcular estatísticas
  const statistics = calculateStatistics(allSimulations, totalYears, simulationCount);

  const endTime = performance.now();
  logger.log(`✅ Combined Monte Carlo completed in ${endTime - startTime}ms:`, {
    successProbability: statistics.successProbability,
    percentiles: {
      p5: statistics.percentile5[accumulationYears],
      p50: statistics.percentile50[accumulationYears],
      p95: statistics.percentile95[accumulationYears],
    },
    tailEvents: 'Laplace distribution provides fatter tails',
    jumpEvents: 'Poisson jumps model crisis events',
    totalPaths: allSimulations.length,
    pathLength: allSimulations[0]?.length || 0,
  });

  return {
    scenarios: {
      pessimistic: statistics.percentile5,
      median: statistics.percentile50,
      optimistic: statistics.percentile95,
    },
    statistics,
    allPaths: allSimulations, // Return all 1001 calculated paths
  };
} 