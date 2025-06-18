import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { CustomTooltip } from './CustomTooltip';
import { formatYAxis } from './chartUtils';
import { useLineAnimation } from './useLineAnimation';
import { useFinalLinesAnimation } from './useFinalLinesAnimation';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface ChartRendererProps {
  chartData: any[];
  possibleRetirementAge: number;
  perpetuityWealth: number;
  monteCarloData: MonteCarloResult | null;
  isShowingLines: boolean;
  isDrawingFinalLines: boolean;
  lineDrawingDuration?: number;
}

export const ChartRenderer = ({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monteCarloData,
  isShowingLines,
  isDrawingFinalLines,
  lineDrawingDuration = LINE_ANIMATION.DRAWING_DURATION
}: ChartRendererProps) => {
  
  const { getLineAnimationState } = useLineAnimation({
    isShowingLines,
    totalLines: LINE_ANIMATION.TOTAL_LINES,
    drawingDuration: lineDrawingDuration
  });

  const { getFinalLineAnimationState } = useFinalLinesAnimation({
    isDrawingFinalLines
  });

  // Generate colors for the 50 lines
  const generateLineColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    return colors[index % colors.length];
  };

  console.log('📊 ChartRenderer:', {
    chartDataLength: chartData.length,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines,
    lineDrawingDuration,
    firstDataKeys: chartData[0] ? Object.keys(chartData[0]) : []
  });

  return (
    <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
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
          <Tooltip content={<CustomTooltip monteCarloData={monteCarloData} />} />
          
          {/* Reference line for possible retirement age */}
          <ReferenceLine 
            x={possibleRetirementAge} 
            stroke="#9CA3AF" 
            strokeDasharray="5 5" 
            label={{ 
              value: 'Idade de Aposentadoria', 
              position: 'top', 
              fill: '#6B7280',
              fontSize: 11
            }} 
          />
          
          {/* Reference line for perpetuity wealth */}
          {perpetuityWealth > 0 && (
            <ReferenceLine 
              y={perpetuityWealth} 
              stroke="#9CA3AF" 
              strokeDasharray="8 4" 
              label={{ 
                value: 'Patrimônio Perpetuidade', 
                position: 'insideTopRight', 
                fill: '#6B7280',
                fontSize: 11
              }} 
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
            activeDot={{ r: 6, stroke: '#6B7280', strokeWidth: 2, fill: '#fff' }}
          />

          {/* 50 Monte Carlo lines - smooth progressive animation */}
          {monteCarloData && Array.from({ length: LINE_ANIMATION.TOTAL_LINES }, (_, i) => {
            const animationState = getLineAnimationState(i);
            
            if (!animationState.isVisible) return null;
            
            return (
              <Line
                key={`monte-carlo-line-${i}`}
                type="monotone"
                dataKey={`line${i}`}
                stroke={generateLineColor(i)}
                strokeWidth={1.8}
                strokeOpacity={animationState.opacity}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            );
          })}

          {/* Final Monte Carlo results - always show when Monte Carlo data exists */}
          {monteCarloData && (
            <>
              {/* Pessimistic Line */}
              {(() => {
                const animationState = getFinalLineAnimationState('pessimistic');
                
                return (
                  <Line 
                    key="pessimistic-line"
                    type="monotone" 
                    dataKey="pessimistic" 
                    name="Cenário Pessimista"
                    stroke="#DC2626" 
                    strokeWidth={2}
                    strokeDasharray={animationState.strokeDasharray}
                    strokeDashoffset={animationState.strokeDashoffset}
                    strokeOpacity={animationState.opacity}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    style={animationState.drawingStyle}
                  />
                );
              })()}
              
              {/* Median Line */}
              {(() => {
                const animationState = getFinalLineAnimationState('median');
                
                return (
                  <Line 
                    key="median-line"
                    type="monotone" 
                    dataKey="median" 
                    name="Cenário Neutro"
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    strokeDasharray={animationState.strokeDasharray}
                    strokeDashoffset={animationState.strokeDashoffset}
                    strokeOpacity={animationState.opacity}
                    dot={false}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    style={animationState.drawingStyle}
                  />
                );
              })()}
              
              {/* Optimistic Line */}
              {(() => {
                const animationState = getFinalLineAnimationState('optimistic');
                
                return (
                  <Line 
                    key="optimistic-line"
                    type="monotone" 
                    dataKey="optimistic" 
                    name="Cenário Otimista"
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray={animationState.strokeDasharray}
                    strokeDashoffset={animationState.strokeDashoffset}
                    strokeOpacity={animationState.opacity}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    style={animationState.drawingStyle}
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
              activeDot={{ r: 8, stroke: '#FF6B00', strokeWidth: 2, fill: '#fff' }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
