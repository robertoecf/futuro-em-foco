
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCalculator } from './useCalculator';
import { CalculatorForm } from './CalculatorForm';
import { ResultsCards } from './ResultsCards';
import { InsightsCards } from './InsightsCards';
import { ChartComponent } from '@/components/ChartComponent';
import { InvestorProfiles } from '@/components/InvestorProfiles';
import { Recommendations } from '@/components/Recommendations';

export const Calculator: React.FC = () => {
  const {
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
    handleInitialAmountBlur,
    handleMonthlyAmountBlur,
    handleCurrentAgeBlur,
    handleRetirementAgeBlur,
    handleLifeExpectancyChange,
    handleRetirementIncomeBlur,
    handlePortfolioReturnBlur,
    setInvestorProfile,
    handleMonteCarloToggle
  } = useCalculator();
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-16">
      {/* Investor Profile Section */}
      <div>
        <InvestorProfiles onProfileSelect={setInvestorProfile} selectedProfile={investorProfile} />
      </div>

      <Card className="p-6 shadow-lg">
        {/* Parameters Section Title */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Parâmetros</h3>
        </div>

        {/* Input Form - Two Panels Side by Side */}
        <CalculatorForm
          initialAmount={initialAmount}
          monthlyAmount={monthlyAmount}
          currentAge={currentAge}
          retirementAge={possibleRetirementAge} // Use calculated possible retirement age
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
        
        {/* Insights Section - Moved above the chart */}
        <InsightsCards
          initialAmount={initialAmount}
          monthlyAmount={monthlyAmount}
          currentAge={currentAge}
          retirementAge={possibleRetirementAge}
          lifeExpectancy={lifeExpectancy}
          retirementIncome={retirementIncome}
          portfolioReturn={portfolioReturn}
          investorProfile={investorProfile}
        />

        {/* Chart - Full Width with integrated controls and information */}
        <div className="mb-8">
          <ChartComponent 
            data={calculationResult?.yearlyValues || []} 
            accumulationYears={accumulationYears}
            lifeExpectancy={lifeExpectancy}
            currentAge={currentAge}
            monthlyIncomeTarget={calculationResult?.monthlyIncome || 0}
            portfolioReturn={portfolioReturn}
            onLifeExpectancyChange={handleLifeExpectancyChange} 
            showLifeExpectancyControl={true}
            monteCarloData={monteCarloResult}
            isCalculating={isCalculating}
            isMonteCarloEnabled={isMonteCarloEnabled}
            onMonteCarloToggle={handleMonteCarloToggle}
            initialAmount={initialAmount}
            monthlyAmount={monthlyAmount}
            retirementAge={possibleRetirementAge}
            retirementIncome={retirementIncome}
            investorProfile={investorProfile}
            calculationResult={calculationResult}
          />
        </div>

        {/* Results Cards - Now below the chart */}
        <ResultsCards
          calculationResult={calculationResult}
          retirementAge={possibleRetirementAge}
          lifeExpectancy={lifeExpectancy}
          initialAmount={initialAmount}
          monteCarloResult={monteCarloResult}
          isMonteCarloEnabled={isMonteCarloEnabled}
          currentAge={currentAge}
          portfolioReturn={portfolioReturn}
        />
      </Card>

      {/* Recommendations Section */}
      <div>
        <Recommendations investorProfile={investorProfile} />
      </div>
    </div>
  );
};
