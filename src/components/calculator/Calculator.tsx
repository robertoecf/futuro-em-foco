
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
        {/* Monte Carlo Toggle */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Simulação Probabilística</h3>
              <p className="text-xs text-gray-500">
                Ative para ver cenários baseados em risco e volatilidade (100 simulações Monte Carlo)
              </p>
            </div>
            <Button
              variant={isMonteCarloEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => handleMonteCarloToggle(!isMonteCarloEnabled)}
              className={isMonteCarloEnabled ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              {isMonteCarloEnabled ? "Ativado" : "Ativar"}
            </Button>
          </div>
        </div>

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
        <div className="chart-container h-[400px] mb-4">
          <ChartComponent 
            data={calculationResult?.yearlyValues || []} 
            accumulationYears={accumulationYears}
            lifeExpectancy={lifeExpectancy}
            currentAge={currentAge}
            monthlyIncomeTarget={calculationResult?.monthlyIncome || 0}
            portfolioReturn={portfolioReturn}
            onLifeExpectancyChange={handleLifeExpectancyChange} 
            showLifeExpectancyControl={false}
            monteCarloData={monteCarloResult}
            isCalculating={isCalculating}
          />
        </div>
        
        {/* Life Expectancy Control - Below Chart */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <div className="flex items-center justify-end space-x-2">
            <label htmlFor="life-expectancy" className="text-sm">Expectativa de vida (anos):</label>
            <input
              id="life-expectancy"
              type="number"
              value={lifeExpectancy}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  handleLifeExpectancyChange(value);
                }
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              min={retirementAge + 1}
            />
          </div>
        </div>
        
        {/* Insights Section */}
        <InsightsCards
          initialAmount={initialAmount}
          monthlyAmount={monthlyAmount}
          currentAge={currentAge}
          retirementAge={retirementAge}
          lifeExpectancy={lifeExpectancy}
          retirementIncome={retirementIncome}
          portfolioReturn={portfolioReturn}
          investorProfile={investorProfile}
        />
      </Card>

      {/* Recommendations Section */}
      <div>
        <Recommendations investorProfile={investorProfile} />
      </div>
    </div>
  );
};
