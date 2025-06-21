import React, { useMemo } from 'react';
import { ChartControls } from './chart/ChartControls';
import { ChartInfo } from './chart/ChartInfo';
import { ExportButton } from './chart/ExportButton';
import { calculatePossibleRetirementAge } from './chart/chartUtils';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';
import { MonteCarloResult } from '@/lib/utils';
import { useChartAnimation } from './chart/ChartAnimationStates';
import { useChartDataProcessor } from './chart/ChartDataProcessor';
import { ChartRenderer } from './chart/ChartRenderer';
import { ProjectingMessage } from './chart/ProjectingMessage';
import { ProjectingOverlay } from './chart/ProjectingOverlay';
import { MagicMomentDebugPanel } from './chart/MagicMomentDebugPanel';

interface ChartComponentProps {
  data: number[];
  accumulationYears: number;
  lifeExpectancy: number;
  currentAge: number;
  monthlyIncomeTarget?: number;
  portfolioReturn?: number;
  onLifeExpectancyChange?: (value: number) => void;
  showLifeExpectancyControl?: boolean;
  monteCarloData?: MonteCarloResult | null;
  isCalculating?: boolean;
  isMonteCarloEnabled?: boolean;
  onMonteCarloToggle?: (enabled: boolean) => void;
  initialAmount?: number;
  monthlyAmount?: number;
  retirementAge?: number;
  retirementIncome?: number;
  investorProfile?: InvestorProfile;
  calculationResult?: CalculationResult | null;
  onAnimationComplete?: () => void;
  lineDrawingDuration?: number;
}

export const ChartComponent = React.memo(({ 
  data, 
  accumulationYears, 
  lifeExpectancy = 100,
  currentAge = 30,
  monthlyIncomeTarget = 0,
  portfolioReturn = 4,
  onLifeExpectancyChange,
  showLifeExpectancyControl = true,
  monteCarloData,
  isCalculating = false,
  isMonteCarloEnabled = false,
  onMonteCarloToggle,
  initialAmount = 0,
  monthlyAmount = 0,
  retirementAge = 65,
  retirementIncome = 0,
  investorProfile = 'moderado',
  calculationResult = null,
  onAnimationComplete,
  lineDrawingDuration = 2000
}: ChartComponentProps) => {
  

  const finalMonteCarloData = monteCarloData === undefined ? null : monteCarloData;

  const { animationPhase, isShowingLines, isShowing50Lines, isDrawingFinalLines, getDebugReport } = useChartAnimation({
    isCalculating,
    isMonteCarloEnabled,
    monteCarloData: finalMonteCarloData,
    onAnimationComplete
  });

  const { chartData } = useChartDataProcessor({
    data,
    currentAge,
    accumulationYears,
    initialAmount,
    monthlyAmount,
    monthlyIncomeTarget,
    monteCarloData: finalMonteCarloData,
    isMonteCarloEnabled
  });

  const possibleRetirementAge = useMemo(() => calculatePossibleRetirementAge(
    data,
    monthlyIncomeTarget,
    portfolioReturn,
    currentAge,
    accumulationYears
  ), [data, monthlyIncomeTarget, portfolioReturn, currentAge, accumulationYears]);
  
  // Calculate perpetuity wealth based on retirement return and desired income
  const perpetuityWealth = useMemo(() => monthlyIncomeTarget > 0 ? 
    (monthlyIncomeTarget * 12) / (portfolioReturn / 100) : 0,
    [monthlyIncomeTarget, portfolioReturn]
  );


  const planningInputs = useMemo(() => ({
    initialAmount,
    monthlyAmount,
    currentAge,
    retirementAge,
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile
  }), [initialAmount, monthlyAmount, currentAge, retirementAge, lifeExpectancy, retirementIncome, portfolioReturn, investorProfile]);

  // Show projecting message ONLY during projecting phase
  if (isMonteCarloEnabled && animationPhase === 'projecting') {
    return (
      <div className="w-full">
        <ProjectingMessage
          phase="projecting"
          lifeExpectancy={lifeExpectancy}
          possibleRetirementAge={possibleRetirementAge}
          onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
          showLifeExpectancyControl={showLifeExpectancyControl}
        />
      </div>
    );
  }

  // Chart is ready to render

  return (
    <div className="w-full">
      {/* Chart Title */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Gráfico de projeção patrimonial</h3>
      </div>

      {/* Chart Section with Overlay */}
      <div className="relative">
        <div className="chart-container">
          <ChartRenderer
            chartData={chartData}
            possibleRetirementAge={possibleRetirementAge}
            perpetuityWealth={perpetuityWealth}
            monteCarloData={finalMonteCarloData}
            isShowingLines={isShowingLines}
            isShowing50Lines={isShowing50Lines}
            isDrawingFinalLines={isDrawingFinalLines}
            lineDrawingDuration={lineDrawingDuration}
          />
        </div>
        
        {/* Optimizing Overlay */}
        <ProjectingOverlay isVisible={animationPhase === 'optimizing'} />
      </div>
      
      {/* Export Button - positioned at bottom right of chart */}
      <div className="relative">
        <div className="absolute -top-12 right-4">
          <ExportButton
            chartData={chartData}
            planningInputs={planningInputs}
            calculationResult={calculationResult}
          />
        </div>
      </div>

      {/* Controls Section - Now above the chart info */}
      {(showLifeExpectancyControl || onMonteCarloToggle) && (
        <ChartControls
          lifeExpectancy={lifeExpectancy}
          possibleRetirementAge={possibleRetirementAge}
          isMonteCarloEnabled={isMonteCarloEnabled}
          onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
          onMonteCarloToggle={onMonteCarloToggle || (() => {})}
        />
      )}
      
      {/* Information Section */}
      <ChartInfo
        monteCarloData={finalMonteCarloData}
        perpetuityWealth={perpetuityWealth}
        possibleRetirementAge={possibleRetirementAge}
      />

      {/* Debug panel removed for cleaner UI */}
    </div>
  );
});
