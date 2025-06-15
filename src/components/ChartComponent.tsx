
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
  calculationResult = null
}: ChartComponentProps) => {
  
  console.log('ChartComponent data:', data);
  console.log('ChartComponent Monte Carlo data:', monteCarloData);

  const { animationPhase, visiblePaths, pathOpacities } = useChartAnimation({
    isCalculating,
    isMonteCarloEnabled,
    monteCarloData
  });

  const { chartData } = useChartDataProcessor({
    data,
    currentAge,
    accumulationYears,
    initialAmount,
    monthlyAmount,
    monthlyIncomeTarget,
    monteCarloData,
    animationPhase,
    visiblePaths
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

  // Show projecting message
  if (animationPhase === 'projecting') {
    return (
      <ProjectingMessage
        lifeExpectancy={lifeExpectancy}
        possibleRetirementAge={possibleRetirementAge}
        isMonteCarloEnabled={isMonteCarloEnabled}
        onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
        onMonteCarloToggle={onMonteCarloToggle || (() => {})}
        showLifeExpectancyControl={showLifeExpectancyControl}
      />
    );
  }

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

  return (
    <div className="w-full">
      {/* Chart Section */}
      <ChartRenderer
        chartData={chartData}
        possibleRetirementAge={possibleRetirementAge}
        perpetuityWealth={perpetuityWealth}
        monteCarloData={monteCarloData}
        animationPhase={animationPhase}
        visiblePaths={visiblePaths}
        pathOpacities={pathOpacities}
      />
      
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
