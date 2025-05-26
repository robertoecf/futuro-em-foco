
import { useState, useCallback, useEffect } from 'react';
import { calculateFullProjection } from '@/lib/utils';

export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';

export interface CalculationResult {
  finalAmount: number;
  yearlyValues: number[];
  monthlyIncome: number;
}

export const useCalculator = () => {
  // Constants
  const DEFAULT_INITIAL_AMOUNT = 15000;
  const DEFAULT_MONTHLY_AMOUNT = 1000;
  const DEFAULT_CURRENT_AGE = 30;
  const DEFAULT_RETIREMENT_AGE = 65;
  const DEFAULT_LIFE_EXPECTANCY = 100;
  const DEFAULT_RETIREMENT_INCOME = 0;
  const DEFAULT_PORTFOLIO_RETURN = 4; // 4% default

  // State variables
  const [initialAmount, setInitialAmount] = useState(DEFAULT_INITIAL_AMOUNT);
  const [monthlyAmount, setMonthlyAmount] = useState(DEFAULT_MONTHLY_AMOUNT);
  const [currentAge, setCurrentAge] = useState(DEFAULT_CURRENT_AGE);
  const [retirementAge, setRetirementAge] = useState(DEFAULT_RETIREMENT_AGE);
  const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULT_LIFE_EXPECTANCY);
  const [retirementIncome, setRetirementIncome] = useState(DEFAULT_RETIREMENT_INCOME);
  const [portfolioReturn, setPortfolioReturn] = useState(DEFAULT_PORTFOLIO_RETURN);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>('moderado');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // Calculate accumulation years based on current and retirement age
  const accumulationYears = retirementAge - currentAge;
  
  // Taxa de retorno anual com base no perfil do investidor (para fase de acumulação)
  const getAccumulationAnnualReturn = () => {
    switch (investorProfile) {
      case 'conservador': return 0.04; // 4% a.a.
      case 'moderado': return 0.05; // 5% a.a.
      case 'arrojado': return 0.06; // 6% a.a.
      default: return 0.05;
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
      investorProfile
    });
    
    const accumulationAnnualReturn = getAccumulationAnnualReturn();
    const retirementAnnualReturn = portfolioReturn / 100; // Convert percentage to decimal
    const monthlyIncomeRate = 0.004; // 0.4% de renda mensal
    
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
  }, [initialAmount, monthlyAmount, currentAge, retirementAge, lifeExpectancy, retirementIncome, portfolioReturn, investorProfile, accumulationYears]);

  const handleInitialAmountBlur = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Initial amount blur:', value, 'parsed:', numericValue);
    setInitialAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  const handleMonthlyAmountBlur = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Monthly amount blur:', value, 'parsed:', numericValue);
    setMonthlyAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  const handleCurrentAgeBlur = (value: string) => {
    const numericValue = parseInt(value);
    console.log('Current age blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setCurrentAge(numericValue);
      if (retirementAge <= numericValue) {
        setRetirementAge(numericValue + 1);
      }
    }
  };

  const handleRetirementAgeBlur = (value: string) => {
    const numericValue = parseInt(value);
    console.log('Retirement age blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > currentAge) {
      setRetirementAge(numericValue);
    }
  };
  
  const handleLifeExpectancyChange = (value: number) => {
    console.log('Life expectancy change:', value);
    setLifeExpectancy(value);
  };
  
  const handleRetirementIncomeBlur = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    console.log('Retirement income blur:', value, 'parsed:', numericValue);
    setRetirementIncome(isNaN(numericValue) ? 0 : numericValue);
  };

  const handlePortfolioReturnBlur = (value: string) => {
    const numericValue = parseFloat(value);
    console.log('Portfolio return blur:', value, 'parsed:', numericValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setPortfolioReturn(numericValue);
    }
  };

  // Calculate on state changes
  useEffect(() => {
    calculateProjection();
  }, [calculateProjection]);

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
    handleInitialAmountBlur,
    handleMonthlyAmountBlur,
    handleCurrentAgeBlur,
    handleRetirementAgeBlur,
    handleLifeExpectancyChange,
    handleRetirementIncomeBlur,
    handlePortfolioReturnBlur,
    setInvestorProfile,
    calculateProjection
  };
};
