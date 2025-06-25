import React, { Suspense, lazy } from 'react';
import { useCalculator } from './useCalculator';
import { OptimizedCalculatorForm } from './OptimizedCalculatorForm';
import { ResultsCards } from './ResultsCards';
import { InsightsCards } from './InsightsCards';
import { InvestorProfiles } from '@/components/InvestorProfiles';
import { Button } from '@/components/ui/button';
import { usePlanningData } from '@/hooks/usePlanningData';
import { useToast } from '@/hooks/use-toast';

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
  // Estado para controlar se o momento mágico está ativo
  const [isMagicMomentActive, setIsMagicMomentActive] = React.useState(false);
  
  const { toast } = useToast();
  
  // Ref para o container do gráfico
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  // Efeito para controlar scroll e cursor durante momento mágico
  React.useEffect(() => {
    if (isMagicMomentActive) {
      // Rolar para o gráfico e bloquear scroll
      if (chartRef.current) {
        chartRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      // Bloquear scroll do body e esconder cursor
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.cursor = 'none';
      document.documentElement.style.cursor = 'none';
    } else {
      // Liberar scroll e mostrar cursor quando momento mágico termina
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    }
    
    // Cleanup ao desmontar componente
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    };
  }, [isMagicMomentActive]);
  
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
    <div className="w-full space-y-20 mb-32 px-10">
      {/* Investor Profile Section - Hidden during magic moment */}
      <div className={`transition-all duration-300 ${
        isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'
      } mt-7`}>
        <InvestorProfiles onProfileSelect={setInvestorProfile} selectedProfile={investorProfile} />
      </div>

      {/* Parameters Section - Hidden during magic moment */}
      <div className={`mb-12 transition-all duration-300 ${
        isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'
      }`}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">Parâmetros</h3>
        </div>

        {/* Optimized Input Form */}
        <OptimizedCalculatorForm
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
      </div>
        
      {/* Insights Section - Hidden during magic moment */}
      <div className={`transition-all duration-300 ${
        isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'
      }`}>
        <InsightsCards
          initialAmount={initialAmount}
          monthlyAmount={monthlyAmount}
          currentAge={currentAge}
          retirementAge={retirementAge}
          lifeExpectancy={lifeExpectancy}
          retirementIncome={retirementIncome}
          portfolioReturn={portfolioReturn}
          investorProfile={investorProfile}
          possibleRetirementAge={possibleRetirementAge}
        />
      </div>

      {/* Lazy-loaded Chart */}
      <div className="mb-8" ref={chartRef}>
        <Suspense fallback={<ComponentLoader />}>
          <ChartComponent 
            data={calculationResult?.yearlyValues || []} 
            accumulationYears={accumulationYears}
            lifeExpectancy={lifeExpectancy}
            currentAge={currentAge}
            monthlyIncomeTarget={retirementIncome}
            portfolioReturn={portfolioReturn}
            onLifeExpectancyChange={handleLifeExpectancyChange} 
            showLifeExpectancyControl={true}
            monteCarloData={monteCarloResult}
            isCalculating={isCalculating}
            isMonteCarloEnabled={isMonteCarloEnabled}
            onMonteCarloToggle={handleMonteCarloToggle}
            initialAmount={initialAmount}
            monthlyAmount={monthlyAmount}
            retirementAge={retirementAge}
            retirementIncome={retirementIncome}
            investorProfile={investorProfile}
            calculationResult={calculationResult}
            onAnimationComplete={finishCalculation}
            onMagicMomentStateChange={setIsMagicMomentActive}
          />
        </Suspense>
      </div>

      {/* Results Cards - Hidden during magic moment */}
      <div className={`transition-all duration-300 ${
        isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'
      }`}>
        <ResultsCards
          calculationResult={calculationResult}
          retirementAge={retirementAge}
          lifeExpectancy={lifeExpectancy}
          initialAmount={initialAmount}
          monteCarloResult={monteCarloResult}
          isMonteCarloEnabled={isMonteCarloEnabled}
          currentAge={currentAge}
          portfolioReturn={portfolioReturn}
        />
      </div>

      {/* Lazy-loaded Recommendations Section - Hidden during magic moment */}
      <div className={`transition-all duration-300 ${
        isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'
      }`}>
        <Suspense fallback={<ComponentLoader />}>
          <Recommendations investorProfile={investorProfile} />
        </Suspense>
      </div>


    </div>
  );
};
