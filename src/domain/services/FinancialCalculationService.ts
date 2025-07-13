/**
 * Financial Calculation Service
 * 
 * Domain service responsible for all financial calculations including
 * compound interest, retirement planning, and investment projections.
 * 
 * This service encapsulates business logic extracted from React components,
 * making calculations testable, reusable, and maintainable.
 */

import type { InvestorProfile } from '@/types/core/calculator';
import { Money } from '@/domain/value-objects/Money';
import { 
  calculateCompoundInterest,
  calculateInflationAdjustedValue,
  calculateSustainableMonthlylncome,
  getAccumulationAnnualReturn,
  getVolatilityByProfile,
  calculateTimeToGoal,
  calculateRequiredMonthlyContribution,
  calculateYearlyProjection,
  validateFinancialInputs,
  calculateAccumulatedWealth,
  calculateRequiredWealthDepleting,
  calculatePossibleRetirementAge,
  calculateSustainableIncome,
  calculateDepletingIncome,
  calculateSuggestedMonthlyContribution,
  calculateMinimumAccumulationReturn
} from '@/lib/calculations/financialCalculations';

export interface IFinancialCalculationService {
  calculateCompoundGrowth(params: CompoundGrowthParams): CompoundGrowthResult;
  calculateRetirementPlanning(params: RetirementPlanningParams): RetirementPlanningResult;
  calculateInvestmentProjection(params: InvestmentProjectionParams): InvestmentProjectionResult;
  validateInputs(params: ValidationParams): ValidationResult;
  calculateOptimalContribution(params: OptimalContributionParams): OptimalContributionResult;
}

// Input Types
export interface CompoundGrowthParams {
  initialAmount: Money;
  monthlyContribution: Money;
  annualReturnRate: number;
  timeHorizonYears: number;
  inflationRate?: number;
}

export interface RetirementPlanningParams {
  currentAge: number;
  targetRetirementAge: number;
  lifeExpectancy: number;
  desiredMonthlyIncome: Money;
  initialAmount: Money;
  monthlyContribution: Money;
  investorProfile: InvestorProfile;
}

export interface InvestmentProjectionParams {
  initialAmount: Money;
  monthlyContribution: Money;
  investorProfile: InvestorProfile;
  timeHorizonYears: number;
  includeInflation?: boolean;
  inflationRate?: number;
}

export interface ValidationParams {
  initialAmount: number;
  monthlyContribution: number;
  timeHorizonYears: number;
  annualReturnRate: number;
}

export interface OptimalContributionParams {
  targetAmount: Money;
  currentAmount: Money;
  timeHorizonYears: number;
  investorProfile: InvestorProfile;
}

// Result Types
export interface CompoundGrowthResult {
  finalAmount: Money;
  totalContributions: Money;
  totalGrowth: Money;
  effectiveAnnualReturn: number;
  yearlyProjection: Money[];
}

export interface RetirementPlanningResult {
  requiredWealthAtRetirement: Money;
  projectedWealthAtRetirement: Money;
  sustainableMonthlyIncome: Money;
  isRetirementViable: boolean;
  retirementGap: Money;
  recommendedRetirementAge: number;
  yearsToAccumulate: number;
}

export interface InvestmentProjectionResult {
  finalAmount: Money;
  totalContributions: Money;
  totalGrowth: Money;
  yearlyProjection: Money[];
  inflationAdjustedFinalAmount?: Money;
  annualReturnRate: number;
  volatility: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OptimalContributionResult {
  requiredMonthlyContribution: Money;
  timeToGoal: number;
  isTargetAchievable: boolean;
  alternativeScenarios: {
    timeHorizon: number;
    monthlyContribution: Money;
  }[];
}

/**
 * Financial Calculation Service Implementation
 */
export class FinancialCalculationService implements IFinancialCalculationService {
  
  /**
   * Calculate compound growth with monthly contributions
   */
  calculateCompoundGrowth(params: CompoundGrowthParams): CompoundGrowthResult {
    const { initialAmount, monthlyContribution, annualReturnRate, timeHorizonYears, inflationRate = 0.04 } = params;
    
    // Calculate final amount using compound interest
    const finalAmountValue = calculateCompoundInterest(
      initialAmount.value,
      monthlyContribution.value,
      annualReturnRate,
      timeHorizonYears
    );
    
    const finalAmount = Money.fromNumber(finalAmountValue, initialAmount.currencyCode);
    const totalContributions = monthlyContribution.multiply(12 * timeHorizonYears);
    const totalGrowth = finalAmount.subtract(initialAmount).subtract(totalContributions);
    
    // Calculate yearly projection
    const yearlyValues = calculateYearlyProjection(
      initialAmount.value,
      monthlyContribution.value,
      annualReturnRate,
      timeHorizonYears
    );
    
    const yearlyProjection = yearlyValues.map(value => 
      Money.fromNumber(value, initialAmount.currencyCode)
    );
    
    return {
      finalAmount,
      totalContributions,
      totalGrowth,
      effectiveAnnualReturn: annualReturnRate,
      yearlyProjection
    };
  }
  
  /**
   * Calculate comprehensive retirement planning metrics
   */
  calculateRetirementPlanning(params: RetirementPlanningParams): RetirementPlanningResult {
    const {
      currentAge,
      targetRetirementAge,
      lifeExpectancy,
      desiredMonthlyIncome,
      initialAmount,
      monthlyContribution,
      investorProfile
    } = params;
    
    const yearsToAccumulate = targetRetirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - targetRetirementAge;
    const accumulationReturn = getAccumulationAnnualReturn(investorProfile);
    const retirementReturn = 0.04; // Conservative 4% withdrawal rate
    
    // Calculate projected wealth at retirement
    const projectedWealthValue = calculateAccumulatedWealth(
      initialAmount.value,
      monthlyContribution.value,
      yearsToAccumulate,
      accumulationReturn
    );
    
    const projectedWealthAtRetirement = Money.fromNumber(projectedWealthValue, initialAmount.currencyCode);
    
    // Calculate required wealth for desired income
    const requiredWealthValue = calculateRequiredWealthDepleting(
      desiredMonthlyIncome.value,
      yearsInRetirement,
      retirementReturn
    );
    
    const requiredWealthAtRetirement = Money.fromNumber(requiredWealthValue, initialAmount.currencyCode);
    
    // Calculate sustainable monthly income from projected wealth
    const sustainableIncomeValue = calculateDepletingIncome(
      projectedWealthValue,
      yearsInRetirement,
      retirementReturn
    );
    
    const sustainableMonthlyIncome = Money.fromNumber(sustainableIncomeValue, initialAmount.currencyCode);
    
    // Determine if retirement is viable
    const isRetirementViable = projectedWealthAtRetirement.greaterThanOrEqual(requiredWealthAtRetirement);
    
    // Calculate retirement gap (positive means surplus, negative means deficit)
    const retirementGap = projectedWealthAtRetirement.subtract(requiredWealthAtRetirement);
    
    // Calculate recommended retirement age if current plan doesn't work
    const recommendedRetirementAge = calculatePossibleRetirementAge(
      currentAge,
      desiredMonthlyIncome.value,
      yearsInRetirement,
      retirementReturn,
      initialAmount.value,
      monthlyContribution.value,
      accumulationReturn
    );
    
    return {
      requiredWealthAtRetirement,
      projectedWealthAtRetirement,
      sustainableMonthlyIncome,
      isRetirementViable,
      retirementGap,
      recommendedRetirementAge,
      yearsToAccumulate
    };
  }
  
  /**
   * Calculate investment projection with profile-based returns
   */
  calculateInvestmentProjection(params: InvestmentProjectionParams): InvestmentProjectionResult {
    const { 
      initialAmount, 
      monthlyContribution, 
      investorProfile, 
      timeHorizonYears,
      includeInflation = false,
      inflationRate = 0.04
    } = params;
    
    const annualReturnRate = getAccumulationAnnualReturn(investorProfile);
    const volatility = getVolatilityByProfile(investorProfile);
    
    // Calculate final amount
    const finalAmountValue = calculateCompoundInterest(
      initialAmount.value,
      monthlyContribution.value,
      annualReturnRate,
      timeHorizonYears
    );
    
    const finalAmount = Money.fromNumber(finalAmountValue, initialAmount.currencyCode);
    const totalContributions = monthlyContribution.multiply(12 * timeHorizonYears);
    const totalGrowth = finalAmount.subtract(initialAmount).subtract(totalContributions);
    
    // Calculate yearly projection
    const yearlyValues = calculateYearlyProjection(
      initialAmount.value,
      monthlyContribution.value,
      annualReturnRate,
      timeHorizonYears
    );
    
    const yearlyProjection = yearlyValues.map(value => 
      Money.fromNumber(value, initialAmount.currencyCode)
    );
    
    // Calculate inflation-adjusted final amount if requested
    let inflationAdjustedFinalAmount: Money | undefined;
    if (includeInflation) {
      const adjustedValue = calculateInflationAdjustedValue(
        finalAmountValue,
        inflationRate,
        timeHorizonYears
      );
      inflationAdjustedFinalAmount = Money.fromNumber(adjustedValue, initialAmount.currencyCode);
    }
    
    return {
      finalAmount,
      totalContributions,
      totalGrowth,
      yearlyProjection,
      inflationAdjustedFinalAmount,
      annualReturnRate,
      volatility
    };
  }
  
  /**
   * Validate financial calculation inputs
   */
  validateInputs(params: ValidationParams): ValidationResult {
    const { initialAmount, monthlyContribution, timeHorizonYears, annualReturnRate } = params;
    
    const validation = validateFinancialInputs(
      initialAmount,
      monthlyContribution,
      timeHorizonYears,
      annualReturnRate
    );
    
    const warnings: string[] = [];
    
    // Add business-specific warnings
    if (annualReturnRate > 0.15) {
      warnings.push('Retorno anual muito otimista (>15%). Considere cenários mais conservadores.');
    }
    
    if (timeHorizonYears > 40) {
      warnings.push('Período muito longo (>40 anos). Considere revisar periodicamente.');
    }
    
    if (monthlyContribution > initialAmount * 2) {
      warnings.push('Aporte mensal muito alto em relação ao valor inicial.');
    }
    
    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings
    };
  }
  
  /**
   * Calculate optimal monthly contribution for a target amount
   */
  calculateOptimalContribution(params: OptimalContributionParams): OptimalContributionResult {
    const { targetAmount, currentAmount, timeHorizonYears, investorProfile } = params;
    
    const annualReturnRate = getAccumulationAnnualReturn(investorProfile);
    
    // Calculate required monthly contribution
    const requiredContributionValue = calculateRequiredMonthlyContribution(
      currentAmount.value,
      targetAmount.value,
      timeHorizonYears,
      annualReturnRate
    );
    
    const requiredMonthlyContribution = Money.fromNumber(requiredContributionValue, currentAmount.currencyCode);
    
    // Calculate time to goal with current contribution
    const timeToGoal = calculateTimeToGoal(
      currentAmount.value,
      requiredContributionValue,
      targetAmount.value,
      annualReturnRate
    );
    
    // Check if target is achievable
    const isTargetAchievable = timeToGoal <= timeHorizonYears && requiredContributionValue > 0;
    
    // Generate alternative scenarios
    const alternativeScenarios = [
      {
        timeHorizon: timeHorizonYears + 5,
        monthlyContribution: Money.fromNumber(
          calculateRequiredMonthlyContribution(
            currentAmount.value,
            targetAmount.value,
            timeHorizonYears + 5,
            annualReturnRate
          ),
          currentAmount.currencyCode
        )
      },
      {
        timeHorizon: timeHorizonYears + 10,
        monthlyContribution: Money.fromNumber(
          calculateRequiredMonthlyContribution(
            currentAmount.value,
            targetAmount.value,
            timeHorizonYears + 10,
            annualReturnRate
          ),
          currentAmount.currencyCode
        )
      }
    ];
    
    return {
      requiredMonthlyContribution,
      timeToGoal,
      isTargetAchievable,
      alternativeScenarios
    };
  }
}

// Export singleton instance
export const financialCalculationService = new FinancialCalculationService();