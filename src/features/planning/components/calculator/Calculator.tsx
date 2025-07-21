import React, { Suspense, lazy } from 'react';
import { useCalculator } from './useCalculator';
import { OptimizedCalculatorForm } from './OptimizedCalculatorForm';
import { ResultsCards } from './ResultsCards';
import { InsightsCards } from './InsightsCards';
import { InvestorProfiles } from '@/components/InvestorProfiles';
import { getAccumulationAnnualReturn } from './insights/insightsCalculations';

// Lazy load heavy components
const ChartComponent = lazy(() =>
  import('@/components/ChartComponent').then((module) => ({ default: module.ChartComponent }))
);
const Recommendations = lazy(() =>
  import('@/components/Recommendations').then((module) => ({ default: module.Recommendations }))
);

// Loading component for suspense
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export function Calculator() {
  const [isMagicMomentActive, setIsMagicMomentActive] = React.useState(false);
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isMagicMomentActive) {
      if (chartRef.current) {
        chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.cursor = 'none';
      document.documentElement.style.cursor = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    }
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
    handleInvestorProfileChange,
    handleMonteCarloToggle,
    crisisFrequency,
    setCrisisFrequency,
    crisisMeanImpact,
    setCrisisMeanImpact,
  } = useCalculator();

  // Cálculo correto da idade possível de independência financeira (igual ao useInsightsData)
  const accumulationAnnualReturn = getAccumulationAnnualReturn(investorProfile);
  const calculateCorrectPossibleRetirementAge = () => {
    if (retirementIncome <= 0) return retirementAge;
    const requiredWealth = (retirementIncome * 12) / (portfolioReturn / 100);
    const monthlyReturn = Math.pow(1 + accumulationAnnualReturn, 1 / 12) - 1;
    let balance = initialAmount;
    let years = 0;
    const maxYears = 50;
    while (balance < requiredWealth && years < maxYears) {
      for (let month = 0; month < 12; month++) {
        balance += monthlyAmount;
        balance *= 1 + monthlyReturn;
      }
      years++;
    }
    return currentAge + years;
  };
  const correctPossibleRetirementAge = calculateCorrectPossibleRetirementAge();

  return (
    <div className="w-[90%] mx-auto space-y-12 sm:space-y-20 mb-16 sm:mb-32">
      <div
        className={`transition-all duration-300 ${isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'} mt-7`}
      >
        <InvestorProfiles
          onProfileSelect={handleInvestorProfileChange}
          selectedProfile={investorProfile}
        />
      </div>
      <div
        className={`mb-12 transition-all duration-300 ${isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'}`}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white">Parâmetros</h3>
        </div>
        <OptimizedCalculatorForm
          {...{
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
            handleInvestorProfileChange,
          }}
        />
      </div>
      <div
        className={`transition-all duration-300 ${isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'}`}
      >
        <InsightsCards
          {...{
            initialAmount,
            monthlyAmount,
            currentAge,
            retirementAge,
            lifeExpectancy,
            retirementIncome,
            portfolioReturn,
            investorProfile,
            possibleRetirementAge,
          }}
        />
      </div>
      <div className="mb-8" ref={chartRef}>
        <Suspense fallback={<ComponentLoader />}>
          <ChartComponent
            {...{
              data: calculationResult?.yearlyValues || [],
              accumulationYears,
              lifeExpectancy,
              currentAge,
              monthlyIncomeTarget: retirementIncome,
              portfolioReturn,
              onLifeExpectancyChange: handleLifeExpectancyChange,
              showLifeExpectancyControl: true,
              monteCarloData: monteCarloResult,
              isCalculating,
              isMonteCarloEnabled,
              onMonteCarloToggle: handleMonteCarloToggle,
              initialAmount,
              monthlyAmount,
              retirementAge,
              retirementIncome,
              investorProfile,
              calculationResult,
              onAnimationComplete: finishCalculation,
              onMagicMomentStateChange: setIsMagicMomentActive,
              crisisFrequency,
              onCrisisFrequencyChange: setCrisisFrequency,
              crisisMeanImpact,
              onCrisisMeanImpactChange: setCrisisMeanImpact,
              possibleRetirementAge: correctPossibleRetirementAge, // NOVO: valor sincronizado
            }}
          />
        </Suspense>
      </div>
      <div
        className={`transition-all duration-300 ${isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'}`}
      >
        <ResultsCards
          {...{
            calculationResult,
            retirementAge,
            lifeExpectancy,
            initialAmount,
            monteCarloResult,
            isMonteCarloEnabled,
            currentAge,
            portfolioReturn,
          }}
        />
      </div>
      <div
        className={`transition-all duration-300 ${isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'}`}
      >
        <Suspense fallback={<ComponentLoader />}>
          <Recommendations investorProfile={investorProfile} />
        </Suspense>
      </div>
    </div>
  );
}
