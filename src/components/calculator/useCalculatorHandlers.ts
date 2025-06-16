
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

  const finishCalculation = useCallback(() => {
    console.log('🏁 Calculation finished');
    setIsCalculating(false);
  }, [setIsCalculating]);

  const handleMonteCarloToggle = useCallback((enabled: boolean) => {
    console.log('Monte Carlo toggle:', enabled);
    setIsMonteCarloEnabled(enabled);
    saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, enabled);
  }, [setIsMonteCarloEnabled]);

  const handleCalculateProjection = useCallback(() => {
    console.log('🚀 Manual calculation triggered');
    calculateProjection();
  }, [calculateProjection]);

  const handleInitialAmountBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setInitialAmount(finalValue);
    saveToStorage(STORAGE_KEYS.INITIAL_AMOUNT, finalValue);
  }, [setInitialAmount]);

  const handleMonthlyAmountBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setMonthlyAmount(finalValue);
    saveToStorage(STORAGE_KEYS.MONTHLY_AMOUNT, finalValue);
  }, [setMonthlyAmount]);

  const handleCurrentAgeBlur = useCallback((value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      setCurrentAge(numericValue);
      saveToStorage(STORAGE_KEYS.CURRENT_AGE, numericValue);
      if (retirementAge <= numericValue) {
        const newRetirementAge = numericValue + 1;
        setRetirementAge(newRetirementAge);
        saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, newRetirementAge);
      }
    }
  }, [setCurrentAge, retirementAge, setRetirementAge]);

  const handleRetirementAgeBlur = useCallback((value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > currentAge) {
      setRetirementAge(numericValue);
      saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, numericValue);
    }
  }, [setRetirementAge, currentAge]);
  
  const handleLifeExpectancyChange = useCallback((value: number) => {
    setLifeExpectancy(value);
    saveToStorage(STORAGE_KEYS.LIFE_EXPECTANCY, value);
  }, [setLifeExpectancy]);
  
  const handleRetirementIncomeBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setRetirementIncome(finalValue);
    saveToStorage(STORAGE_KEYS.RETIREMENT_INCOME, finalValue);
  }, [setRetirementIncome]);

  const handlePortfolioReturnBlur = useCallback((value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      setPortfolioReturn(numericValue);
      saveToStorage(STORAGE_KEYS.PORTFOLIO_RETURN, numericValue);
    }
  }, [setPortfolioReturn]);

  const handleInvestorProfileChange = useCallback((profile: InvestorProfile) => {
    setInvestorProfile(profile);
    saveToStorage(STORAGE_KEYS.INVESTOR_PROFILE, profile);
  }, [setInvestorProfile]);

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
