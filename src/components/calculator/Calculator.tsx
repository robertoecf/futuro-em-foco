import React, { Suspense, lazy, memo } from 'react';
import { useCalculator } from './hooks/useCalculator';
import { OptimizedCalculatorForm } from './OptimizedCalculatorForm';
import { ResultsCards } from './ResultsCards';
import { InsightsCards } from './InsightsCards';
import { InvestorProfiles } from '@/components/InvestorProfiles';

// Enhanced lazy loading with preloading capabilities
const ChartComponent = lazy(() => 
  import('@/components/ChartComponent').then(module => ({ 
    default: module.ChartComponent 
  }))
);

const Recommendations = lazy(() => 
  import('@/components/Recommendations').then(module => ({ 
    default: module.Recommendations 
  }))
);

// Additional lazy-loaded components for better performance
const MatrixRain = lazy(() =>
  import('@/components/MatrixRain').then(module => ({
    default: module.MatrixRain
  }))
);

// LeadCaptureForm removed - requires specific props setup

// Enhanced loading components with skeleton states
const ChartLoader = memo(() => (
  <div className="flex items-center justify-center p-8 bg-slate-900/50 rounded-lg">
    <div className="space-y-4 w-full">
      {/* Chart skeleton */}
      <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
      <div className="h-64 bg-slate-700 rounded animate-pulse"></div>
      <div className="flex space-x-4">
        <div className="h-3 bg-slate-700 rounded w-1/4 animate-pulse"></div>
        <div className="h-3 bg-slate-700 rounded w-1/4 animate-pulse"></div>
        <div className="h-3 bg-slate-700 rounded w-1/4 animate-pulse"></div>
      </div>
    </div>
  </div>
));

const RecommendationsLoader = memo(() => (
  <div className="space-y-4 p-6 bg-slate-900/50 rounded-lg">
    <div className="h-6 bg-slate-700 rounded w-1/2 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-3 p-4 bg-slate-800 rounded">
          <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-slate-700 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-slate-700 rounded w-2/3 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
));

const ComponentLoader = memo(() => (
  <div className="flex items-center justify-center p-8">
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  </div>
));

// Enhanced error boundary component
const LazyLoadErrorBoundary = memo(({ children, fallback }: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
        <p className="text-sm">
          Erro ao carregar componente. 
          <button 
            onClick={() => setHasError(false)}
            className="ml-2 underline hover:text-red-200"
          >
            Tentar novamente
          </button>
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={fallback || <ComponentLoader />}>
      {children}
    </Suspense>
  );
});

// Preload critical components
const preloadComponents = () => {
  // Preload chart component after 2 seconds
  setTimeout(() => {
    import('@/components/ChartComponent');
  }, 2000);
  
  // Preload recommendations after 5 seconds
  setTimeout(() => {
    import('@/components/Recommendations');
  }, 5000);
};

// Component display names
ChartLoader.displayName = 'ChartLoader';
RecommendationsLoader.displayName = 'RecommendationsLoader';
ComponentLoader.displayName = 'ComponentLoader';
LazyLoadErrorBoundary.displayName = 'LazyLoadErrorBoundary';

export const Calculator: React.FC = memo(() => {
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
    isMonteCarloEnabled,
    monteCarloResult,
    isCalculating,
    possibleRetirementAge,
    accumulationYears,
    handleInitialAmountBlur,
    handleMonthlyAmountBlur,
    handleCurrentAgeBlur,
    handleRetirementAgeBlur,
    handleLifeExpectancyChange,
    handleRetirementIncomeBlur,
    handlePortfolioReturnBlur,
    handleInvestorProfileChange,
    handleMonteCarloToggle
  } = useCalculator();

  // Preload components on mount
  React.useEffect(() => {
    preloadComponents();
  }, []);

  const [isMagicMomentActive, setIsMagicMomentActive] = React.useState(false);
  const [showMatrixRain, setShowMatrixRain] = React.useState(false);

  // Handle magic moment state changes
  const handleMagicMomentStateChange = React.useCallback((isActive: boolean) => {
    setIsMagicMomentActive(isActive);
    
    // Show matrix rain during magic moment with delay
    if (isActive) {
      setTimeout(() => setShowMatrixRain(true), 500);
    } else {
      setShowMatrixRain(false);
    }
  }, []);

  // Monte Carlo results should be shown after calculation is complete and Magic Moment has finished
  const showMonteCarloResults = React.useMemo(() => 
    isMonteCarloEnabled && !!monteCarloResult && !isCalculating && !isMagicMomentActive,
    [isMonteCarloEnabled, monteCarloResult, isCalculating, isMagicMomentActive]
  );

  return (
    <div className="space-y-8 relative">
             {/* Matrix Rain Effect - Lazy loaded */}
       {showMatrixRain && (
         <LazyLoadErrorBoundary fallback={null}>
           <MatrixRain isActive={showMatrixRain} />
         </LazyLoadErrorBoundary>
       )}

      {/* Calculator Form */}
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
        setInvestorProfile={handleInvestorProfileChange}
      />

      {/* Investor Profiles */}
      <InvestorProfiles
        selectedProfile={investorProfile}
        onProfileSelect={handleInvestorProfileChange}
      />

      {/* Results Section - Always visible */}
      {calculationResult && (
        <div className={`transition-all duration-300 ease-in-out ${
          isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'
        }`}>
          <ResultsCards
            calculationResult={calculationResult}
            retirementAge={possibleRetirementAge}
            lifeExpectancy={lifeExpectancy}
            initialAmount={initialAmount}
            monteCarloResult={monteCarloResult}
            isMonteCarloEnabled={isMonteCarloEnabled}
            currentAge={currentAge}
            portfolioReturn={portfolioReturn}
            showMonteCarloResults={showMonteCarloResults}
          />
        </div>
      )}

      {/* Chart Section - Lazy loaded with enhanced loading */}
      {calculationResult && (
        <LazyLoadErrorBoundary fallback={<ChartLoader />}>
          <ChartComponent
            data={calculationResult.yearlyValues}
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
            onMagicMomentStateChange={handleMagicMomentStateChange}
          />
        </LazyLoadErrorBoundary>
      )}

             {/* Insights Cards - Only after calculations */}
       {calculationResult && !isMagicMomentActive && (
         <div className="transition-opacity duration-300">
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
         </div>
       )}

      {/* Recommendations Section - Lazy loaded with enhanced loading */}
      <div className={`transition-all duration-300 ease-in-out ${
        isMagicMomentActive ? 'invisible pointer-events-none' : 'visible'
      }`}>
        <LazyLoadErrorBoundary fallback={<RecommendationsLoader />}>
          <Recommendations investorProfile={investorProfile} />
        </LazyLoadErrorBoundary>
      </div>

             {/* Lead Capture Form removed - requires specific props setup */}
    </div>
  );
});

Calculator.displayName = 'Calculator';
