
import React from 'react';
import { Card } from '@/components/ui/card';
import { useCalculator } from './useCalculator';
import { CalculatorForm } from './CalculatorForm';
import { CalculatorResults } from './CalculatorResults';

export const Calculator: React.FC = () => {
  const {
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
  } = useCalculator();
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CalculatorForm
            initialAmount={initialAmount}
            monthlyAmount={monthlyAmount}
            currentAge={currentAge}
            retirementAge={retirementAge}
            retirementIncome={retirementIncome}
            objective={objective}
            investorProfile={investorProfile}
            handleInitialAmountChange={handleInitialAmountChange}
            handleMonthlyAmountChange={handleMonthlyAmountChange}
            handleCurrentAgeChange={handleCurrentAgeChange}
            handleRetirementAgeChange={handleRetirementAgeChange}
            handleRetirementIncomeChange={handleRetirementIncomeChange}
            setObjective={setObjective}
            setInvestorProfile={setInvestorProfile}
            calculateProjection={calculateProjection}
          />
          
          <CalculatorResults
            calculationResult={calculationResult}
            accumulationYears={accumulationYears}
            lifeExpectancy={lifeExpectancy}
            currentAge={currentAge}
            retirementAge={retirementAge}
            initialAmount={initialAmount}
            handleLifeExpectancyChange={handleLifeExpectancyChange}
          />
        </div>
      </Card>
    </div>
  );
};
