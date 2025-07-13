/**
 * Monte Carlo Simulation Service
 * 
 * Domain service responsible for running Monte Carlo simulations for
 * financial planning scenarios with risk analysis and probabilistic outcomes.
 * 
 * This service encapsulates the complex Monte Carlo simulation logic,
 * making it testable, reusable, and maintainable across different contexts.
 */

import type { InvestorProfile } from '@/types/core/calculator';
import type { BrownianMonteCarloResult } from '@/lib/gbm/types';
import { Money } from '@/domain/value-objects/Money';
import { getAccumulationAnnualReturn, getVolatilityByProfile } from '@/lib/calculations/financialCalculations';
import { runUltraOptimizedMonteCarloSimulationWithParams } from '@/lib/gbm/ultraOptimizedSimulation';
import { runBrownianMonteCarloSimulation } from '@/lib/gbm/mainSimulation';
import { runOptimizedMonteCarloSimulation } from '@/lib/gbm/optimizedSimulation';

export interface IMonteCarloSimulationService {
  runPortfolioSimulation(params: PortfolioSimulationParams): Promise<PortfolioSimulationResult>;
  runRetirementSimulation(params: RetirementSimulationParams): Promise<RetirementSimulationResult>;
  runRiskAnalysis(params: RiskAnalysisParams): Promise<RiskAnalysisResult>;
  runComparisonSimulation(params: ComparisonSimulationParams): Promise<ComparisonSimulationResult>;
}

// Input Types
export interface PortfolioSimulationParams {
  initialAmount: Money;
  monthlyContribution: Money;
  investorProfile: InvestorProfile;
  timeHorizonYears: number;
  numberOfSimulations?: number;
  targetAmount?: Money;
  includeAllPaths?: boolean;
  retirementMonthlyIncome?: Money;
  retirementAnnualReturn?: number;
}

export interface RetirementSimulationParams {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  initialAmount: Money;
  monthlyContribution: Money;
  desiredRetirementIncome: Money;
  investorProfile: InvestorProfile;
  numberOfSimulations?: number;
}

export interface RiskAnalysisParams {
  portfolios: {
    profile: InvestorProfile;
    allocation: number; // percentage
  }[];
  initialAmount: Money;
  monthlyContribution: Money;
  timeHorizonYears: number;
  numberOfSimulations?: number;
}

export interface ComparisonSimulationParams {
  scenarios: {
    name: string;
    initialAmount: Money;
    monthlyContribution: Money;
    investorProfile: InvestorProfile;
  }[];
  timeHorizonYears: number;
  numberOfSimulations?: number;
}

// Result Types
export interface PortfolioSimulationResult {
  scenarios: {
    pessimistic: Money[]; // P5 or P25
    median: Money[]; // P50
    optimistic: Money[]; // P95 or P75
  };
  statistics: {
    percentile5: Money[];
    percentile25: Money[];
    percentile50: Money[];
    percentile75: Money[];
    percentile95: Money[];
    successProbability: number; // probability of reaching target
    standardDeviation: Money[];
    averageReturn: number;
    volatilityRealized: number;
    finalAmountRange: {
      min: Money;
      max: Money;
      median: Money;
    };
  };
  metadata: {
    simulationsRun: number;
    timeHorizonYears: number;
    investorProfile: InvestorProfile;
    targetAmount?: Money;
  };
  allPaths?: Money[][]; // All simulation paths if requested
}

export interface RetirementSimulationResult {
  accumulationPhase: PortfolioSimulationResult;
  withdrawalPhase: {
    sustainabilityProbability: number; // probability money lasts through retirement
    medianYearsOfIncome: number;
    incomeRange: {
      pessimistic: Money;
      median: Money;
      optimistic: Money;
    };
  };
  overallViability: {
    successProbability: number;
    recommendedAdjustments: string[];
  };
}

export interface RiskAnalysisResult {
  portfolioComparison: {
    profile: InvestorProfile;
    riskMetrics: {
      sharpeRatio: number;
      maxDrawdown: number;
      volatility: number;
      expectedReturn: number;
    };
    scenarios: {
      pessimistic: Money;
      median: Money;
      optimistic: Money;
    };
  }[];
  optimalAllocation: {
    profile: InvestorProfile;
    reasoning: string;
  };
}

export interface ComparisonSimulationResult {
  scenarios: {
    name: string;
    result: PortfolioSimulationResult;
    ranking: number;
  }[];
  recommendation: {
    bestScenario: string;
    reasoning: string;
  };
}

/**
 * Monte Carlo Simulation Service Implementation
 */
export class MonteCarloSimulationService implements IMonteCarloSimulationService {
  
  /**
   * Run portfolio simulation with Monte Carlo analysis
   */
  async runPortfolioSimulation(params: PortfolioSimulationParams): Promise<PortfolioSimulationResult> {
    const {
      initialAmount,
      monthlyContribution,
      investorProfile,
      timeHorizonYears,
      numberOfSimulations = 10000,
      targetAmount,
      includeAllPaths = false
    } = params;

    // Helper function to safely convert numbers to Money objects
    const safeMoneyFromNumber = (amount: number, currency: string = 'BRL'): Money => {
      // Handle NaN values first
      if (isNaN(amount)) {
        return Money.fromNumber(0, currency);
      }
      
      try {
        return Money.fromNumber(amount, currency);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('Amount cannot be negative')) {
            return Money.fromNumber(0, currency);
          }
          if (error.message.includes('Amount is too large')) {
            // For now, cap at maximum safe value
            const maxSafeAmount = Number.MAX_SAFE_INTEGER / 10;
            return Money.fromNumber(maxSafeAmount, currency);
          }
        }
        throw error;
      }
    };
    
    const annualReturn = getAccumulationAnnualReturn(investorProfile);
    const volatility = getVolatilityByProfile(investorProfile);
    
    // Run ultra-optimized simulation for better performance
    const rawResult: BrownianMonteCarloResult = await runUltraOptimizedMonteCarloSimulationWithParams({
      initialAmount: initialAmount.value,
      monthlyContribution: monthlyContribution.value,
      yearsToRetirement: timeHorizonYears,
      annualReturn,
      volatility,
      inflationRate: 0.04,
      numberOfSimulations,
      targetAmount: targetAmount?.value,
      includeAllPaths,
      retirementMonthlyIncome: params.retirementMonthlyIncome?.value || 0,
      retirementAnnualReturn: params.retirementAnnualReturn || 0.04
    });
    
    const currency = initialAmount.currencyCode;
    
    // Convert raw results to Money objects
    const scenarios = {
      pessimistic: rawResult.scenarios.pessimistic.map(v => safeMoneyFromNumber(v, currency)),
      median: rawResult.scenarios.median.map(v => safeMoneyFromNumber(v, currency)),
      optimistic: rawResult.scenarios.optimistic.map(v => safeMoneyFromNumber(v, currency))
    };
    
    const statistics = {
      percentile5: rawResult.statistics.percentile5.map(v => safeMoneyFromNumber(v, currency)),
      percentile25: rawResult.statistics.percentile25.map(v => safeMoneyFromNumber(v, currency)),
      percentile50: rawResult.statistics.percentile50.map(v => safeMoneyFromNumber(v, currency)),
      percentile75: rawResult.statistics.percentile75.map(v => safeMoneyFromNumber(v, currency)),
      percentile95: rawResult.statistics.percentile95.map(v => safeMoneyFromNumber(v, currency)),
      successProbability: rawResult.statistics.successProbability,
      standardDeviation: rawResult.statistics.standardDeviation.map(v => safeMoneyFromNumber(v, currency)),
      averageReturn: rawResult.statistics.averageReturn || annualReturn,
      volatilityRealized: rawResult.statistics.volatilityRealized || volatility,
      finalAmountRange: {
        min: safeMoneyFromNumber(Math.min(...rawResult.statistics.percentile5), currency),
        max: safeMoneyFromNumber(Math.max(...rawResult.statistics.percentile95), currency),
        median: safeMoneyFromNumber(rawResult.statistics.percentile50[rawResult.statistics.percentile50.length - 1], currency)
      }
    };
    
    const metadata = {
      simulationsRun: numberOfSimulations,
      timeHorizonYears,
      investorProfile,
      targetAmount
    };
    
    // Convert all paths if requested
    let allPaths: Money[][] | undefined;
    if (includeAllPaths && rawResult.allPaths) {
      allPaths = rawResult.allPaths.map(path => 
        path.map(value => Money.fromNumber(value, currency))
      );
    }
    
    return {
      scenarios,
      statistics,
      metadata,
      allPaths
    };
  }
  
  /**
   * Run comprehensive retirement simulation
   */
  async runRetirementSimulation(params: RetirementSimulationParams): Promise<RetirementSimulationResult> {
    const {
      currentAge,
      retirementAge,
      lifeExpectancy,
      initialAmount,
      monthlyContribution,
      desiredRetirementIncome,
      investorProfile,
      numberOfSimulations = 10000
    } = params;
    
    const accumulationYears = retirementAge - currentAge;
    const retirementYears = lifeExpectancy - retirementAge;
    
    // Run accumulation phase simulation
    const accumulationPhase = await this.runPortfolioSimulation({
      initialAmount,
      monthlyContribution,
      investorProfile,
      timeHorizonYears: accumulationYears,
      numberOfSimulations,
      includeAllPaths: false
    });
    
    // Analyze withdrawal phase sustainability
    const retirementReturn = 0.04; // Conservative withdrawal rate
    const monthlyWithdrawal = desiredRetirementIncome;
    const annualWithdrawal = monthlyWithdrawal.multiply(12);
    
    // Calculate withdrawal sustainability using median accumulated wealth
    const medianFinalWealth = accumulationPhase.statistics.finalAmountRange.median;
    const totalRetirementNeeds = annualWithdrawal.multiply(retirementYears);
    
    // Simple sustainability calculation (can be enhanced with full Monte Carlo)
    const sustainabilityProbability = medianFinalWealth.greaterThan(totalRetirementNeeds) ? 0.75 : 0.25;
    const medianYearsOfIncome = Math.min(
      retirementYears,
      medianFinalWealth.divide(annualWithdrawal.value).value
    );
    
    // Calculate income range based on wealth distribution
    const incomeRange = {
      pessimistic: accumulationPhase.statistics.percentile25[accumulationPhase.statistics.percentile25.length - 1]
        .multiply(retirementReturn).divide(12),
      median: medianFinalWealth.multiply(retirementReturn).divide(12),
      optimistic: accumulationPhase.statistics.percentile75[accumulationPhase.statistics.percentile75.length - 1]
        .multiply(retirementReturn).divide(12)
    };
    
    const withdrawalPhase = {
      sustainabilityProbability,
      medianYearsOfIncome,
      incomeRange
    };
    
    // Overall viability assessment
    const successProbability = sustainabilityProbability * accumulationPhase.statistics.successProbability;
    const recommendedAdjustments: string[] = [];
    
    if (successProbability < 0.7) {
      recommendedAdjustments.push('Considere aumentar o aporte mensal');
      recommendedAdjustments.push('Avalie adiar a aposentadoria em alguns anos');
      recommendedAdjustments.push('Considere reduzir a renda desejada na aposentadoria');
    }
    
    if (accumulationPhase.statistics.volatilityRealized > 0.2) {
      recommendedAdjustments.push('Considere um perfil de investimento mais conservador');
    }
    
    const overallViability = {
      successProbability,
      recommendedAdjustments
    };
    
    return {
      accumulationPhase,
      withdrawalPhase,
      overallViability
    };
  }
  
  /**
   * Run risk analysis comparing different portfolio allocations
   */
  async runRiskAnalysis(params: RiskAnalysisParams): Promise<RiskAnalysisResult> {
    const {
      portfolios,
      initialAmount,
      monthlyContribution,
      timeHorizonYears,
      numberOfSimulations = 5000
    } = params;
    
    const portfolioComparison: RiskAnalysisResult['portfolioComparison'] = [];
    
    // Run simulation for each portfolio
    for (const portfolio of portfolios) {
      const adjustedContribution = monthlyContribution.multiply(portfolio.allocation / 100);
      const adjustedInitial = initialAmount.multiply(portfolio.allocation / 100);
      
      const result = await this.runPortfolioSimulation({
        initialAmount: adjustedInitial,
        monthlyContribution: adjustedContribution,
        investorProfile: portfolio.profile,
        timeHorizonYears,
        numberOfSimulations
      });
      
      // Calculate risk metrics
      const finalValues = result.statistics.percentile50;
      const returns = finalValues.map((value, i) => 
        i === 0 ? 0 : (value.value - finalValues[i-1].value) / finalValues[i-1].value
      );
      
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);
      
      // Simplified Sharpe ratio calculation (using risk-free rate of 0.05)
      const sharpeRatio = volatility > 0 ? (avgReturn - 0.05) / volatility : 0;
      
      // Max drawdown calculation (simplified)
      let maxDrawdown = 0;
      let peak = finalValues[0].value;
      for (const value of finalValues) {
        if (value.value > peak) peak = value.value;
        const drawdown = (peak - value.value) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }
      
      portfolioComparison.push({
        profile: portfolio.profile,
        riskMetrics: {
          sharpeRatio,
          maxDrawdown,
          volatility,
          expectedReturn: avgReturn
        },
        scenarios: {
          pessimistic: result.statistics.finalAmountRange.min,
          median: result.statistics.finalAmountRange.median,
          optimistic: result.statistics.finalAmountRange.max
        }
      });
    }
    
    // Determine optimal allocation based on Sharpe ratio
    const bestPortfolio = portfolioComparison.reduce((best, current) => 
      current.riskMetrics.sharpeRatio > best.riskMetrics.sharpeRatio ? current : best
    );
    
    const optimalAllocation = {
      profile: bestPortfolio.profile,
      reasoning: `Perfil ${bestPortfolio.profile} apresenta o melhor índice de Sharpe (${bestPortfolio.riskMetrics.sharpeRatio.toFixed(2)}), indicando melhor retorno ajustado ao risco.`
    };
    
    return {
      portfolioComparison,
      optimalAllocation
    };
  }
  
  /**
   * Run comparison simulation between different scenarios
   */
  async runComparisonSimulation(params: ComparisonSimulationParams): Promise<ComparisonSimulationResult> {
    const { scenarios, timeHorizonYears, numberOfSimulations = 5000 } = params;
    
    const results: ComparisonSimulationResult['scenarios'] = [];
    
    // Run simulation for each scenario
    for (const scenario of scenarios) {
      const result = await this.runPortfolioSimulation({
        initialAmount: scenario.initialAmount,
        monthlyContribution: scenario.monthlyContribution,
        investorProfile: scenario.investorProfile,
        timeHorizonYears,
        numberOfSimulations
      });
      
      results.push({
        name: scenario.name,
        result,
        ranking: 0 // Will be set after all simulations
      });
    }
    
    // Rank scenarios by median final amount
    results.sort((a, b) => 
      b.result.statistics.finalAmountRange.median.value - 
      a.result.statistics.finalAmountRange.median.value
    );
    
    // Assign rankings
    results.forEach((scenario, index) => {
      scenario.ranking = index + 1;
    });
    
    const bestScenario = results[0];
    const recommendation = {
      bestScenario: bestScenario.name,
      reasoning: `Cenário "${bestScenario.name}" apresenta o melhor resultado mediano de ${bestScenario.result.statistics.finalAmountRange.median.format()} com probabilidade de sucesso de ${(bestScenario.result.statistics.successProbability * 100).toFixed(1)}%.`
    };
    
    return {
      scenarios: results,
      recommendation
    };
  }
}

// Export singleton instance
export const monteCarloSimulationService = new MonteCarloSimulationService();