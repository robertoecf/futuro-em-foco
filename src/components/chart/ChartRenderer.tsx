import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import type { ChartDataPoint } from '@/utils/csvExport';
import { CustomTooltip } from './CustomTooltip';
import { formatYAxis } from './chartUtils';
import { useFinalLinesAnimation } from './useFinalLinesAnimation';
import { LINE_ANIMATION } from '@/components/calculator/constants';

// Monte Carlo configuration
const MONTE_CARLO_ALL_LINES = 1001; // Total scenarios calculated
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
}

export const ChartRenderer = React.memo(({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monthlyIncomeTarget,
  monteCarloData,
  isShowingLines,
  isShowing50Lines = false,
  isDrawingFinalLines,
  lineDrawingDuration = LINE_ANIMATION.DRAWING_DURATION,
  animationPhase = 'final'
}: ChartRendererProps) => {
  
  const { getFinalLineAnimationState } = useFinalLinesAnimation({
    isDrawingFinalLines
  });

  // Simple performance optimization during animations
  React.useEffect(() => {
    if (animationPhase !== 'final') {
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.pointerEvents = 'auto';
    }
    
    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, [animationPhase]);

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

  // Simple debug for Scene 2
  if (isShowingLines) {
    console.log('Rendering Monte Carlo lines:', MONTE_CARLO_EXHIBITION_LINES);
  }



      return (
      <>
        {/* Simple blur overlay during entire animation sequence */}
        {(animationPhase !== 'final') && (
          <div 
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'rgba(0, 0, 0, 0.1)',
              transition: 'all 300ms ease-out'
            }}
          />
        )}
        
        <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4" style={{ zIndex: (animationPhase !== 'final') ? 50 : 'auto' }}>


      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
          style={{
            pointerEvents: isShowingLines ? 'none' : 'auto' // Disable mouse interactions during Scene 2
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="age" 
            label={{ value: 'Idade', position: 'insideBottom', offset: -10 }}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            width={80}
          />
          <Tooltip 
            content={<CustomTooltip monteCarloData={monteCarloData} />} 
            active={!isShowingLines} // Disable tooltip during Scene 2 animation
          />
          
          {/* Savings line - always visible */}
          <Line 
            type="monotone" 
            dataKey="poupanca" 
            name="Total Poupado"
            stroke="#6B7280" 
            strokeWidth={2}
            dot={false}
            activeDot={isShowingLines ? false : { r: 6, stroke: '#6B7280', strokeWidth: 2, fill: '#fff' }}
          />

          {/* MonteCarloExibitionLines - Scene 2 with simple animation */}
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
            />
          ))}

          {/* This section removed - Scene 3 only shows "optimizing" message */}

          {/* MonteCarloFinalLines - Only visible in Scene 4 */}
          {monteCarloData && !isShowingLines && (
            <>
              {/* Pessimistic Line */}
              {(() => {
                const animationState = getFinalLineAnimationState('pessimistic');
                return (
                  <Line 
                    type="monotone" 
                    dataKey="pessimistic" 
                    name="Cenário Pessimista"
                    stroke="#DC2626" 
                    strokeWidth={2}
                    strokeDasharray={isDrawingFinalLines ? animationState.strokeDasharray : "5 5"}
                    strokeDashoffset={isDrawingFinalLines ? animationState.strokeDashoffset : "0"}
                    strokeOpacity={isDrawingFinalLines ? animationState.opacity : 1}
                    dot={false}
                    activeDot={isShowingLines ? false : { r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    style={isDrawingFinalLines ? animationState.drawingStyle : {}}
                  />
                );
              })()}
              
              {/* Median Line */}
              {(() => {
                const animationState = getFinalLineAnimationState('median');
                return (
                  <Line 
                    type="monotone" 
                    dataKey="median" 
                    name="Cenário Neutro"
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    strokeDasharray={isDrawingFinalLines ? animationState.strokeDasharray : "none"}
                    strokeDashoffset={isDrawingFinalLines ? animationState.strokeDashoffset : "0"}
                    strokeOpacity={isDrawingFinalLines ? animationState.opacity : 1}
                    dot={false}
                    activeDot={isShowingLines ? false : { r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    style={isDrawingFinalLines ? animationState.drawingStyle : {}}
                  />
                );
              })()}
              
              {/* Optimistic Line */}
              {(() => {
                const animationState = getFinalLineAnimationState('optimistic');
                return (
                  <Line 
                    type="monotone" 
                    dataKey="optimistic" 
                    name="Cenário Otimista"
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray={isDrawingFinalLines ? animationState.strokeDasharray : "5 5"}
                    strokeDashoffset={isDrawingFinalLines ? animationState.strokeDashoffset : "0"}
                    strokeOpacity={isDrawingFinalLines ? animationState.opacity : 1}
                    dot={false}
                    activeDot={isShowingLines ? false : { r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    style={isDrawingFinalLines ? animationState.drawingStyle : {}}
                  />
                );
              })()}
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
              activeDot={isShowingLines ? false : { r: 8, stroke: '#FF6B00', strokeWidth: 2, fill: '#fff' }}
              connectNulls
            />
          )}

          {/* Reference lines - Only visible when there's a monthly income target */}
          {monthlyIncomeTarget > 0 && (
            <>
              <ReferenceLine 
                x={possibleRetirementAge} 
                stroke="#9CA3AF" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={{ 
                  value: 'Independência financeira', 
                  position: 'top', 
                  fill: '#6B7280',
                  fontSize: 11
                }} 
              />
              
              {perpetuityWealth > 0 && (
                <ReferenceLine 
                  y={perpetuityWealth} 
                  stroke="#9CA3AF" 
                  strokeDasharray="8 4" 
                  strokeWidth={2}
                  label={{ 
                    value: 'Patrimônio Perpetuidade', 
                    position: 'insideTopRight', 
                    fill: '#6B7280',
                    fontSize: 11
                  }} 
                />
              )}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    </>
  );
});
