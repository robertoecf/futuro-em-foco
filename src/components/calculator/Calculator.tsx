
import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { useCalculator } from './useCalculator';
import { OptimizedCalculatorForm } from './OptimizedCalculatorForm';
import { ResultsCards } from './ResultsCards';
import { InsightsCards } from './InsightsCards';
import { InvestorProfiles } from '@/components/InvestorProfiles';

// Lazy load heavy components
const ChartComponent = lazy(() => import('@/components/ChartComponent').then(module => ({ default: module.ChartComponent })));
const Recommendations = lazy(() => import('@/components/Recommendations').then(module => ({ default: module.Recommendations })));

// Loading component for suspense
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
    finishCalculation,
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

      <Card className="p-6 shadow-lg glass-card">
        {/* Parameters Section Title */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Parâmetros</h3>
        </div>

        {/* Optimized Input Form */}
        <OptimizedCalculatorForm
          initialAmount={initialAmount}
          monthlyAmount={monthlyAmount}
          currentAge={currentAge}
          retirementAge={possibleRetirementAge}
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
        
        {/* Insights Section */}
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

        {/* Lazy-loaded Chart */}
        <div className="mb-8">
          <Suspense fallback={<ComponentLoader />}>
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
              onAnimationComplete={finishCalculation}
            />
          </Suspense>
        </div>

        {/* Results Cards */}
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

      {/* Lazy-loaded Recommendations Section */}
      <Suspense fallback={<ComponentLoader />}>
        <Recommendations investorProfile={investorProfile} />
      </Suspense>
    </div>
  );
};
