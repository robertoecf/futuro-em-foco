import React, { useMemo, useState } from 'react';
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
  
  // State for chart settings
  const [showGrid, setShowGrid] = useState(true);

  const finalMonteCarloData = monteCarloData === undefined ? null : monteCarloData;

  const { animationPhase, isShowingLines, isShowing50Lines, isDrawingFinalLines } = useChartAnimation({
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

  // Chart is ready to render
  return (
    <div className="w-full">
      {/* Chart Title */}
      <div className="mb-6">
                  <h3 className="text-xl font-bold text-black">Gráfico de projeção patrimonial</h3>
      </div>

      {/* Controls Section - Always visible above the chart */}
      {(showLifeExpectancyControl || onMonteCarloToggle) && (
        <ChartControls
          lifeExpectancy={lifeExpectancy}
          possibleRetirementAge={possibleRetirementAge}
          isMonteCarloEnabled={isMonteCarloEnabled}
          onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
          onMonteCarloToggle={onMonteCarloToggle || (() => {})}
          showGrid={showGrid}
          onGridToggle={setShowGrid}
        />
      )}

      {/* Chart Section with Overlay */}
      <div className="relative">
        <div className="chart-container glass-panel">
          {/* Show projecting message OR chart renderer */}
          {isMonteCarloEnabled && animationPhase === 'projecting' ? (
            <ProjectingAnimation />
          ) : (
            <ChartRenderer
              chartData={chartData}
              possibleRetirementAge={possibleRetirementAge}
              perpetuityWealth={perpetuityWealth}
              monthlyIncomeTarget={monthlyIncomeTarget}
              monteCarloData={finalMonteCarloData}
              isShowingLines={isShowingLines}
              isShowing50Lines={isShowing50Lines}
              isDrawingFinalLines={isDrawingFinalLines}
              lineDrawingDuration={lineDrawingDuration}
              animationPhase={animationPhase}
              showGrid={showGrid}
            />
          )}
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

// Simple Snake Animation Component
const ProjectingAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        {/* Snake loading animation */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
                 <p className="text-lg font-medium text-black">Calculando possíveis resultados...</p>
         <p className="text-sm text-gray-800 mt-2">Calculando 1001 futuros possíveis</p>
      </div>
    </div>
  );
};

