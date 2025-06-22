import React, { useMemo, useState, useEffect } from 'react';
import { ChartControls } from './chart/ChartControls';
import { ChartInfo, ChartVisibilityState } from './chart/ChartInfo';
import { calculatePossibleRetirementAge } from './chart/utils/chartUtils';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';
import { MonteCarloResult } from '@/lib/utils';
import { useChartAnimation } from './chart/ChartAnimationStates';
import { useChartDataProcessor } from './chart/ChartDataProcessor';
import { ChartRenderer } from './chart/ChartRenderer';
// ProjectingMessage removed as it's not used in this component

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
  onMagicMomentStateChange?: (isActive: boolean) => void;
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
  onMagicMomentStateChange,
  lineDrawingDuration = 2000
}: ChartComponentProps) => {
  
  // State for chart settings
  const [showGrid, setShowGrid] = useState(false);
  const [chartVisibility, setChartVisibility] = useState<ChartVisibilityState>({
    scenarios: {
      optimistic: true,
      neutral: true,
      pessimistic: true,
      totalSaved: true,
      patrimony: true
    },
    references: {
      financialIndependence: false,
      perpetuityWealth: false
    }
  });

  const finalMonteCarloData = monteCarloData === undefined ? null : monteCarloData;

  const { animationPhase, isShowingLines, isShowing50Lines, isDrawingFinalLines } = useChartAnimation({
    isCalculating,
    isMonteCarloEnabled,
    monteCarloData: finalMonteCarloData,
    onAnimationComplete
  });

  // Comunicar estado do momento mágico ao componente pai
  useEffect(() => {
    const isMagicMomentActive = isMonteCarloEnabled && 
      (animationPhase === 'projecting' || animationPhase === 'paths' || 
       animationPhase === 'optimizing' || animationPhase === 'drawing-final');
    
    if (onMagicMomentStateChange) {
      onMagicMomentStateChange(isMagicMomentActive);
    }
  }, [animationPhase, isMonteCarloEnabled, onMagicMomentStateChange]);

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
      {/* Chart Title - Hidden during magic moment but maintains layout */}
      <div className="mb-6">
        <h3 className={`text-xl font-bold text-white ${
          (animationPhase === 'projecting' || animationPhase === 'paths' || 
           animationPhase === 'optimizing' || animationPhase === 'drawing-final') 
           ? 'invisible' : 'visible'
        }`}>
          Gráfico de projeção patrimonial
        </h3>
      </div>

      {/* Controls Section - Hidden during magic moment but maintains layout */}
      {(showLifeExpectancyControl || onMonteCarloToggle) && (
        <div className={`mb-6 ${
          (animationPhase === 'projecting' || animationPhase === 'paths' || 
           animationPhase === 'optimizing' || animationPhase === 'drawing-final') 
           ? 'invisible pointer-events-none' : 'visible'
        }`}>
          <ChartControls
            lifeExpectancy={lifeExpectancy}
            possibleRetirementAge={possibleRetirementAge}
            isMonteCarloEnabled={isMonteCarloEnabled}
            onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
            onMonteCarloToggle={onMonteCarloToggle || (() => {})}
            showGrid={showGrid}
            onGridToggle={setShowGrid}
          />
        </div>
      )}

      {/* Chart Section with Overlay */}
      <div className="relative">
        <div className="chart-container">
          {/* Show projecting message for CENA 1 e CENA 3 OR chart renderer */}
          {isMonteCarloEnabled && (animationPhase === 'projecting' || animationPhase === 'optimizing') ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {/* Aurora circular loading animation - MESMO FORMATO PARA AMBAS AS CENAS */}
                <div className="relative mb-8">
                  <div className="aurora-loader">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div
                        key={i}
                        className="aurora-dot"
                        style={{
                          '--rotation': `${i * 30}deg`,
                          '--delay': `${i * 0.1}s`
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="animate-pulse">
                  <p className="text-lg font-medium text-white">
                    {animationPhase === 'projecting' ? 'Calculando possíveis resultados...' : 'Otimizando exibição...'}
                  </p>
                  <p className="text-sm text-white mt-2">
                    {animationPhase === 'projecting' 
                      ? 'Analisando mil cenários diferentes baseados em risco e volatilidade'
                      : 'Preparando visualização dos caminhos mais prováveis'
                    }
                  </p>
                </div>
              </div>
            </div>
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
              visibility={chartVisibility}
            />
          )}
        </div>
      </div>
      
      {/* Information Section - Hidden during magic moment but maintains layout */}
      <div className={`mt-6 ${
        (animationPhase === 'projecting' || animationPhase === 'paths' || 
         animationPhase === 'optimizing' || animationPhase === 'drawing-final') 
         ? 'invisible pointer-events-none' : 'visible'
      }`}>
        <ChartInfo
          monteCarloData={finalMonteCarloData}
          perpetuityWealth={perpetuityWealth}
          possibleRetirementAge={possibleRetirementAge}
          onVisibilityChange={setChartVisibility}
        />
      </div>

      {/* Debug panel removed for cleaner UI */}
    </div>
  );
});



