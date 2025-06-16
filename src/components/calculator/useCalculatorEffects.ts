
import { useCallback, useEffect } from 'react';
import { calculateFullProjection } from '@/lib/utils';
import { runBrownianMonteCarloSimulation } from '@/lib/brownianMotionUtils';
import type { InvestorProfile, CalculationResult } from './types';
import { getAccumulationAnnualReturn } from './calculationUtils';

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
  sharedPlanData: any;
  setCalculationResult: (result: CalculationResult) => void;
  setIsCalculating: (value: boolean) => void;
  setMonteCarloResult: (result: any) => void;
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
  sharedPlanData,
  setCalculationResult,
  setIsCalculating,
  setMonteCarloResult
}: UseCalculatorEffectsProps) => {

  // Calculate possible retirement age based on desired income
  const calculatePossibleRetirementAge = useCallback(() => {
    if (retirementIncome <= 0) return retirementAge;
    
    const requiredWealth = (retirementIncome * 12) / (portfolioReturn / 100);
    const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
    
    let balance = initialAmount;
    let years = 0;
    const maxYears = 50;
    
    while (balance < requiredWealth && years < maxYears) {
      for (let month = 0; month < 12; month++) {
        balance += monthlyAmount;
        balance *= (1 + monthlyReturn);
      }
      years++;
    }
    
    return currentAge + years;
  }, [retirementIncome, portfolioReturn, investorProfile, initialAmount, monthlyAmount, currentAge, retirementAge]);

  // Main calculation function - runs everything when called
  const calculateProjection = useCallback(() => {
    console.log('🚀 Running calculation');
    setIsCalculating(true);
    
    const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
    const retirementAnnualReturn = portfolioReturn / 100;
    const monthlyIncomeRate = 0.004;
    
    // Always run deterministic calculation first
    const result = calculateFullProjection(
      initialAmount,
      monthlyAmount,
      accumulationYears,
      lifeExpectancy - currentAge,
      accumulationAnnualReturn,
      monthlyIncomeRate,
      retirementIncome,
      retirementAnnualReturn
    );
    
    setCalculationResult({
      finalAmount: result.retirementAmount,
      yearlyValues: result.yearlyValues,
      monthlyIncome: result.monthlyIncome
    });

    // Run Monte Carlo if enabled
    if (isMonteCarloEnabled) {
      console.log('🎲 Running Monte Carlo simulation');
      
      const volatility = investorProfile === 'conservador' ? 0.08 : 
                        investorProfile === 'moderado' ? 0.12 : 0.16;
      
      const gbmResults = runBrownianMonteCarloSimulation(
        initialAmount,
        monthlyAmount,
        accumulationYears,
        lifeExpectancy - currentAge,
        accumulationAnnualReturn,
        volatility,
        monthlyIncomeRate,
        retirementIncome,
        retirementAnnualReturn,
        100
      );
      
      setMonteCarloResult({
        scenarios: gbmResults.scenarios,
        statistics: gbmResults.statistics
      });
    } else {
      setMonteCarloResult(null);
    }
  }, [
    initialAmount,
    monthlyAmount,
    currentAge,
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile,
    accumulationYears,
    isMonteCarloEnabled,
    setCalculationResult,
    setIsCalculating,
    setMonteCarloResult
  ]);

  // Clear URL after loading shared plan
  useEffect(() => {
    if (sharedPlanData) {
      const url = new URL(window.location.href);
      url.searchParams.delete('plan');
      window.history.replaceState({}, '', url.toString());
    }
  }, [sharedPlanData]);

  return {
    calculatePossibleRetirementAge,
    calculateProjection
  };
};
