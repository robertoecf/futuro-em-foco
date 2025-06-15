
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
      console.log('Starting Monte Carlo animation...');
      setAnimationPhase('projecting');
      setVisiblePaths([]);
      setPathOpacities({});
      
      // Show projecting message for exactly 2 seconds
      const timer1 = setTimeout(() => {
        console.log('Moving to paths phase...');
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
        
        // Show all paths for 3 seconds, then start consolidating
        const timer2 = setTimeout(() => {
          console.log('Starting consolidation phase...');
          setAnimationPhase('consolidating');
          
          // Fade out paths gradually over 2 seconds
          const fadeInterval = setInterval(() => {
            setPathOpacities(prev => {
              const newOpacities = { ...prev };
              let allFaded = true;
              
              pathsToShow.forEach(path => {
                if (newOpacities[path] > 0) {
                  newOpacities[path] = Math.max(0, newOpacities[path] - 0.03);
                  if (newOpacities[path] > 0) allFaded = false;
                }
              });
              
              if (allFaded) {
                clearInterval(fadeInterval);
                console.log('Animation complete - moving to final phase');
                setAnimationPhase('final');
              }
              
              return newOpacities;
            });
          }, 40); // Slower fade for better visual effect
        }, 3000); // Show paths for 3 seconds
      }, 2000); // Exactly 2 seconds for projecting message
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
