
import { useCallback, useEffect } from 'react';
import { calculateFullProjection, runMonteCarloSimulation, getVolatilityByProfile } from '@/lib/utils';
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

  // Deterministic calculation (always runs automatically)
  const calculateDeterministicProjection = useCallback(() => {
    console.log('📊 Running deterministic calculation');
    
    const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
    const retirementAnnualReturn = portfolioReturn / 100;
    const monthlyIncomeRate = 0.004;
    
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
  }, [initialAmount, monthlyAmount, currentAge, lifeExpectancy, retirementIncome, portfolioReturn, investorProfile, accumulationYears, setCalculationResult]);

  // Full calculation including Monte Carlo (only runs when explicitly called)
  const calculateProjection = useCallback(() => {
    console.log('🚀 Running full calculation with Monte Carlo:', isMonteCarloEnabled);
    
    // Always run deterministic first
    calculateDeterministicProjection();

    // Run Monte Carlo only if enabled
    if (isMonteCarloEnabled) {
      console.log('🎲 Starting Monte Carlo calculation');
      setIsCalculating(true);
      
      const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
      const volatility = getVolatilityByProfile(investorProfile);
      const retirementAnnualReturn = portfolioReturn / 100;
      const monthlyIncomeRate = 0.004;
      
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
      
      const convertedResults = {
        scenarios: gbmResults.scenarios,
        statistics: gbmResults.statistics
      };
      
      setMonteCarloResult(convertedResults);
    } else {
      // Clear Monte Carlo data when disabled
      setMonteCarloResult(null);
      setIsCalculating(false);
    }
  }, [
    isMonteCarloEnabled,
    calculateDeterministicProjection,
    initialAmount,
    monthlyAmount,
    currentAge,
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile,
    accumulationYears,
    setIsCalculating,
    setMonteCarloResult
  ]);

  // Auto-calculate deterministic projection on input changes
  useEffect(() => {
    console.log('📊 Auto-calculating deterministic projection due to input change');
    calculateDeterministicProjection();
  }, [calculateDeterministicProjection]);

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
