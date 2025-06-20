
import { useCallback } from 'react';
import type { InvestorProfile } from './types';
import type { MonteCarloResult } from '@/lib/utils';
import { STORAGE_KEYS } from './constants';
import { saveToStorage } from './storageUtils';

interface UseCalculatorHandlersProps {
  currentAge: number;
  retirementAge: number;
  setInitialAmount: (value: number) => void;
  setMonthlyAmount: (value: number) => void;
  setCurrentAge: (value: number) => void;
  setRetirementAge: (value: number) => void;
  setLifeExpectancy: (value: number) => void;
  setRetirementIncome: (value: number) => void;
  setPortfolioReturn: (value: number) => void;
  setInvestorProfile: (value: InvestorProfile) => void;
  setIsMonteCarloEnabled: (value: boolean) => void;
  setIsCalculating: (value: boolean) => void;
  setMonteCarloResult: (value: MonteCarloResult | null) => void;
}

export const useCalculatorHandlers = ({
  currentAge,
  retirementAge,
  setInitialAmount,
  setMonthlyAmount,
  setCurrentAge,
  setRetirementAge,
  setLifeExpectancy,
  setRetirementIncome,
  setPortfolioReturn,
  setInvestorProfile,
  setIsMonteCarloEnabled,
  setIsCalculating,
  setMonteCarloResult
}: UseCalculatorHandlersProps) => {

  // Helper function to reset Monte Carlo state when variables change
  const resetMonteCarloState = useCallback(() => {
    console.log('🔄 Resetting Monte Carlo state due to variable change');
    setIsMonteCarloEnabled(false);
    setIsCalculating(false);
    setMonteCarloResult(null);
    saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, false);
  }, [setIsMonteCarloEnabled, setIsCalculating, setMonteCarloResult]);

  const finishCalculation = useCallback(() => {
    console.log('🏁 Calculation animation finished - setting isCalculating to false');
    setIsCalculating(false);
  }, [setIsCalculating]);

  const handleMonteCarloToggle = useCallback((enabled: boolean) => {
    console.log('Monte Carlo toggle:', enabled);
    setIsMonteCarloEnabled(enabled);
    saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, enabled);
    
    // If disabling, immediately clear results and stop calculating
    if (!enabled) {
      setIsCalculating(false);
      setMonteCarloResult(null);
    }
  }, [setIsMonteCarloEnabled, setIsCalculating, setMonteCarloResult]);

  const handleInitialAmountBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Initial amount blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setInitialAmount(finalValue);
    saveToStorage(STORAGE_KEYS.INITIAL_AMOUNT, finalValue);
    resetMonteCarloState(); // Reset Monte Carlo when variable changes
  }, [setInitialAmount, resetMonteCarloState]);

  const handleMonthlyAmountBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Monthly amount blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setMonthlyAmount(finalValue);
    saveToStorage(STORAGE_KEYS.MONTHLY_AMOUNT, finalValue);
    resetMonteCarloState(); // Reset Monte Carlo when variable changes
  }, [setMonthlyAmount, resetMonteCarloState]);

  const handleCurrentAgeBlur = useCallback((value: string) => {
    const numericValue = parseInt(value);
    console.log('Current age blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setCurrentAge(numericValue);
      saveToStorage(STORAGE_KEYS.CURRENT_AGE, numericValue);
      if (retirementAge <= numericValue) {
        const newRetirementAge = numericValue + 1;
        setRetirementAge(newRetirementAge);
        saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, newRetirementAge);
      }
      resetMonteCarloState(); // Reset Monte Carlo when variable changes
    }
  }, [setCurrentAge, retirementAge, setRetirementAge, resetMonteCarloState]);

  const handleRetirementAgeBlur = useCallback((value: string) => {
    const numericValue = parseInt(value);
    console.log('Retirement age blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > currentAge) {
      setRetirementAge(numericValue);
      saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, numericValue);
      resetMonteCarloState(); // Reset Monte Carlo when variable changes
    }
  }, [setRetirementAge, currentAge, resetMonteCarloState]);
  
  const handleLifeExpectancyChange = useCallback((value: number) => {
    console.log('Life expectancy change:', value);
    setLifeExpectancy(value);
    saveToStorage(STORAGE_KEYS.LIFE_EXPECTANCY, value);
    resetMonteCarloState(); // Reset Monte Carlo when variable changes
  }, [setLifeExpectancy, resetMonteCarloState]);
  
  const handleRetirementIncomeBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Retirement income blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setRetirementIncome(finalValue);
    saveToStorage(STORAGE_KEYS.RETIREMENT_INCOME, finalValue);
    resetMonteCarloState(); // Reset Monte Carlo when variable changes
  }, [setRetirementIncome, resetMonteCarloState]);

  const handlePortfolioReturnBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value);
    console.log('Portfolio return blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setPortfolioReturn(numericValue);
      saveToStorage(STORAGE_KEYS.PORTFOLIO_RETURN, numericValue);
      resetMonteCarloState(); // Reset Monte Carlo when variable changes
    }
  }, [setPortfolioReturn, resetMonteCarloState]);

  const handleInvestorProfileChange = useCallback((profile: InvestorProfile) => {
    console.log('Investor profile change:', profile);
    setInvestorProfile(profile);
    saveToStorage(STORAGE_KEYS.INVESTOR_PROFILE, profile);
    resetMonteCarloState(); // Reset Monte Carlo when variable changes
  }, [setInvestorProfile, resetMonteCarloState]);

  return {
    finishCalculation,
    handleMonteCarloToggle,
    handleInitialAmountBlur,
    handleMonthlyAmountBlur,
    handleCurrentAgeBlur,
    handleRetirementAgeBlur,
    handleLifeExpectancyChange,
    handleRetirementIncomeBlur,
    handlePortfolioReturnBlur,
    handleInvestorProfileChange
  };
};
