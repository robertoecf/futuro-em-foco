
import { Line } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { useLineAnimation } from './useLineAnimation';

interface MonteCarloLinesProps {
  chartData: any[];
  monteCarloData: MonteCarloResult | null;
  isShowingLines: boolean;
  totalLinesToRender: number;
  lineDrawingDuration: number;
}

export const MonteCarloLines = ({
  chartData,
  monteCarloData,
  isShowingLines,
  totalLinesToRender,
  lineDrawingDuration
}: MonteCarloLinesProps) => {
  const { getLineAnimationState } = useLineAnimation({
    isShowingLines,
    totalLines: totalLinesToRender,
    drawingDuration: lineDrawingDuration
  });

  // Generate colors for the lines
  const generateLineColor = (index: number) => {
    const baseColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    
    if (index < baseColors.length) {
      return baseColors[index];
    }
    
    // Generate HSL colors for additional lines
    const hue = (index * 137.508) % 360;
    const saturation = 60 + (index % 40);
    const lightness = 45 + (index % 30);
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  if (!monteCarloData || totalLinesToRender === 0) {
    console.log('⚠️ No Monte Carlo data or lines to render');
    return null;
  }

  console.log('🎨 Rendering Monte Carlo lines:', {
    totalLinesToRender,
    isShowingLines,
    chartDataLength: chartData.length
  });

  return (
    <>
      {Array.from({ length: totalLinesToRender }, (_, i) => {
        const animationState = getLineAnimationState(i);
        const lineKey = `line${i}`;
        
        // Check if this line exists in the data
        const hasDataForLine = chartData.length > 0 && chartData[0] && chartData[0][lineKey] !== undefined;
        
        if (!hasDataForLine) {
          console.log(`⚠️ Line ${lineKey} not found in chart data`);
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
              transition: `opacity 300ms ease-out`,
              ...animationState.drawingStyle
            }}
          />
        );
      }).filter(Boolean)}
    </>
  );
};
