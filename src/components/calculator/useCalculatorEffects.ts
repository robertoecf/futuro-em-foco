import { useCallback, useEffect } from 'react';
import {
  calculateFullProjection,
  getVolatilityByProfile,
  type MonteCarloResult,
} from '@/lib/utils';
// import { runOptimizedMonteCarloSimulation } from '@/lib/gbm/optimizedSimulation';
import { runUltraOptimizedMonteCarloSimulation } from '@/lib/gbm/ultraOptimizedSimulation';
import { useDebounce } from '@/hooks/useDebounce';
import type { PlanningData } from '@/hooks/usePlanningData';
import type { InvestorProfile, CalculationResult } from './types';
import { getAccumulationAnnualReturn } from './insights/insightsCalculations';

interface UseCalculatorEffectsProps {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  retirementIncome: number;
  portfolioReturn: number;
  investorProfile: InvestorProfile;
  accumulationYears: number;
  isMonteCarloEnabled: boolean;
  isCalculating: boolean;
  sharedPlanData: PlanningData['planningInputs'] | null;
  setCalculationResult: (result: CalculationResult) => void;
  setIsCalculating: (value: boolean) => void;
  setMonteCarloResult: (result: MonteCarloResult | null) => void;
}

export const useCalculatorEffects = ({
  initialAmount,
  monthlyAmount,
  currentAge,
  retirementAge,
  lifeExpectancy,
  retirementIncome,
  portfolioReturn,
  investorProfile,
  accumulationYears,
  isMonteCarloEnabled,
  isCalculating,
  sharedPlanData,
  setCalculationResult,
  setIsCalculating,
  setMonteCarloResult,
}: UseCalculatorEffectsProps) => {
  // Debounce input values to prevent excessive recalculations
  const debouncedInitialAmount = useDebounce(initialAmount, 300);
  const debouncedMonthlyAmount = useDebounce(monthlyAmount, 300);
  const debouncedRetirementIncome = useDebounce(retirementIncome, 300);
  const debouncedPortfolioReturn = useDebounce(portfolioReturn, 300);

  // Calculate possible retirement age based on desired income
  const calculatePossibleRetirementAge = useCallback(() => {
    if (debouncedRetirementIncome <= 0) return retirementAge;

    const requiredWealth = (debouncedRetirementIncome * 12) / (debouncedPortfolioReturn / 100);
    const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1 / 12) - 1;

    let balance = debouncedInitialAmount;
    let years = 0;
    const maxYears = 50;

    while (balance < requiredWealth && years < maxYears) {
      for (let month = 0; month < 12; month++) {
        balance += debouncedMonthlyAmount;
        balance *= 1 + monthlyReturn;
      }
      years++;
    }

    return currentAge + years;
  }, [
    debouncedRetirementIncome,
    debouncedPortfolioReturn,
    investorProfile,
    debouncedInitialAmount,
    debouncedMonthlyAmount,
    currentAge,
    retirementAge,
  ]);

  const calculateProjection = useCallback(async () => {
    const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
    const retirementAnnualReturn = debouncedPortfolioReturn / 100;
    const monthlyIncomeRate = 0.004;

    // Always calculate deterministic projection first
    const result = calculateFullProjection(
      debouncedInitialAmount,
      debouncedMonthlyAmount,
      accumulationYears,
      lifeExpectancy - currentAge,
      accumulationAnnualReturn,
      monthlyIncomeRate,
      debouncedRetirementIncome,
      retirementAnnualReturn
    );

    setCalculationResult({
      finalAmount: result.retirementAmount,
      yearlyValues: result.yearlyValues,
      monthlyIncome: result.monthlyIncome,
    });

    // Only run Monte Carlo if explicitly calculating (triggered by user click)
    if (isMonteCarloEnabled && isCalculating) {
      // Executing Monte Carlo calculation

      // Use requestIdleCallback if available, otherwise setTimeout
      const scheduleWork = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(callback);
        } else {
          setTimeout(callback, 0);
        }
      };

      scheduleWork(async () => {
        try {
          const volatility = getVolatilityByProfile(investorProfile);

          // Use ultra-optimized version for 1001 simulations
          const gbmResults = await runUltraOptimizedMonteCarloSimulation(
            debouncedInitialAmount,
            debouncedMonthlyAmount,
            accumulationYears,
            lifeExpectancy - currentAge,
            accumulationAnnualReturn,
            volatility,
            monthlyIncomeRate,
            debouncedRetirementIncome,
            retirementAnnualReturn,
            1001 // Increased from 500 to 1001 simulations
          );

          const convertedResults = {
            scenarios: gbmResults.scenarios,
            statistics: gbmResults.statistics,
          };

          console.log('✅ MONTE CARLO FINALIZADO - dados prontos para animação');
          setMonteCarloResult(convertedResults);
          setIsCalculating(false);
        } catch (error) {
          console.error('❌ Optimized Monte Carlo calculation failed:', error);
          setIsCalculating(false);
          setMonteCarloResult(null);
        }
      });
    } else {
      // Monte Carlo not active
      if (!isMonteCarloEnabled) {
        setMonteCarloResult(null);
      }
      if (!isCalculating) {
        // Don't set to false if we're supposed to be calculating
      }
    }
  }, [
    isMonteCarloEnabled,
    isCalculating,
    setCalculationResult,
    setIsCalculating,
    setMonteCarloResult,
    accumulationYears,
    currentAge,
    debouncedInitialAmount,
    debouncedMonthlyAmount,
    debouncedRetirementIncome,
    debouncedPortfolioReturn,
    investorProfile,
    lifeExpectancy,
  ]);

  // Calculate on input changes - now using debounced values
  useEffect(() => {
    calculateProjection();
  }, [calculateProjection]);

  // Clear URL after loading shared plan
  useEffect(() => {
    if (sharedPlanData) {
      const url = new URL(window.location.href);

      // Só remove o parâmetro 'plan' se ele existir (sistema antigo)
      if (url.searchParams.has('plan')) {
        url.searchParams.delete('plan');
        window.history.replaceState({}, '', url.toString());
      }
      // Para parâmetros diretos, manter a URL para facilitar compartilhamento
      // Não limpar os parâmetros ia, ma, ca, etc.
    }
  }, [sharedPlanData]);

  return {
    calculatePossibleRetirementAge,
    calculateProjection,
  };
};
