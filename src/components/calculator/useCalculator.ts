
import { useState, useEffect } from 'react';
import { calculateFullProjection } from '@/lib/utils';

type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';

interface CalculationResult {
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
  const DEFAULT_OBJECTIVE = 'aposentadoria';
  const DEFAULT_LIFE_EXPECTANCY = 100;
  const DEFAULT_RETIREMENT_INCOME = 0;

  // State variables
  const [initialAmount, setInitialAmount] = useState(DEFAULT_INITIAL_AMOUNT);
  const [monthlyAmount, setMonthlyAmount] = useState(DEFAULT_MONTHLY_AMOUNT);
  const [currentAge, setCurrentAge] = useState(DEFAULT_CURRENT_AGE);
  const [retirementAge, setRetirementAge] = useState(DEFAULT_RETIREMENT_AGE);
  const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULT_LIFE_EXPECTANCY);
  const [retirementIncome, setRetirementIncome] = useState(DEFAULT_RETIREMENT_INCOME);
  const [objective, setObjective] = useState(DEFAULT_OBJECTIVE);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>('moderado');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // Calculate accumulation years based on current and retirement age
  const accumulationYears = retirementAge - currentAge;
  
  // Taxa de retorno anual com base no perfil do investidor
  const getAnnualReturn = () => {
    switch (investorProfile) {
      case 'conservador': return 0.04; // 4% a.a.
      case 'moderado': return 0.05; // 5% a.a.
      case 'arrojado': return 0.06; // 6% a.a.
      default: return 0.05;
    }
  };
  
  const calculateProjection = () => {
    const annualReturn = getAnnualReturn();
    const monthlyIncomeRate = 0.004; // 0.4% de renda mensal
    
    const result = calculateFullProjection(
      initialAmount,
      monthlyAmount,
      accumulationYears,
      lifeExpectancy - currentAge, // Total years from current age to life expectancy
      annualReturn,
      monthlyIncomeRate,
      retirementIncome
    );
    
    setCalculationResult({
      finalAmount: result.retirementAmount,
      yearlyValues: result.yearlyValues,
      monthlyIncome: result.monthlyIncome
    });
  };
  
  // Calcular projeção inicial na montagem do componente
  useEffect(() => {
    calculateProjection();
  }, []);

  const handleInitialAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    setInitialAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  const handleMonthlyAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    setMonthlyAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  const handleCurrentAgeChange = (value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      setCurrentAge(numericValue);
      // If retirement age is less than or equal to current age, adjust it
      if (retirementAge <= numericValue) {
        setRetirementAge(numericValue + 1);
      }
    }
  };

  const handleRetirementAgeChange = (value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > currentAge) {
      setRetirementAge(numericValue);
    }
  };
  
  const handleLifeExpectancyChange = (value: number) => {
    setLifeExpectancy(value);
  };
  
  const handleRetirementIncomeChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    setRetirementIncome(isNaN(numericValue) ? 0 : numericValue);
  };

  return {
    initialAmount,
    monthlyAmount,
    currentAge,
    retirementAge,
    lifeExpectancy,
    retirementIncome,
    objective,
    investorProfile,
    calculationResult,
    accumulationYears,
    handleInitialAmountChange,
    handleMonthlyAmountChange,
    handleCurrentAgeChange,
    handleRetirementAgeChange,
    handleLifeExpectancyChange,
    handleRetirementIncomeChange,
    setObjective,
    setInvestorProfile,
    calculateProjection
  };
};

export type { CalculationResult, InvestorProfile };
