
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { CustomTooltip } from './CustomTooltip';
import { formatYAxis } from './chartUtils';
import { useGradientLineAnimation } from './useGradientLineAnimation';
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
  
  const { getLineAnimationState } = useGradientLineAnimation({
    isShowingLines,
    totalLines: LINE_ANIMATION.TOTAL_LINES,
    chartData,
    drawingDuration: lineDrawingDuration
  });

  const { getFinalLineAnimationState } = useFinalLinesAnimation({
    isDrawingFinalLines
  });

  // Default color generator if not provided
  const defaultGenerateLineColor = (index: number) => {
    const hue = (index * 360) / LINE_ANIMATION.TOTAL_LINES;
    const saturation = 60 + (index % 30);
    const lightness = 45 + (index % 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const colorGenerator = generateLineColor || defaultGenerateLineColor;

  console.log('📊 ChartRenderer:', {
    chartDataLength: chartData.length,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines,
    lineDrawingDuration,
    totalLines: LINE_ANIMATION.TOTAL_LINES,
    firstDataKeys: chartData[0] ? Object.keys(chartData[0]) : []
  });

  return (
    <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
      {/* Optimized CSS for smooth animations */}
      <style>{`
        .monte-carlo-line {
          vector-effect: non-scaling-stroke;
        }
        
        .gradient-line {
          transition: opacity 800ms ease-in-out;
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

          {/* 500 Monte Carlo lines - smooth gradient animation */}
          {monteCarloData && Array.from({ length: LINE_ANIMATION.TOTAL_LINES }, (_, i) => {
            const animationState = getLineAnimationState(i);
            
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
                className="monte-carlo-line gradient-line"
                style={animationState.style}
              />
            );
          })}

          {/* Final Monte Carlo results - with drawing animation during drawing-final phase */}
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
                    strokeDasharray={isDrawingFinalLines ? animationState.strokeDasharray : "5 5"}
                    strokeDashoffset={isDrawingFinalLines ? animationState.strokeDashoffset : "0"}
                    strokeOpacity={isDrawingFinalLines ? animationState.opacity : 1}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }}
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
                    strokeWidth={4}
                    strokeDasharray={isDrawingFinalLines ? animationState.strokeDasharray : "none"}
                    strokeDashoffset={isDrawingFinalLines ? animationState.strokeDashoffset : "0"}
                    strokeOpacity={isDrawingFinalLines ? animationState.opacity : 1}
                    dot={false}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
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
                    strokeWidth={3}
                    strokeDasharray={isDrawingFinalLines ? animationState.strokeDasharray : "5 5"}
                    strokeDashoffset={isDrawingFinalLines ? animationState.strokeDashoffset : "0"}
                    strokeOpacity={isDrawingFinalLines ? animationState.opacity : 1}
                    dot={false}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
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
              activeDot={{ r: 8, stroke: '#FF6B00', strokeWidth: 2, fill: '#fff' }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
