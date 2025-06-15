
import { Line } from 'recharts';
import { AnimationPhase } from './ChartAnimationStates';

interface MonteCarloAnimationProps {
  animationPhase: AnimationPhase;
  visiblePaths: number[];
  pathOpacities: Record<number, number>;
}

export const MonteCarloAnimation = ({ 
  animationPhase, 
  visiblePaths, 
  pathOpacities 
}: MonteCarloAnimationProps) => {
  
  // Generate random colors for paths
  const generatePathColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    return colors[index % colors.length];
  };

  if (animationPhase !== 'paths' && animationPhase !== 'consolidating') {
    return null;
  }

  return (
    <>
      {visiblePaths.map((pathIndex) => (
        <Line
          key={`path${pathIndex}`}
          type="monotone"
          dataKey={`path${pathIndex}`}
          stroke={generatePathColor(pathIndex)}
          strokeWidth={1}
          strokeOpacity={pathOpacities[pathIndex] || 0}
          dot={false}
          activeDot={false}
          connectNulls
        />
      ))}
    </>
  );
};
