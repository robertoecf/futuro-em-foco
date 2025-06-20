
import { useState } from 'react';
import type { InvestorProfile, CalculationResult } from './types';
import { DEFAULT_VALUES, STORAGE_KEYS } from './constants';
import { loadFromStorage, loadFromSharedPlan } from './storageUtils';
import { MonteCarloResult } from '@/lib/utils';

export const useCalculatorState = () => {
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
  
  // Monte Carlo states - always start disabled unless explicitly loaded from shared plan
  const [isMonteCarloEnabled, setIsMonteCarloEnabled] = useState(false);
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);


  return {
    // State values
    initialAmount,
    monthlyAmount,
    currentAge,
    retirementAge,
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile,
    calculationResult,
    isMonteCarloEnabled,
    monteCarloResult,
    isCalculating,
    sharedPlanData,
    // State setters
    setInitialAmount,
    setMonthlyAmount,
    setCurrentAge,
    setRetirementAge,
    setLifeExpectancy,
    setRetirementIncome,
    setPortfolioReturn,
    setInvestorProfile,
    setCalculationResult,
    setIsMonteCarloEnabled,
    setMonteCarloResult,
    setIsCalculating
  };
};
