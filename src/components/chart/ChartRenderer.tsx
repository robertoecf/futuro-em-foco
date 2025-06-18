
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
  generateLineColor?: (index: number, total?: number) => string;
}

export const ChartRenderer = ({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monteCarloData,
  isShowingLines,
  isDrawingFinalLines,
  lineDrawingDuration = LINE_ANIMATION.DRAWING_DURATION,
  generateLineColor
}: ChartRendererProps) => {
  
  const { getLineAnimationState } = useLineAnimation({
    isShowingLines,
    totalLines: LINE_ANIMATION.TOTAL_LINES,
    drawingDuration: lineDrawingDuration,
    chartData
  });

  const { getFinalLineAnimationState } = useFinalLinesAnimation({
    isDrawingFinalLines
  });

  // Default color generator if not provided - SIMPLE VERSION
  const defaultGenerateLineColor = (index: number) => {
    const hue = (index * 360) / LINE_ANIMATION.TOTAL_LINES;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const colorGenerator = generateLineColor || defaultGenerateLineColor;

  console.log('📊 ChartRenderer:', {
    chartDataLength: chartData.length,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines,
    lineDrawingDuration,
    totalLines: LINE_ANIMATION.TOTAL_LINES
  });

  return (
    <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
      {/* Simple CSS for smooth animations */}
      <style>{`
        .monte-carlo-line {
          vector-effect: non-scaling-stroke;
          transition: opacity 800ms ease-in-out;
          will-change: opacity;
        }
        .final-line {
          vector-effect: non-scaling-stroke;
          transition: opacity 600ms ease-in-out;
          will-change: opacity;
        }
      `}</style>

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

          {/* Monte Carlo lines - ONLY during 'paths' phase - SIMPLIFIED */}
          {monteCarloData && isShowingLines && Array.from({ length: LINE_ANIMATION.TOTAL_LINES }, (_, i) => {
            const animationState = getLineAnimationState(i);
            
            // Debug log for first few lines
            if (i < 5) {
              console.log(`Line ${i} state:`, animationState);
            }
            
            return (
              <Line
                key={`monte-carlo-line-${i}`}
                type="monotone"
                dataKey={`line${i}`}
                stroke={colorGenerator(i, LINE_ANIMATION.TOTAL_LINES)}
                strokeWidth={1.5}
                strokeOpacity={animationState.currentOpacity}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
                className="monte-carlo-line"
              />
            );
          })}

          {/* Final Monte Carlo results - ONLY during 'drawing-final' and 'final' phases */}
          {monteCarloData && (isDrawingFinalLines || (!isShowingLines && !isDrawingFinalLines)) && (
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
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    strokeOpacity={animationState.opacity}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    className="final-line"
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
                    strokeWidth={4}
                    strokeOpacity={animationState.opacity}
                    dot={false}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    className="final-line"
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
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    strokeOpacity={animationState.opacity}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                    isAnimationActive={false}
                    className="final-line"
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
