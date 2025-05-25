
import React from 'react';
import { Card } from '@/components/ui/card';
import { useCalculator } from './useCalculator';
import { CalculatorForm } from './CalculatorForm';
import { ResultsCards } from './ResultsCards';
import { ChartComponent } from '@/components/ChartComponent';

export const Calculator: React.FC = () => {
  const {
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
    setInvestorProfile
  } = useCalculator();
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="p-6 shadow-lg">
        {/* Input Form - Two Panels Side by Side */}
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
        
        {/* Results Cards - Horizontal Layout */}
        <ResultsCards
          calculationResult={calculationResult}
          retirementAge={retirementAge}
          lifeExpectancy={lifeExpectancy}
          initialAmount={initialAmount}
        />
        
        {/* Chart - Full Width */}
        <div className="chart-container h-[400px]">
          <ChartComponent 
            data={calculationResult?.yearlyValues || []} 
            accumulationYears={accumulationYears}
            lifeExpectancy={lifeExpectancy}
            currentAge={currentAge}
            onLifeExpectancyChange={handleLifeExpectancyChange} 
          />
        </div>
      </Card>
    </div>
  );
};
