import { useState, useCallback, useEffect } from 'react';
import { calculateFullProjection, runMonteCarloSimulation, getVolatilityByProfile, MonteCarloResult } from '@/lib/utils';

export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';

export interface CalculationResult {
  finalAmount: number;
  yearlyValues: number[];
  monthlyIncome: number;
}

// Chaves para localStorage
const STORAGE_KEYS = {
  INITIAL_AMOUNT: 'calculator_initial_amount',
  MONTHLY_AMOUNT: 'calculator_monthly_amount',
  CURRENT_AGE: 'calculator_current_age',
  RETIREMENT_AGE: 'calculator_retirement_age',
  LIFE_EXPECTANCY: 'calculator_life_expectancy',
  RETIREMENT_INCOME: 'calculator_retirement_income',
  PORTFOLIO_RETURN: 'calculator_portfolio_return',
  INVESTOR_PROFILE: 'calculator_investor_profile',
  MONTE_CARLO_ENABLED: 'calculator_monte_carlo_enabled'
};

// Função para carregar dados do localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Função para salvar no localStorage
const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Função para carregar dados de um plano compartilhado
const loadFromSharedPlan = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  
  if (planId) {
    try {
      const planData = localStorage.getItem(`planning_${planId}`);
      if (planData) {
        const parsed = JSON.parse(planData);
        return parsed.planningInputs;
      }
    } catch (error) {
      console.error('Error loading shared plan:', error);
    }
  }
  return null;
};

export const useCalculator = () => {
  // Constants with saved values or defaults
  const DEFAULT_INITIAL_AMOUNT = 15000;
  const DEFAULT_MONTHLY_AMOUNT = 1000;
  const DEFAULT_CURRENT_AGE = 30;
  const DEFAULT_RETIREMENT_AGE = 65;
  const DEFAULT_LIFE_EXPECTANCY = 100;
  const DEFAULT_RETIREMENT_INCOME = 0;
  const DEFAULT_PORTFOLIO_RETURN = 4; // 4% default
  const DEFAULT_INVESTOR_PROFILE = 'moderado';

  // Tentar carregar de plano compartilhado primeiro
  const sharedPlanData = loadFromSharedPlan();

  // State variables - carregando do localStorage ou plano compartilhado
  const [initialAmount, setInitialAmount] = useState(() => 
    sharedPlanData?.initialAmount ?? loadFromStorage(STORAGE_KEYS.INITIAL_AMOUNT, DEFAULT_INITIAL_AMOUNT)
  );
  const [monthlyAmount, setMonthlyAmount] = useState(() => 
    sharedPlanData?.monthlyAmount ?? loadFromStorage(STORAGE_KEYS.MONTHLY_AMOUNT, DEFAULT_MONTHLY_AMOUNT)
  );
  const [currentAge, setCurrentAge] = useState(() => 
    sharedPlanData?.currentAge ?? loadFromStorage(STORAGE_KEYS.CURRENT_AGE, DEFAULT_CURRENT_AGE)
  );
  const [retirementAge, setRetirementAge] = useState(() => 
    sharedPlanData?.retirementAge ?? loadFromStorage(STORAGE_KEYS.RETIREMENT_AGE, DEFAULT_RETIREMENT_AGE)
  );
  const [lifeExpectancy, setLifeExpectancy] = useState(() => 
    sharedPlanData?.lifeExpectancy ?? loadFromStorage(STORAGE_KEYS.LIFE_EXPECTANCY, DEFAULT_LIFE_EXPECTANCY)
  );
  const [retirementIncome, setRetirementIncome] = useState(() => 
    sharedPlanData?.retirementIncome ?? loadFromStorage(STORAGE_KEYS.RETIREMENT_INCOME, DEFAULT_RETIREMENT_INCOME)
  );
  const [portfolioReturn, setPortfolioReturn] = useState(() => 
    sharedPlanData?.portfolioReturn ?? loadFromStorage(STORAGE_KEYS.PORTFOLIO_RETURN, DEFAULT_PORTFOLIO_RETURN)
  );
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>(() => 
    sharedPlanData?.investorProfile ?? loadFromStorage(STORAGE_KEYS.INVESTOR_PROFILE, DEFAULT_INVESTOR_PROFILE)
  );
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // New Monte Carlo states
  const [isMonteCarloEnabled, setIsMonteCarloEnabled] = useState(() => 
    loadFromStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, false)
  );
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculate accumulation years based on current and retirement age
  const accumulationYears = retirementAge - currentAge;
  
  // Taxa de retorno anual com base no perfil do investidor (para fase de acumulação) - ATUALIZADA
  const getAccumulationAnnualReturn = () => {
    console.log('Getting accumulation return for profile:', investorProfile);
    switch (investorProfile) {
      case 'conservador': return 0.04; // 4% a.a.
      case 'moderado': return 0.055; // 5.5% a.a. (ATUALIZADO)
      case 'arrojado': return 0.065; // 6.5% a.a. (ATUALIZADO)
      default: return 0.055;
    }
  };
  
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
    
    const accumulationAnnualReturn = getAccumulationAnnualReturn();
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
      setMonteCarloResult(null);
    }
  }, [initialAmount, monthlyAmount, currentAge, retirementAge, lifeExpectancy, retirementIncome, portfolioReturn, investorProfile, accumulationYears, isMonteCarloEnabled]);

  const handleMonteCarloToggle = (enabled: boolean) => {
    setIsMonteCarloEnabled(enabled);
    saveToStorage(STORAGE_KEYS.MONTE_CARLO_ENABLED, enabled);
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

  // Limpar URL após carregar plano compartilhado
  useEffect(() => {
    if (sharedPlanData) {
      // Remover parâmetro da URL sem recarregar a página
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
