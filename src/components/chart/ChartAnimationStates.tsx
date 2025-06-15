
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
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('final');
  const [visiblePaths, setVisiblePaths] = useState<number[]>([]);
  const [pathOpacities, setPathOpacities] = useState<Record<number, number>>({});

  // Reset animation when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('Monte Carlo disabled - resetting to final phase');
      setAnimationPhase('final');
      setVisiblePaths([]);
      setPathOpacities({});
      return;
    }
  }, [isMonteCarloEnabled]);

  // Handle Monte Carlo animation sequence
  useEffect(() => {
    // Clear any existing timers
    let timer1: NodeJS.Timeout, timer2: NodeJS.Timeout, fadeInterval: NodeJS.Timeout;

    if (isCalculating && isMonteCarloEnabled) {
      console.log('Starting Monte Carlo animation...');
      setAnimationPhase('projecting');
      setVisiblePaths([]);
      setPathOpacities({});
      
      // Show projecting message for exactly 2 seconds
      timer1 = setTimeout(() => {
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
        timer2 = setTimeout(() => {
          console.log('Starting consolidation phase...');
          setAnimationPhase('consolidating');
          
          // Fade out paths gradually over 2 seconds
          fadeInterval = setInterval(() => {
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
          }, 40);
        }, 3000);
      }, 2000);
    } else if (!isCalculating) {
      setAnimationPhase('final');
    }

    // Cleanup function to clear timers
    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (fadeInterval) clearInterval(fadeInterval);
    };
  }, [isCalculating, isMonteCarloEnabled]);

  return {
    animationPhase,
    visiblePaths,
    pathOpacities
  };
};
