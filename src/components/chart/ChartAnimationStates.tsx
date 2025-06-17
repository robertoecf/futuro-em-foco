
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

  // Reset animation state when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('🔄 Monte Carlo disabled - resetting animation state');
      setAnimationPhase('final');
      setHasStartedAnimation(false);
      return;
    }
  }, [isMonteCarloEnabled]);

  // Handle calculation start
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled && !hasStartedAnimation) {
      console.log('🚀 Starting calculation - setting projecting phase');
      setAnimationPhase('projecting');
      setHasStartedAnimation(true);
    }
  }, [isCalculating, isMonteCarloEnabled, hasStartedAnimation]);

  // Handle animation sequence when data is ready and calculation is complete
  useEffect(() => {
    if (isMonteCarloEnabled && monteCarloData && !isCalculating && hasStartedAnimation) {
      console.log('📊 Monte Carlo data ready - starting animation sequence');
      
      // Start with paths phase immediately since projecting is done
      setAnimationPhase('paths');
      
      // Phase 1: Paths (6 seconds)
      const timer1 = setTimeout(() => {
        console.log('🔄 Phase 2: Optimizing display...');
        setAnimationPhase('optimizing');
        
        // Phase 2: Optimizing (2 seconds)
        const timer2 = setTimeout(() => {
          console.log('🎯 Phase 3: Drawing final lines...');
          setAnimationPhase('drawing-final');
          
          // Phase 3: Drawing Final Lines (4 seconds)
          const timer3 = setTimeout(() => {
            console.log('✨ Phase 4: Final results');
            setAnimationPhase('final');
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }, MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION);
          
          return () => clearTimeout(timer3);
        }, MAGIC_MOMENT_TIMERS.OPTIMIZING_DURATION);
        
        return () => clearTimeout(timer2);
      }, MAGIC_MOMENT_TIMERS.PATHS_DURATION);
      
      return () => clearTimeout(timer1);
    }
  }, [isMonteCarloEnabled, monteCarloData, isCalculating, hasStartedAnimation, onAnimationComplete]);

  return {
    animationPhase,
    isShowingLines: animationPhase === 'paths',
    isDrawingFinalLines: animationPhase === 'drawing-final'
  };
};
