import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [_projectingStartTime, setProjectingStartTime] = useState<number | null>(null);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);
  const [hasMinimumTimePassed, setHasMinimumTimePassed] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [_isShowingLines, _setIsShowingLines] = useState(false);

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

  // Check if both conditions are met for transition
  const checkTransitionConditions = useCallback(() => {
    const dataReady = monteCarloData && !isCalculating;
    

    if (hasMinimumTimePassed && dataReady) {
      setAnimationPhase('paths');
    } else {
      const waitingFor: string[] = [];
      if (!hasMinimumTimePassed) waitingFor.push('minimum time (2000ms)');
      if (!dataReady) waitingFor.push('Monte Carlo data');
    }
  }, [hasMinimumTimePassed, monteCarloData, isCalculating]);

  // Reset animation state when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      clearAllTimers();
      setAnimationPhase('final');
      setHasStartedAnimation(false);
      setProjectingStartTime(null);
      setHasMinimumTimePassed(false);
      return;
    }
  }, [isMonteCarloEnabled]);

  // Handle calculation start
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled && !hasStartedAnimation) {
      const startTime = Date.now();
      setProjectingStartTime(startTime);
      setAnimationPhase('projecting');
      setHasStartedAnimation(true);
      setHasMinimumTimePassed(false);

      // Set timer for minimum time (2000ms)
      addTimer(() => {
        
        setHasMinimumTimePassed(true);
      }, MAGIC_MOMENT_TIMERS.PROJECTING_DURATION);
    }
  }, [isCalculating, isMonteCarloEnabled, hasStartedAnimation]);

  // Check transition conditions when minimum time passes
  useEffect(() => {
    if (hasMinimumTimePassed && animationPhase === 'projecting') {
      checkTransitionConditions();
    }
  }, [hasMinimumTimePassed, animationPhase, checkTransitionConditions]);

  // Check transition conditions when data becomes ready
  useEffect(() => {
    if (isMonteCarloEnabled && monteCarloData && !isCalculating && hasStartedAnimation && animationPhase === 'projecting') {
      checkTransitionConditions();
    }
  }, [
    isMonteCarloEnabled,
    monteCarloData,
    isCalculating,
    hasStartedAnimation,
    animationPhase,
    checkTransitionConditions
  ]);

  // Handle subsequent animation phases
  useEffect(() => {
    if (animationPhase === 'paths') {
      
      // Phase 1: Paths (6 seconds)
      addTimer(() => {
        setAnimationPhase('optimizing');
        
        // Phase 2: Optimizing (2 seconds)
        addTimer(() => {
          setAnimationPhase('drawing-final');
          
          // Phase 3: Drawing Final Lines (4 seconds)
          addTimer(() => {
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

