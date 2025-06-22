import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import type { ChartDataPoint } from '@/utils/csvExport';
import { CustomTooltip } from './CustomTooltip';
import { formatYAxis } from './utils/chartUtils';
import { useFinalLinesAnimation } from './hooks/useFinalLinesAnimation';

// Monte Carlo configuration
const MONTE_CARLO_EXHIBITION_LINES = 1001; // Show ALL calculated lines in Scene 2

interface ChartRendererProps {
  chartData: ChartDataPoint[];
  possibleRetirementAge: number;
  perpetuityWealth: number;
  monthlyIncomeTarget: number;
  monteCarloData: MonteCarloResult | null;
  isShowingLines: boolean;
  isShowing50Lines?: boolean;
  isDrawingFinalLines: boolean;
  lineDrawingDuration?: number;
  animationPhase?: 'projecting' | 'paths' | 'optimizing' | 'drawing-final' | 'final';
  showGrid?: boolean;
}

export const ChartRenderer = React.memo(({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monthlyIncomeTarget: _monthlyIncomeTarget,
  monteCarloData,
  isShowingLines,
  isShowing50Lines: _isShowing50Lines,
  isDrawingFinalLines,
  animationPhase = 'final',
  showGrid = true
}: ChartRendererProps) => {
  
  const { getFinalLineAnimationState, isAnimationComplete: _isAnimationComplete } = useFinalLinesAnimation({
    isDrawingFinalLines
  });

  // Estado para controlar se as bolinhas devem estar visíveis
  const shouldShowActiveDots = animationPhase === 'final' && !isDrawingFinalLines;

  // Generate colors for the lines
  const generateLineColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    return colors[index % colors.length];
  };

  // Simple debug for chart rendering
  if (!chartData?.length) {
    console.log('⚠️ Chart: No data available');
    return null;
  }

  // Debug para identificar mudanças de escala
  if (isDrawingFinalLines) {
    console.log(`🎯 Scale Debug [${animationPhase}]:`, {
      possibleRetirementAge,
      perpetuityWealth,
      hasMonteCarloData: !!monteCarloData,
      chartDataLength: chartData?.length
    });
  }

  // Simple debug for Scene 2
  if (isShowingLines) {
    console.log('Rendering Monte Carlo lines:', MONTE_CARLO_EXHIBITION_LINES);
  }

  return (
    <>
      <div className="relative h-[400px] w-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={typeof window !== 'undefined' && window.innerWidth < 640 ? 
              { top: 10, right: 10, left: 60, bottom: 10 } : 
              { top: 20, right: 30, left: 80, bottom: 20 }
            }
            style={{
              cursor: shouldShowActiveDots ? 'crosshair' : 'none',
              pointerEvents: shouldShowActiveDots ? 'auto' : 'none'
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />}
            <XAxis 
              dataKey="age" 
              label={typeof window !== 'undefined' && window.innerWidth < 640 ? 
                undefined : 
                { value: 'Idade', position: 'insideBottom', offset: -10, fill: '#ffffff' }
              }
              tickFormatter={(value) => `${value}`}
              tick={{ 
                fill: '#ffffff',
                fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
              }}
              axisLine={{ stroke: '#ffffff40' }}
              tickLine={{ stroke: '#ffffff40' }}
              interval={0}
              ticks={(() => {
                // Idades de 10 em 10 anos
                const intervalTicks = chartData.filter((_, index) => index % 10 === 0 || index === chartData.length - 1).map(d => d.age);
                
                // Idades importantes que sempre devem aparecer
                const importantAges: number[] = [];
                
                // Idade da independência financeira
                if (possibleRetirementAge && possibleRetirementAge > 0) {
                  importantAges.push(possibleRetirementAge);
                }
                
                // Idade de aposentadoria (assumindo que é chartData[accumulationPeriod])
                const retirementAge = chartData.find(d => d.fase === "Aposentadoria")?.age;
                if (retirementAge && retirementAge !== possibleRetirementAge) {
                  importantAges.push(retirementAge);
                }
                
                // Combina todos os ticks e remove duplicatas
                const allTicks = [...new Set([...intervalTicks, ...importantAges])].sort((a, b) => a - b);
                return allTicks;
              })()}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              width={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
              tick={{ 
                fill: '#ffffff',
                fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12
              }}
              axisLine={{ stroke: '#ffffff40' }}
              tickLine={{ stroke: '#ffffff40' }}
              tickCount={typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 6}
            />
            
            {/* 🎯 VOLTA SIMPLES: Linhas de referência normais - problema é mudança de escala */}
            {/* Linha de Independência Financeira */}
            {(possibleRetirementAge > 0 || monteCarloData) && (
              <ReferenceLine 
                x={possibleRetirementAge > 0 ? possibleRetirementAge : 65} 
                stroke="#9CA3AF" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{ 
                  value: 'Independência financeira', 
                  position: 'top', 
                  fill: '#ffffff',
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 11
                }} 
              />
            )}
            
            {/* Linha de Patrimônio Perpetuidade */}
            {(perpetuityWealth > 0 || monteCarloData) && (
              <ReferenceLine 
                y={perpetuityWealth > 0 ? perpetuityWealth : 1000000} 
                stroke="#9CA3AF" 
                strokeDasharray="8 4" 
                strokeWidth={2}
                label={{ 
                  value: 'Patrimônio Perpetuidade', 
                  position: 'insideTopRight', 
                  fill: '#ffffff',
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 11
                }} 
              />
            )}

            {shouldShowActiveDots && (
              <Tooltip 
                content={<CustomTooltip monteCarloData={monteCarloData} shouldShow={shouldShowActiveDots} />} 
                cursor={false} // Remove a linha pontilhada vertical
                animationDuration={0}
                wrapperStyle={{ 
                  zIndex: 9999,
                  pointerEvents: 'auto'
                }}
                allowEscapeViewBox={{ x: true, y: true }} // Permite tooltip escapar dos limites para melhor posicionamento
                isAnimationActive={false} // Desabilita animações para resposta mais rápida
                offset={10} // Adiciona um pequeno offset para melhor posicionamento
              />
            )}
            
            {/* Savings line - always visible */}
            <Line 
              type="monotone" 
              dataKey="poupanca" 
              name="Total Poupado"
              stroke="#6B7280" 
              strokeWidth={2}
              dot={false}
              activeDot={shouldShowActiveDots ? { r: 6, stroke: '#6B7280', strokeWidth: 2, fill: '#fff' } : false}
            />

            {/* MonteCarloExibitionLines - Scene 2 with simple animation - TOOLTIPS DESABILITADOS */}
            {isShowingLines && Array.from({ length: MONTE_CARLO_EXHIBITION_LINES }, (_, lineIndex) => (
              <Line
                key={`monte-carlo-exhibition-line-${lineIndex}`}
                type="monotone"
                dataKey={`line${lineIndex}`}
                stroke={generateLineColor(lineIndex)}
                strokeWidth={1}
                strokeOpacity={0.3}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={true}
                animationBegin={lineIndex * 2} // Simple staggered animation
                animationDuration={600}
                animationEasing="ease-out"
                style={{ pointerEvents: 'none' }} // DESABILITA TOOLTIPS PARA PERFORMANCE
              />
            ))}

            {/* 🎯 CORREÇÃO: Linhas SEMPRE renderizadas - escala fixa, só animação visual */}
            {monteCarloData && !isShowingLines && (
              <>
                {/* Pessimistic Line - SEMPRE PRESENTE NO DOM */}
                <Line 
                  type="monotone" 
                  dataKey="pessimistic" 
                  name="Cenário Pessimista"
                  stroke="#DC2626" 
                  strokeWidth={2}
                  strokeDasharray={getFinalLineAnimationState('pessimistic').strokeDasharray}
                  strokeDashoffset={getFinalLineAnimationState('pessimistic').strokeDashoffset}
                  strokeOpacity={getFinalLineAnimationState('pessimistic').opacity}
                  dot={false}
                  activeDot={shouldShowActiveDots ? { r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' } : false}
                  isAnimationActive={false}
                  style={getFinalLineAnimationState('pessimistic').drawingStyle}
                />
                
                {/* Median Line - SEMPRE PRESENTE NO DOM */}
                <Line 
                  type="monotone" 
                  dataKey="median" 
                  name="Cenário Neutro"
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  strokeDasharray={getFinalLineAnimationState('median').strokeDasharray}
                  strokeDashoffset={getFinalLineAnimationState('median').strokeDashoffset}
                  strokeOpacity={getFinalLineAnimationState('median').opacity}
                  dot={false}
                  activeDot={shouldShowActiveDots ? { r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' } : false}
                  isAnimationActive={false}
                  style={getFinalLineAnimationState('median').drawingStyle}
                />
                
                {/* Optimistic Line - SEMPRE PRESENTE NO DOM */}
                <Line 
                  type="monotone" 
                  dataKey="optimistic" 
                  name="Cenário Otimista"
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray={getFinalLineAnimationState('optimistic').strokeDasharray}
                  strokeDashoffset={getFinalLineAnimationState('optimistic').strokeDashoffset}
                  strokeOpacity={getFinalLineAnimationState('optimistic').opacity}
                  dot={false}
                  activeDot={shouldShowActiveDots ? { r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' } : false}
                  isAnimationActive={false}
                  style={getFinalLineAnimationState('optimistic').drawingStyle}
                />
              </>
            )}

            {/* Regular patrimonio line - only when Monte Carlo is disabled */}
            {!monteCarloData && (
              <Line 
                type="monotone" 
                dataKey="patrimonio" 
                name="Patrimônio"
                stroke="#FF6B00" 
                strokeWidth={2}
                dot={false}
                activeDot={shouldShowActiveDots ? { r: 8, stroke: '#FF6B00', strokeWidth: 2, fill: '#fff' } : false}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
});

