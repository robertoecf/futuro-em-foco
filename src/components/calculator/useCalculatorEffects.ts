
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

  const calculateProjection = useCallback(() => {
    console.log('🧮 Calculating projection with:', {
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
    
    // Always calculate deterministic projection first
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
    
    console.log('✅ Deterministic calculation result:', result);
    
    setCalculationResult({
      finalAmount: result.retirementAmount,
      yearlyValues: result.yearlyValues,
      monthlyIncome: result.monthlyIncome
    });

    // Only run Monte Carlo if explicitly enabled and user manually triggered it
    // This prevents automatic Monte Carlo execution when variables change
    if (isMonteCarloEnabled) {
      console.log('🎲 Monte Carlo is enabled - will calculate when user explicitly requests');
      setIsCalculating(true);
      
      const volatility = getVolatilityByProfile(investorProfile);
      
      // Use the new GBM-based Monte Carlo simulation
      const gbmResults = runBrownianMonteCarloSimulation(
        initialAmount,
        monthlyAmount,
        accumulationYears,
        lifeExpectancy - currentAge,
        accumulationAnnualReturn, // drift rate (μ)
        volatility, // volatility (σ)
        monthlyIncomeRate,
        retirementIncome,
        retirementAnnualReturn,
        100 // Number of simulations
      );
      
      console.log('💾 GBM Monte Carlo calculation completed:', gbmResults);
      
      // Convert to the format expected by the chart components
      const convertedResults = {
        scenarios: gbmResults.scenarios,
        statistics: gbmResults.statistics
      };
      
      setMonteCarloResult(convertedResults);
      
      // Don't set isCalculating to false here - let the animation control it
    } else {
      // Reset Monte Carlo data when disabled
      console.log('📊 Monte Carlo disabled - using deterministic results only');
      setMonteCarloResult(null);
      setIsCalculating(false);
    }
  }, [initialAmount, monthlyAmount, currentAge, retirementAge, lifeExpectancy, retirementIncome, portfolioReturn, investorProfile, accumulationYears, isMonteCarloEnabled, setCalculationResult, setIsCalculating, setMonteCarloResult]);

  // Calculate on state changes - but Monte Carlo won't auto-run due to the logic above
  useEffect(() => {
    console.log('📊 useEffect triggered, recalculating projection');
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
