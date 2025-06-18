
import { Line } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { useLineAnimation } from './useLineAnimation';
import { FinalLinesRenderer } from './FinalLinesRenderer';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface LineComponentsProps {
  monteCarloData: MonteCarloResult | null;
  isShowingLines: boolean;
  isDrawingFinalLines: boolean;
  lineDrawingDuration: number;
}

export const LineComponents = ({
  monteCarloData,
  isShowingLines,
  isDrawingFinalLines,
  lineDrawingDuration
}: LineComponentsProps) => {
  
  const { getLineAnimationState } = useLineAnimation({
    isShowingLines,
    totalLines: LINE_ANIMATION.TOTAL_LINES,
    drawingDuration: lineDrawingDuration
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

  console.log('🎨 LineComponents rendering:', {
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines
  });

  return (
    <>
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

      {/* Final Monte Carlo results using new component */}
      {monteCarloData && (
        <FinalLinesRenderer isDrawingFinalLines={isDrawingFinalLines} />
      )}
    </>
  );
};
