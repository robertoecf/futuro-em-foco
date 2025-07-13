import React, { useState, useMemo, useEffect } from 'react';
import { ChartControls } from './chart/ChartControls';
import { ChartRenderer } from './chart/ChartRenderer';
import { ChartInfo } from './chart/ChartInfo';
import { useChartDataProcessor } from './chart/ChartDataProcessor';
import { useChartAnimation } from './chart/ChartAnimationStates';
import type { MonteCarloResult } from '@/lib/utils';

import type { ChartVisibilityState } from './chart/ChartInfo';
import AuroraLoader from '@/components/ui/AuroraLoader';

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

  onAnimationComplete?: () => void;
  onMagicMomentStateChange?: (isActive: boolean) => void;
  lineDrawingDuration?: number;
  crisisFrequency?: number;
  onCrisisFrequencyChange?: (value: number) => void;
  crisisMeanImpact?: number;
  onCrisisMeanImpactChange?: (value: number) => void;
}

export const ChartComponent = React.memo(
  ({
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
    retirementAge,
    onAnimationComplete,
    onMagicMomentStateChange,
    lineDrawingDuration = 2000,
    crisisFrequency,
    onCrisisFrequencyChange,
    crisisMeanImpact,
    onCrisisMeanImpactChange,
  }: ChartComponentProps) => {
    // State for chart settings
    const [showGrid, setShowGrid] = useState(false);
    const [chartVisibility, setChartVisibility] = useState<ChartVisibilityState>({
      scenarios: {
        optimistic: true,
        neutral: true,
        pessimistic: true,
        totalSaved: true,
        patrimony: true,
      },
      references: {
        financialIndependence: false,
        perpetuityWealth: false,
      },
    });

    const finalMonteCarloData = monteCarloData === undefined ? null : monteCarloData;

    const { animationPhase, isShowingLines, isShowing50Lines, isDrawingFinalLines } =
      useChartAnimation({
        isCalculating,
        isMonteCarloEnabled,
        monteCarloData: finalMonteCarloData,
        onAnimationComplete,
      });

    // Define if magic moment is active
    const isMagicMomentActive =
      isMonteCarloEnabled &&
      (animationPhase === 'projecting' ||
        animationPhase === 'paths' ||
        animationPhase === 'optimizing' ||
        animationPhase === 'drawing-final');

    // Comunicar estado do momento mágico ao componente pai
    useEffect(() => {
      if (onMagicMomentStateChange) {
        onMagicMomentStateChange(isMagicMomentActive);
      }
    }, [animationPhase, isMonteCarloEnabled, onMagicMomentStateChange, isMagicMomentActive]);

    const { chartData } = useChartDataProcessor({
      data,
      currentAge,
      accumulationYears,
      initialAmount,
      monthlyAmount,
      monthlyIncomeTarget,
      monteCarloData: finalMonteCarloData,
      isMonteCarloEnabled,
    });

    // Use the retirement age calculated once in useCalculator - no duplicate calculation
    const possibleRetirementAge = retirementAge || currentAge + accumulationYears;

    // Calculate perpetuity wealth based on retirement return and desired income
    const perpetuityWealth = useMemo(
      () => (monthlyIncomeTarget > 0 ? (monthlyIncomeTarget * 12) / (portfolioReturn / 100) : 0),
      [monthlyIncomeTarget, portfolioReturn]
    );

    // Chart is ready to render
    return (
      <div className="w-full">
        {/* Chart Title - Hidden during magic moment but maintains layout */}
        <div className="mb-6">
          <h3
            className={`text-xl font-bold text-white ${
              animationPhase === 'projecting' ||
              animationPhase === 'paths' ||
              animationPhase === 'optimizing' ||
              animationPhase === 'drawing-final'
                ? 'invisible'
                : 'visible'
            }`}
          >
            Gráfico de projeção patrimonial
          </h3>
        </div>

        {/* Chart Section with Overlay */}
        <div className="relative">
          <div className="chart-container">
            {/* Show projecting message for CENA 1 e CENA 3 OR chart renderer */}
            {isMonteCarloEnabled &&
            (animationPhase === 'projecting' || animationPhase === 'optimizing') ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {/* Aurora circular loading animation - NOVO COMPONENTE */}
                  <div className="relative mb-8">
                    <AuroraLoader />
                  </div>

                  <div>
                    <p className="text-lg font-medium text-foreground magic-moment-text">
                      {animationPhase === 'projecting'
                        ? 'Calculando possíveis resultados...'
                        : 'Otimizando exibição...'}
                    </p>
                    <p className="text-sm text-foreground mt-2 magic-moment-text">
                      {animationPhase === 'projecting'
                        ? 'Analisando mil cenários diferentes baseados em risco e volatilidade'
                        : 'Preparando visualização dos caminhos mais prováveis'}
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
                userRetirementAge={retirementAge}
              />
            )}
          </div>
        </div>

        {/* Controls Section - Now below the chart */}
        {(showLifeExpectancyControl || onMonteCarloToggle) && (
          <div
            className={`mt-6 ${
              animationPhase === 'projecting' ||
              animationPhase === 'paths' ||
              animationPhase === 'optimizing' ||
              animationPhase === 'drawing-final'
                ? 'invisible pointer-events-none'
                : 'visible'
            }`}
          >
            <ChartControls
              lifeExpectancy={lifeExpectancy}
              possibleRetirementAge={possibleRetirementAge}
              isMonteCarloEnabled={isMonteCarloEnabled}
              onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
              onMonteCarloToggle={onMonteCarloToggle || (() => {})}
              showGrid={showGrid}
              onGridToggle={setShowGrid}
              crisisFrequency={crisisFrequency}
              onCrisisFrequencyChange={onCrisisFrequencyChange}
              crisisMeanImpact={crisisMeanImpact}
              onCrisisMeanImpactChange={onCrisisMeanImpactChange}
            />
          </div>
        )}

        {/* Chart Info - Now below the controls */}
        {!isMagicMomentActive && (
          <div className="mt-6">
            <ChartInfo
              monteCarloData={finalMonteCarloData}
              perpetuityWealth={perpetuityWealth}
              possibleRetirementAge={possibleRetirementAge}
              userRetirementAge={retirementAge}
              onVisibilityChange={setChartVisibility}
            />
          </div>
        )}
      </div>
    );
  }
);
