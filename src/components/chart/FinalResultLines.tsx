
import { Line } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { useFinalLinesAnimation } from './useFinalLinesAnimation';

interface FinalResultLinesProps {
  monteCarloData: MonteCarloResult | null;
  isDrawingFinalLines: boolean;
  isShowingLines: boolean;
}

export const FinalResultLines = ({
  monteCarloData,
  isDrawingFinalLines,
  isShowingLines
}: FinalResultLinesProps) => {
  const { getFinalLineAnimationState } = useFinalLinesAnimation({
    isDrawingFinalLines
  });

  if (!monteCarloData || !(isDrawingFinalLines || (!isShowingLines && !isDrawingFinalLines))) {
    return null;
  }

  return (
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
  );
};
