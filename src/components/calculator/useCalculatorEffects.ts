
import { useCallback, useEffect } from 'react';
import { calculateFullProjection, runMonteCarloSimulation, getVolatilityByProfile } from '@/lib/utils';
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
    
    // Required wealth to sustain the monthly income target
    const requiredWealth = (retirementIncome * 12) / (portfolioReturn / 100);
    const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1/12) - 1;
    
    // Simulate accumulation to find when required wealth is reached
    let balance = initialAmount;
    let years = 0;
    const maxYears = 50; // Safety limit
    
    while (balance < requiredWealth && years < maxYears) {
      for (let month = 0; month < 12; month++) {
        balance += monthlyAmount;
        balance *= (1 + monthlyReturn);
      }
      years++;
    }
    
    return currentAge + years;
  }, [retirementIncome, portfolioReturn, investorProfile, initialAmount, monthlyAmount, currentAge, retirementAge]);

  const calculateProjection = useCallback(() => {
    console.log('Calculating projection with:', {
      initialAmount,
      monthlyAmount,
      currentAge,
      retirementAge,
      lifeExpectancy,
      portfolioReturn,
      investorProfile,
      isMonteCarloEnabled
    });
    
    const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
    console.log('Using accumulation return:', accumulationAnnualReturn);
    const retirementAnnualReturn = portfolioReturn / 100; // Convert percentage to decimal
    const monthlyIncomeRate = 0.004; // 0.4% de renda mensal
    
    // Deterministic calculation
    const result = calculateFullProjection(
      initialAmount,
      monthlyAmount,
      accumulationYears,
      lifeExpectancy - currentAge, // Total years from current age to life expectancy
      accumulationAnnualReturn,
      monthlyIncomeRate,
      retirementIncome,
      retirementAnnualReturn // Pass the retirement return rate
    );
    
    console.log('Calculation result:', result);
    
    setCalculationResult({
      finalAmount: result.retirementAmount,
      yearlyValues: result.yearlyValues,
      monthlyIncome: result.monthlyIncome
    });

    // Monte Carlo calculation if enabled
    if (isMonteCarloEnabled) {
      console.log('🚀 Starting Monte Carlo calculation and animation');
      setIsCalculating(true);
      
      // Execute Monte Carlo calculation immediately but let animation control the timing
      const volatility = getVolatilityByProfile(investorProfile);
      
      const monteCarloResults = runMonteCarloSimulation(
        initialAmount,
        monthlyAmount,
        accumulationYears,
        lifeExpectancy - currentAge,
        accumulationAnnualReturn,
        volatility,
        monthlyIncomeRate,
        retirementIncome,
        retirementAnnualReturn,
        100 // Number of simulations
      );
      
      console.log('💾 Monte Carlo calculation completed, results ready:', monteCarloResults);
      setMonteCarloResult(monteCarloResults);
      
      // Don't set isCalculating to false here - let the animation control it
    } else {
      // Reset Monte Carlo data when disabled
      setMonteCarloResult(null);
      setIsCalculating(false);
    }
  }, [initialAmount, monthlyAmount, currentAge, retirementAge, lifeExpectancy, retirementIncome, portfolioReturn, investorProfile, accumulationYears, isMonteCarloEnabled, setCalculationResult, setIsCalculating, setMonteCarloResult]);

  // Calculate on state changes
  useEffect(() => {
    console.log('useEffect triggered, recalculating projection');
    calculateProjection();
  }, [calculateProjection]);

  // Clear URL after loading shared plan
  useEffect(() => {
    if (sharedPlanData) {
      // Remove parameter from URL without reloading the page
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
