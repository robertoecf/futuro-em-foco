
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
  actualLinesCount?: number;
}

export const ChartRenderer = ({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monteCarloData,
  isShowingLines,
  isDrawingFinalLines,
  lineDrawingDuration = LINE_ANIMATION.DRAWING_DURATION,
  actualLinesCount
}: ChartRendererProps) => {
  
  // Detect actual number of Monte Carlo lines in the data
  const detectLinesInData = () => {
    if (!chartData || chartData.length === 0) return 0;
    
    const firstDataPoint = chartData[0] || {};
    const lineKeys = Object.keys(firstDataPoint).filter(key => 
      key.startsWith('line') && key.match(/^line\d+$/)
    );
    
    return lineKeys.length;
  };

  const detectedLines = detectLinesInData();
  const totalLinesToRender = actualLinesCount || detectedLines || LINE_ANIMATION.TOTAL_LINES;

  console.log('📊 ChartRenderer lines detection:', {
    chartDataLength: chartData.length,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines,
    lineDrawingDuration,
    detectedLines,
    actualLinesCount,
    totalLinesToRender,
    firstDataKeys: chartData[0] ? Object.keys(chartData[0]).filter(k => k.startsWith('line')).slice(0, 10) : []
  });

  const { getLineAnimationState } = useLineAnimation({
    isShowingLines,
    totalLines: totalLinesToRender,
    drawingDuration: lineDrawingDuration
  });

  const { getFinalLineAnimationState } = useFinalLinesAnimation({
    isDrawingFinalLines
  });

  // Generate colors for the lines (support up to 500+ lines)
  const generateLineColor = (index: number) => {
    const baseColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    
    // For more than 20 lines, generate variations
    if (index < baseColors.length) {
      return baseColors[index];
    }
    
    // Generate HSL colors for additional lines
    const hue = (index * 137.508) % 360; // Golden angle for good distribution
    const saturation = 60 + (index % 40); // Vary saturation
    const lightness = 45 + (index % 30); // Vary lightness
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
      {/* CSS for line drawing animation */}
      <style>{`
        @keyframes draw-line {
          0% {
            stroke-dashoffset: 1000;
            opacity: 0.3;
          }
          50% {
            stroke-dashoffset: 500;
            opacity: 0.8;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
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

          {/* Dynamic Monte Carlo lines - render all available lines */}
          {monteCarloData && Array.from({ length: totalLinesToRender }, (_, i) => {
            const animationState = getLineAnimationState(i);
            const lineKey = `line${i}`;
            
            // Check if this line actually exists in the data
            const hasDataForLine = chartData.some(dataPoint => dataPoint[lineKey] !== undefined);
            
            if (!hasDataForLine) {
              console.log(`⚠️ Line ${i} (${lineKey}) not found in chart data`);
              return null;
            }
            
            return (
              <Line
                key={`monte-carlo-line-${i}`}
                type="monotone"
                dataKey={lineKey}
                stroke={generateLineColor(i)}
                strokeWidth={1.8}
                strokeOpacity={animationState.opacity}
                strokeDasharray={animationState.strokeDasharray}
                strokeDashoffset={animationState.strokeDashoffset}
                dot={false}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
                style={{
                  transition: `opacity ${LINE_ANIMATION.OPACITY_FADE_DURATION}ms ease-out`,
                  ...animationState.drawingStyle
                }}
              />
            );
          }).filter(Boolean)}

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
                    strokeWidth={2}
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
                    strokeWidth={3}
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
                    strokeWidth={2}
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
