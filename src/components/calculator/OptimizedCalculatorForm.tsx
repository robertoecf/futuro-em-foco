
import React, { memo } from 'react';
import { CalculatorForm } from './CalculatorForm';
import type { InvestorProfile } from './types';

interface OptimizedCalculatorFormProps {
  initialAmount: number;
  monthlyAmount: number;
  currentAge: number;
  retirementAge: number;
  retirementIncome: number;
  portfolioReturn: number;
  investorProfile: InvestorProfile;
  handleInitialAmountBlur: (value: string) => void;
  handleMonthlyAmountBlur: (value: string) => void;
  handleCurrentAgeBlur: (value: string) => void;
  handleRetirementAgeBlur: (value: string) => void;
  handleRetirementIncomeBlur: (value: string) => void;
  handlePortfolioReturnBlur: (value: string) => void;
  setInvestorProfile: (profile: InvestorProfile) => void;
}

// Memoized form component to prevent unnecessary re-renders
export const OptimizedCalculatorForm = memo<OptimizedCalculatorFormProps>(({
  initialAmount,
  monthlyAmount,
  currentAge,
  retirementAge,
  retirementIncome,
  portfolioReturn,
  investorProfile,
  handleInitialAmountBlur,
  handleMonthlyAmountBlur,
  handleCurrentAgeBlur,
  handleRetirementAgeBlur,
  handleRetirementIncomeBlur,
  handlePortfolioReturnBlur,
  setInvestorProfile
}) => {
  return (
    <CalculatorForm
      initialAmount={initialAmount}
      monthlyAmount={monthlyAmount}
      currentAge={currentAge}
      retirementAge={retirementAge}
      retirementIncome={retirementIncome}
      portfolioReturn={portfolioReturn}
      investorProfile={investorProfile}
      handleInitialAmountBlur={handleInitialAmountBlur}
      handleMonthlyAmountBlur={handleMonthlyAmountBlur}
      handleCurrentAgeBlur={handleCurrentAgeBlur}
      handleRetirementAgeBlur={handleRetirementAgeBlur}
      handleRetirementIncomeBlur={handleRetirementIncomeBlur}
      handlePortfolioReturnBlur={handlePortfolioReturnBlur}
      setInvestorProfile={setInvestorProfile}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.initialAmount === nextProps.initialAmount &&
    prevProps.monthlyAmount === nextProps.monthlyAmount &&
    prevProps.currentAge === nextProps.currentAge &&
    prevProps.retirementAge === nextProps.retirementAge &&
    prevProps.retirementIncome === nextProps.retirementIncome &&
    prevProps.portfolioReturn === nextProps.portfolioReturn &&
    prevProps.investorProfile === nextProps.investorProfile
  );
});

OptimizedCalculatorForm.displayName = 'OptimizedCalculatorForm';
