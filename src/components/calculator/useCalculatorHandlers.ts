
import { useCallback } from 'react';
import type { InvestorProfile } from './types';
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
  setMonteCarloResult: (value: any) => void;
  calculateProjection: () => void;
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
  setMonteCarloResult,
  calculateProjection
}: UseCalculatorHandlersProps) => {

  // Function to reset Monte Carlo state when important inputs change
  const resetToDeteministic = useCallback(() => {
    console.log('🔄 Resetting to deterministic mode due to input change');
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

  const handleCalculateProjection = useCallback(() => {
    console.log('🚀 Manual calculation triggered');
    calculateProjection();
  }, [calculateProjection]);

  const handleInitialAmountBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Initial amount blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setInitialAmount(finalValue);
    saveToStorage(STORAGE_KEYS.INITIAL_AMOUNT, finalValue);
    resetToDeteministic();
  }, [setInitialAmount, resetToDeteministic]);

  const handleMonthlyAmountBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Monthly amount blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setMonthlyAmount(finalValue);
    saveToStorage(STORAGE_KEYS.MONTHLY_AMOUNT, finalValue);
    resetToDeteministic();
  }, [setMonthlyAmount, resetToDeteministic]);

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
      resetToDeteministic();
    }
  }, [setCurrentAge, retirementAge, setRetirementAge, resetToDeteministic]);

  const handleRetirementAgeBlur = useCallback((value: string) => {
    const numericValue = parseInt(value);
    console.log('Retirement age blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > currentAge) {
      setRetirementAge(numericValue);
      saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, numericValue);
      resetToDeteministic();
    }
  }, [setRetirementAge, currentAge, resetToDeteministic]);
  
  const handleLifeExpectancyChange = useCallback((value: number) => {
    console.log('Life expectancy change:', value);
    setLifeExpectancy(value);
    saveToStorage(STORAGE_KEYS.LIFE_EXPECTANCY, value);
    resetToDeteministic();
  }, [setLifeExpectancy, resetToDeteministic]);
  
  const handleRetirementIncomeBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Retirement income blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setRetirementIncome(finalValue);
    saveToStorage(STORAGE_KEYS.RETIREMENT_INCOME, finalValue);
    resetToDeteministic();
  }, [setRetirementIncome, resetToDeteministic]);

  const handlePortfolioReturnBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value);
    console.log('Portfolio return blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setPortfolioReturn(numericValue);
      saveToStorage(STORAGE_KEYS.PORTFOLIO_RETURN, numericValue);
      resetToDeteministic();
    }
  }, [setPortfolioReturn, resetToDeteministic]);

  const handleInvestorProfileChange = useCallback((profile: InvestorProfile) => {
    console.log('Investor profile change:', profile);
    setInvestorProfile(profile);
    saveToStorage(STORAGE_KEYS.INVESTOR_PROFILE, profile);
    resetToDeteministic(); // Reset Monte Carlo when profile changes
  }, [setInvestorProfile, resetToDeteministic]);

  return {
    finishCalculation,
    handleMonteCarloToggle,
    handleCalculateProjection,
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
