
import { useState, useEffect } from 'react';
import { MonteCarloResult } from '@/lib/utils';

export type AnimationPhase = 'initial' | 'projecting' | 'paths' | 'consolidating' | 'final';

interface UseChartAnimationProps {
  isCalculating: boolean;
  isMonteCarloEnabled: boolean;
  monteCarloData: MonteCarloResult | null;
}

export const useChartAnimation = ({ 
  isCalculating, 
  isMonteCarloEnabled, 
  monteCarloData 
}: UseChartAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('initial');
  const [visiblePaths, setVisiblePaths] = useState<number[]>([]);
  const [pathOpacities, setPathOpacities] = useState<Record<number, number>>({});

  // Reset animation when Monte Carlo starts
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled) {
      setAnimationPhase('projecting');
      setVisiblePaths([]);
      setPathOpacities({});
      
      // After 2 seconds, start showing paths
      const timer1 = setTimeout(() => {
        if (monteCarloData) {
          setAnimationPhase('paths');
          // Generate 50 random paths for visual effect
          const pathsToShow = Array.from({ length: 50 }, (_, i) => i);
          setVisiblePaths(pathsToShow);
          
          // Initialize all paths with full opacity
          const initialOpacities: Record<number, number> = {};
          pathsToShow.forEach(path => {
            initialOpacities[path] = 1;
          });
          setPathOpacities(initialOpacities);
          
          // After 3 seconds showing all paths, start consolidating
          const timer2 = setTimeout(() => {
            setAnimationPhase('consolidating');
            
            // Fade out paths gradually over 2 seconds
            const fadeInterval = setInterval(() => {
              setPathOpacities(prev => {
                const newOpacities = { ...prev };
                let allFaded = true;
                
                pathsToShow.forEach(path => {
                  if (newOpacities[path] > 0) {
                    newOpacities[path] = Math.max(0, newOpacities[path] - 0.05);
                    if (newOpacities[path] > 0) allFaded = false;
                  }
                });
                
                if (allFaded) {
                  clearInterval(fadeInterval);
                  setAnimationPhase('final');
                }
                
                return newOpacities;
              });
            }, 50);
          }, 3000);
        }
      }, 2000);
    } else if (!isCalculating) {
      setAnimationPhase('final');
    }
  }, [isCalculating, isMonteCarloEnabled, monteCarloData]);

  return {
    animationPhase,
    visiblePaths,
    pathOpacities
  };
};
