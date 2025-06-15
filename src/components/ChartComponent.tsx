
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
}

export const ChartComponent = ({ 
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
  onAnimationComplete
}: ChartComponentProps) => {
  
  console.log('ChartComponent data:', data);
  console.log('ChartComponent Monte Carlo data:', monteCarloData);
  console.log('ChartComponent isCalculating:', isCalculating);
  console.log('ChartComponent isMonteCarloEnabled:', isMonteCarloEnabled);

  const { animationPhase, isShowingLines } = useChartAnimation({
    isCalculating,
    isMonteCarloEnabled,
    monteCarloData,
    onAnimationComplete
  });

  const { chartData } = useChartDataProcessor({
    data,
    currentAge,
    accumulationYears,
    initialAmount,
    monthlyAmount,
    monthlyIncomeTarget,
    monteCarloData,
    isMonteCarloEnabled
  });

  const possibleRetirementAge = calculatePossibleRetirementAge(
    data,
    monthlyIncomeTarget,
    portfolioReturn,
    currentAge,
    accumulationYears
  );
  
  // Calculate perpetuity wealth based on retirement return and desired income
  const perpetuityWealth = monthlyIncomeTarget > 0 ? 
    (monthlyIncomeTarget * 12) / (portfolioReturn / 100) : 0;

  console.log('ChartComponent animationPhase:', animationPhase);
  console.log('ChartComponent isShowingLines:', isShowingLines);

  const planningInputs = {
    initialAmount,
    monthlyAmount,
    currentAge,
    retirementAge,
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile
  };

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

  return (
    <div className="w-full">
      {/* Chart Section with Overlay */}
      <div className="relative">
        <ChartRenderer
          chartData={chartData}
          possibleRetirementAge={possibleRetirementAge}
          perpetuityWealth={perpetuityWealth}
          monteCarloData={monteCarloData}
          isShowingLines={isShowingLines}
        />
        
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

      {/* Controls Section - Now below the chart */}
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
        monteCarloData={monteCarloData}
        perpetuityWealth={perpetuityWealth}
        possibleRetirementAge={possibleRetirementAge}
      />
    </div>
  );
};
