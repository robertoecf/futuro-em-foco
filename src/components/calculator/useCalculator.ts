
import { useCalculatorState } from './useCalculatorState';
import { useCalculatorHandlers } from './useCalculatorHandlers';
import { useCalculatorEffects } from './useCalculatorEffects';

export { type InvestorProfile, type CalculationResult } from './types';

export const useCalculator = () => {
  const {
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
  } = useCalculatorState();

  // Calculate accumulation years based on current and retirement age
  const accumulationYears = retirementAge - currentAge;

  const {
    handleMonteCarloToggle,
    handleInitialAmountBlur,
    handleMonthlyAmountBlur,
    handleCurrentAgeBlur,
    handleRetirementAgeBlur,
    handleLifeExpectancyChange,
    handleRetirementIncomeBlur,
    handlePortfolioReturnBlur,
    handleInvestorProfileChange
  } = useCalculatorHandlers({
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
  });

  const { calculatePossibleRetirementAge, calculateProjection } = useCalculatorEffects({
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
  });

  const possibleRetirementAge = calculatePossibleRetirementAge();

  // Function to finish calculation (called when animation completes)
  const finishCalculation = () => {
    console.log('🏁 Animation finished - calculation complete');
    setIsCalculating(false);
  };

  return {
    initialAmount,
    monthlyAmount,
    currentAge,
    retirementAge,
    possibleRetirementAge,
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile,
    calculationResult,
    accumulationYears,
    isMonteCarloEnabled,
    monteCarloResult,
    isCalculating,
    finishCalculation,
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
