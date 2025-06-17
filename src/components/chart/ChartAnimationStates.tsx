
import { useState, useEffect, useRef } from 'react';
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
  const [projectingStartTime, setProjectingStartTime] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  console.log('🎬 useChartAnimation state:', {
    isCalculating,
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    animationPhase,
    hasStartedAnimation,
    projectingStartTime
  });

  // Cleanup function for timers
  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  // Helper function to add timer with cleanup
  const addTimer = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  };

  // Handle projecting to paths transition with minimum time control
  const handleProjectingToPathsTransition = () => {
    if (!projectingStartTime || !monteCarloData) return;

    const elapsedTime = Date.now() - projectingStartTime;
    const remainingTime = Math.max(0, MAGIC_MOMENT_TIMERS.PROJECTING_DURATION - elapsedTime);

    console.log('⏱️ Projecting phase timing:', {
      elapsedTime,
      remainingTime,
      minimumDuration: MAGIC_MOMENT_TIMERS.PROJECTING_DURATION
    });

    if (remainingTime > 0) {
      console.log(`⏳ Waiting ${remainingTime}ms more before transitioning to paths...`);
      addTimer(() => {
        console.log('🔄 Phase 2: Starting paths animation...');
        setAnimationPhase('paths');
      }, remainingTime);
    } else {
      console.log('🔄 Phase 2: Starting paths animation immediately...');
      setAnimationPhase('paths');
    }
  };

  // Reset animation state when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('🔄 Monte Carlo disabled - resetting animation state');
      clearAllTimers();
      setAnimationPhase('final');
      setHasStartedAnimation(false);
      setProjectingStartTime(null);
      return;
    }
  }, [isMonteCarloEnabled]);

  // Handle calculation start
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled && !hasStartedAnimation) {
      console.log('🚀 Starting calculation - setting projecting phase');
      const startTime = Date.now();
      setProjectingStartTime(startTime);
      setAnimationPhase('projecting');
      setHasStartedAnimation(true);
      console.log('⏱️ Projecting phase started at:', startTime);
    }
  }, [isCalculating, isMonteCarloEnabled, hasStartedAnimation]);

  // Handle animation sequence when data is ready
  useEffect(() => {
    if (isMonteCarloEnabled && monteCarloData && !isCalculating && hasStartedAnimation && animationPhase === 'projecting') {
      console.log('📊 Monte Carlo data ready - checking projecting phase timing');
      handleProjectingToPathsTransition();
    }
  }, [isMonteCarloEnabled, monteCarloData, isCalculating, hasStartedAnimation, animationPhase, projectingStartTime]);

  // Handle subsequent animation phases
  useEffect(() => {
    if (animationPhase === 'paths') {
      console.log('🎨 Starting paths phase - will last', MAGIC_MOMENT_TIMERS.PATHS_DURATION, 'ms');
      
      // Phase 1: Paths (6 seconds)
      addTimer(() => {
        console.log('🔄 Phase 3: Optimizing display...');
        setAnimationPhase('optimizing');
        
        // Phase 2: Optimizing (2 seconds)
        addTimer(() => {
          console.log('🎯 Phase 4: Drawing final lines...');
          setAnimationPhase('drawing-final');
          
          // Phase 3: Drawing Final Lines (4 seconds)
          addTimer(() => {
            console.log('✨ Phase 5: Final results');
            setAnimationPhase('final');
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          }, MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION);
        }, MAGIC_MOMENT_TIMERS.OPTIMIZING_DURATION);
      }, MAGIC_MOMENT_TIMERS.PATHS_DURATION);
    }
  }, [animationPhase, onAnimationComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  return {
    animationPhase,
    isShowingLines: animationPhase === 'paths',
    isDrawingFinalLines: animationPhase === 'drawing-final'
  };
};
