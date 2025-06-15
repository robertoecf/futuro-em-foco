import { useState, useCallback, useEffect } from 'react';
import { calculateFullProjection, runMonteCarloSimulation, getVolatilityByProfile, MonteCarloResult } from '@/lib/utils';
import type { InvestorProfile, CalculationResult } from './types';
import { DEFAULT_VALUES, STORAGE_KEYS } from './constants';
import { loadFromStorage, saveToStorage, loadFromSharedPlan } from './storageUtils';
import { getAccumulationAnnualReturn } from './calculationUtils';

export { type InvestorProfile, type CalculationResult } from './types';

export const useCalculator = () => {
  // Try to load from shared plan first
  const sharedPlanData = loadFromSharedPlan();

  // State variables - loading from localStorage or shared plan
  const [initialAmount, setInitialAmount] = useState(() => 
    sharedPlanData?.initialAmount ?? loadFromStorage(STORAGE_KEYS.INITIAL_AMOUNT, DEFAULT_VALUES.INITIAL_AMOUNT)
  );
  const [monthlyAmount, setMonthlyAmount] = useState(() => 
    sharedPlanData?.monthlyAmount ?? loadFromStorage(STORAGE_KEYS.MONTHLY_AMOUNT, DEFAULT_VALUES.MONTHLY_AMOUNT)
  );
  const [currentAge, setCurrentAge] = useState(() => 
    sharedPlanData?.currentAge ?? loadFromStorage(STORAGE_KEYS.CURRENT_AGE, DEFAULT_VALUES.CURRENT_AGE)
  );
  const [retirementAge, setRetirementAge] = useState(() => 
    sharedPlanData?.retirementAge ?? loadFromStorage(STORAGE_KEYS.RETIREMENT_AGE, DEFAULT_VALUES.RETIREMENT_AGE)
  );
  const [lifeExpectancy, setLifeExpectancy] = useState(() => 
    sharedPlanData?.lifeExpectancy ?? loadFromStorage(STORAGE_KEYS.LIFE_EXPECTANCY, DEFAULT_VALUES.LIFE_EXPECTANCY)
  );
  const [retirementIncome, setRetirementIncome] = useState(() => 
    sharedPlanData?.retirementIncome ?? loadFromStorage(STORAGE_KEYS.RETIREMENT_INCOME, DEFAULT_VALUES.RETIREMENT_INCOME)
  );
  const [portfolioReturn, setPortfolioReturn] = useState(() => 
    sharedPlanData?.portfolioReturn ?? loadFromStorage(STORAGE_KEYS.PORTFOLIO_RETURN, DEFAULT_VALUES.PORTFOLIO_RETURN)
  );
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>(() => 
    sharedPlanData?.investorProfile ?? loadFromStorage(STORAGE_KEYS.INVESTOR_PROFILE, DEFAULT_VALUES.INVESTOR_PROFILE)
  );
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // Monte Carlo states
  const [isMonteCarloEnabled, setIsMonteCarloEnabled] = useState(() => 
    loadFromStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, DEFAULT_VALUES.MONTE_CARLO_ENABLED)
  );
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculate accumulation years based on current and retirement age
  const accumulationYears = retirementAge - currentAge;
  
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

  const possibleRetirementAge = calculatePossibleRetirementAge();
  
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
      setIsCalculating(true);
      
      // Run Monte Carlo simulation in a timeout to not block UI
      setTimeout(() => {
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
        
        console.log('Monte Carlo results:', monteCarloResults);
        setMonteCarloResult(monteCarloResults);
        setIsCalculating(false);
      }, 100);
    } else {
      // Reset Monte Carlo data when disabled
      setMonteCarloResult(null);
      setIsCalculating(false);
    }
  }, [initialAmount, monthlyAmount, currentAge, retirementAge, lifeExpectancy, retirementIncome, portfolioReturn, investorProfile, accumulationYears, isMonteCarloEnabled]);

  const handleMonteCarloToggle = (enabled: boolean) => {
    console.log('Monte Carlo toggle:', enabled);
    setIsMonteCarloEnabled(enabled);
    saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, enabled);
    
    // If disabling, immediately clear results and stop calculating
    if (!enabled) {
      setIsCalculating(false);
      setMonteCarloResult(null);
    }
  };

  const handleInitialAmountBlur = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Initial amount blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setInitialAmount(finalValue);
    saveToStorage(STORAGE_KEYS.INITIAL_AMOUNT, finalValue);
  };

  const handleMonthlyAmountBlur = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Monthly amount blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setMonthlyAmount(finalValue);
    saveToStorage(STORAGE_KEYS.MONTHLY_AMOUNT, finalValue);
  };

  const handleCurrentAgeBlur = (value: string) => {
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
    }
  };

  const handleRetirementAgeBlur = (value: string) => {
    const numericValue = parseInt(value);
    console.log('Retirement age blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > currentAge) {
      setRetirementAge(numericValue);
      saveToStorage(STORAGE_KEYS.RETIREMENT_AGE, numericValue);
    }
  };
  
  const handleLifeExpectancyChange = (value: number) => {
    console.log('Life expectancy change:', value);
    setLifeExpectancy(value);
    saveToStorage(STORAGE_KEYS.LIFE_EXPECTANCY, value);
  };
  
  const handleRetirementIncomeBlur = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Retirement income blur:', value, 'parsed:', numericValue);
    const finalValue = isNaN(numericValue) ? 0 : numericValue;
    setRetirementIncome(finalValue);
    saveToStorage(STORAGE_KEYS.RETIREMENT_INCOME, finalValue);
  };

  const handlePortfolioReturnBlur = (value: string) => {
    const numericValue = parseFloat(value);
    console.log('Portfolio return blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setPortfolioReturn(numericValue);
      saveToStorage(STORAGE_KEYS.PORTFOLIO_RETURN, numericValue);
    }
  };

  const handleInvestorProfileChange = (profile: InvestorProfile) => {
    console.log('Investor profile change:', profile);
    setInvestorProfile(profile);
    saveToStorage(STORAGE_KEYS.INVESTOR_PROFILE, profile);
  };

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
  }, []);

  return {
    initialAmount,
    monthlyAmount,
    currentAge,
    retirementAge,
    possibleRetirementAge, // Add the calculated possible retirement age
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile,
    calculationResult,
    accumulationYears,
    isMonteCarloEnabled,
    monteCarloResult,
    isCalculating,
    handleInitialAmountBlur,
    handleMonthlyAmountBlur,
    handleCurrentAgeBlur,
    handleRetirementAgeBlur,
    handleLifeExpectancyChange,
    handleRetirementIncomeBlur,
    handlePortfolioReturnBlur,
    setInvestorProfile: handleInvestorProfileChange,
    handleMonteCarloToggle,
    calculateProjection
  };
};
