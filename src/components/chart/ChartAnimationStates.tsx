
import { useState, useEffect } from 'react';
import { MonteCarloResult } from '@/lib/utils';
import { MAGIC_MOMENT_TIMERS } from '@/components/calculator/constants';

interface UseChartAnimationProps {
  isCalculating: boolean;
  isMonteCarloEnabled: boolean;
  monteCarloData: MonteCarloResult | null;
  onAnimationComplete?: () => void;
}

export type AnimationPhase = 'projecting' | 'paths' | 'optimizing' | 'drawing-final' | 'final';

export const useChartAnimation = ({ 
  isCalculating, 
  isMonteCarloEnabled, 
  monteCarloData,
  onAnimationComplete
}: UseChartAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('final');
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);

  console.log('🎬 useChartAnimation state:', {
    isCalculating,
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    animationPhase,
    hasStartedAnimation
  });

  // Reset when Monte Carlo is disabled or when deterministic data changes
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('🔄 Monte Carlo disabled - resetting animation');
      setAnimationPhase('final');
      setHasStartedAnimation(false);
      return;
    }
  }, [isMonteCarloEnabled]);

  // Reset animation when new calculation starts
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled) {
      console.log('🔄 New calculation started - resetting animation state');
      setHasStartedAnimation(false);
      setAnimationPhase('projecting');
    }
  }, [isCalculating, isMonteCarloEnabled]);

  // Start animation sequence when Monte Carlo data is ready
  useEffect(() => {
    if (isMonteCarloEnabled && monteCarloData && !hasStartedAnimation && !isCalculating) {
      console.log('🚀 Starting Monte Carlo animation sequence');
      setHasStartedAnimation(true);
      
      // Phase 1: Projecting (3 seconds)
      setAnimationPhase('projecting');
      
      const timer1 = setTimeout(() => {
        console.log('📈 Phase 2: Showing 50 paths...');
        setAnimationPhase('paths');
        
        // Phase 2: Paths (6 seconds)
        const timer2 = setTimeout(() => {
          console.log('🔄 Phase 3: Optimizing display...');
          setAnimationPhase('optimizing');
          
          // Phase 3: Optimizing (2 seconds)
          const timer3 = setTimeout(() => {
            console.log('🎯 Phase 4: Drawing final lines...');
            setAnimationPhase('drawing-final');
            
            // Phase 4: Drawing Final Lines (4 seconds)
            const timer4 = setTimeout(() => {
              console.log('✨ Phase 5: Final results');
              setAnimationPhase('final');
              if (onAnimationComplete) {
                onAnimationComplete();
              }
            }, MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION);
            
            return () => clearTimeout(timer4);
          }, MAGIC_MOMENT_TIMERS.OPTIMIZING_DURATION);
          
          return () => clearTimeout(timer3);
        }, MAGIC_MOMENT_TIMERS.PATHS_DURATION);
        
        return () => clearTimeout(timer2);
      }, MAGIC_MOMENT_TIMERS.PROJECTING_DURATION);
      
      return () => clearTimeout(timer1);
    }
  }, [isMonteCarloEnabled, monteCarloData, hasStartedAnimation, isCalculating, onAnimationComplete]);

  return {
    animationPhase,
    isShowingLines: animationPhase === 'paths',
    isDrawingFinalLines: animationPhase === 'drawing-final'
  };
};
