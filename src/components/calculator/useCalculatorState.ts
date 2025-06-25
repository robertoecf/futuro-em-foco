import { useState } from 'react';
import type { InvestorProfile, CalculationResult, SharedPlanData } from './types';
import { DEFAULT_VALUES } from './constants';
import { loadFromStorage, loadFromSharedPlan } from './storageUtils';
import { MonteCarloResult } from '@/lib/utils';

export const useCalculatorState = () => {
  // Try to load from shared plan first
  const sharedPlanData = loadFromSharedPlan();

  const getValueOrDefault = <T extends string | number | InvestorProfile>(key: keyof SharedPlanData, defaultValue: T): T => {
    // Primeiro prioridade: dados compartilhados da URL
    if (sharedPlanData) {
      const sharedValue = sharedPlanData[key];
      if (sharedValue !== undefined && sharedValue !== null) {
        console.log(`📥 Carregando ${key} da URL:`, sharedValue);
        return sharedValue as T;
      }
    }
    
    // Segunda prioridade: storage local
    return loadFromStorage(key, defaultValue);
  };

  // State variables - using new defaults temporarily
  const [initialAmount, setInitialAmount] = useState(() => 
    getValueOrDefault('initialAmount', DEFAULT_VALUES.INITIAL_AMOUNT)
  );
  const [monthlyAmount, setMonthlyAmount] = useState(() => 
    getValueOrDefault('monthlyAmount', DEFAULT_VALUES.MONTHLY_AMOUNT)
  );
  const [currentAge, setCurrentAge] = useState(() => 
    getValueOrDefault('currentAge', DEFAULT_VALUES.CURRENT_AGE)
  );
  const [retirementAge, setRetirementAge] = useState(() => {
    const value = getValueOrDefault('retirementAge', DEFAULT_VALUES.RETIREMENT_AGE);
    console.log('🏁 Estado inicial retirementAge:', value);
    return value;
  });
  const [lifeExpectancy, setLifeExpectancy] = useState(() => 
    getValueOrDefault('lifeExpectancy', DEFAULT_VALUES.LIFE_EXPECTANCY)
  );
  const [retirementIncome, setRetirementIncome] = useState(() => 
    getValueOrDefault('retirementIncome', DEFAULT_VALUES.RETIREMENT_INCOME)
  );
  const [portfolioReturn, setPortfolioReturn] = useState(() => 
    getValueOrDefault('portfolioReturn', DEFAULT_VALUES.PORTFOLIO_RETURN)
  );
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>(() => 
    getValueOrDefault('investorProfile', DEFAULT_VALUES.INVESTOR_PROFILE)
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

