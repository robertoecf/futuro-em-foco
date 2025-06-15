
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
    console.log('⏸️ MonteCarloAnimation: Not in animation phase, current phase:', animationPhase);
    return null;
  }

  console.log('🎬 MonteCarloAnimation: Rendering animation for phase:', animationPhase, {
    visiblePathsCount: visiblePaths.length,
    pathOpacitiesCount: Object.keys(pathOpacities).length,
    firstFewOpacities: Object.entries(pathOpacities).slice(0, 5).map(([key, value]) => `${key}:${value}`)
  });

  // Render all 50 paths, control visibility via opacity
  const allPaths = Array.from({ length: 50 }, (_, i) => i);

  return (
    <>
      {allPaths.map((pathIndex) => {
        const opacity = pathOpacities[pathIndex] || 0;
        const color = generatePathColor(pathIndex);
        
        // Debug first few paths to ensure they're being rendered
        if (pathIndex < 5) {
          console.log(`🎨 Rendering path${pathIndex}:`, {
            opacity,
            color,
            dataKey: `path${pathIndex}`,
            hasOpacity: pathIndex in pathOpacities
          });
        }
        
        return (
          <Line
            key={`monte-carlo-path-${pathIndex}`}
            type="monotone"
            dataKey={`path${pathIndex}`}
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity={opacity}
            dot={false}
            activeDot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        );
      })}
    </>
  );
};
