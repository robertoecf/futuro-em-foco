
import { useCalculatorState } from './useCalculatorState';
import { useCalculatorHandlers } from './useCalculatorHandlers';
import { useCalculatorEffects } from './useCalculatorEffects';

export { type InvestorProfile, type CalculationResult } from './types';

export const useCalculator = () => {
  const state = useCalculatorState();

  // Calculate accumulation years based on current and retirement age
  const accumulationYears = state.retirementAge - state.currentAge;

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
    currentAge: state.currentAge,
    retirementAge: state.retirementAge,
    setInitialAmount: state.setInitialAmount,
    setMonthlyAmount: state.setMonthlyAmount,
    setCurrentAge: state.setCurrentAge,
    setRetirementAge: state.setRetirementAge,
    setLifeExpectancy: state.setLifeExpectancy,
    setRetirementIncome: state.setRetirementIncome,
    setPortfolioReturn: state.setPortfolioReturn,
    setInvestorProfile: state.setInvestorProfile,
    setIsMonteCarloEnabled: state.setIsMonteCarloEnabled,
    setIsCalculating: state.setIsCalculating,
    setMonteCarloResult: state.setMonteCarloResult
  });

  const { calculatePossibleRetirementAge, calculateProjection } = useCalculatorEffects({
    initialAmount: state.initialAmount,
    monthlyAmount: state.monthlyAmount,
    currentAge: state.currentAge,
    retirementAge: state.retirementAge,
    lifeExpectancy: state.lifeExpectancy,
    retirementIncome: state.retirementIncome,
    portfolioReturn: state.portfolioReturn,
    investorProfile: state.investorProfile,
    accumulationYears,
    isMonteCarloEnabled: state.isMonteCarloEnabled,
    sharedPlanData: state.sharedPlanData,
    setCalculationResult: state.setCalculationResult,
    setIsCalculating: state.setIsCalculating,
    setMonteCarloResult: state.setMonteCarloResult
  });

  const possibleRetirementAge = calculatePossibleRetirementAge();

  // Function to finish calculation (called when animation completes)
  const finishCalculation = () => {
    console.log('🏁 Animation finished - calculation complete');
    state.setIsCalculating(false);
  };

  return {
    ...state,
    possibleRetirementAge,
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
    calculateProjection,
    accumulationYears
  };
};
