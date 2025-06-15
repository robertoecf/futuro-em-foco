
import { useState, useEffect } from 'react';
import { MonteCarloResult } from '@/lib/utils';

interface UseChartAnimationProps {
  isCalculating: boolean;
  isMonteCarloEnabled: boolean;
  monteCarloData: MonteCarloResult | null;
  onAnimationComplete?: () => void;
}

export type AnimationPhase = 'projecting' | 'optimizing' | 'paths' | 'final';

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

  // Reset when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('🔄 Monte Carlo disabled - resetting animation');
      setAnimationPhase('final');
      setHasStartedAnimation(false);
      return;
    }
  }, [isMonteCarloEnabled]);

  // Start animation sequence when Monte Carlo data is ready
  useEffect(() => {
    if (isMonteCarloEnabled && monteCarloData && !hasStartedAnimation) {
      console.log('🚀 Starting Monte Carlo animation sequence');
      setHasStartedAnimation(true);
      
      // Phase 1: Projecting (3 seconds minimum)
      setAnimationPhase('projecting');
      
      const timer1 = setTimeout(() => {
        console.log('🔄 Phase 2: Optimizing display...');
        setAnimationPhase('optimizing');
        
        // Phase 2: Optimizing (2 seconds)
        const timer2 = setTimeout(() => {
          console.log('📈 Phase 3: Showing 50 paths...');
          setAnimationPhase('paths');
          
          // Phase 3: Paths (6 seconds)
          const timer3 = setTimeout(() => {
            console.log('✨ Phase 4: Final results');
            setAnimationPhase('final');
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }, 6000);
          
          return () => clearTimeout(timer3);
        }, 2000);
        
        return () => clearTimeout(timer2);
      }, 3000);
      
      return () => clearTimeout(timer1);
    }
  }, [isMonteCarloEnabled, monteCarloData, hasStartedAnimation, onAnimationComplete]);

  // Reset animation state when calculation starts
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled) {
      console.log('🔄 Calculation started - resetting animation state');
      setHasStartedAnimation(false);
      setAnimationPhase('projecting');
    }
  }, [isCalculating, isMonteCarloEnabled]);

  return {
    animationPhase,
    isShowingLines: animationPhase === 'paths'
  };
};
