

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
  const [hasMinimumTimePassed, setHasMinimumTimePassed] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  console.log('🎬 useChartAnimation state:', {
    isCalculating,
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    animationPhase,
    hasStartedAnimation,
    projectingStartTime,
    hasMinimumTimePassed
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

  // Check if both conditions are met for transition
  const checkTransitionConditions = () => {
    const dataReady = monteCarloData && !isCalculating;
    
    console.log('🔍 Checking transition conditions:', {
      hasMinimumTimePassed,
      dataReady: !!dataReady,
      monteCarloData: !!monteCarloData,
      isCalculating
    });

    if (hasMinimumTimePassed && dataReady) {
      console.log('✅ Both conditions met - transitioning to paths phase');
      setAnimationPhase('paths');
    } else {
      const waitingFor = [];
      if (!hasMinimumTimePassed) waitingFor.push('minimum time (2000ms)');
      if (!dataReady) waitingFor.push('Monte Carlo data');
      console.log(`⏳ Waiting for: ${waitingFor.join(' and ')}`);
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
      setHasMinimumTimePassed(false);
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
      setHasMinimumTimePassed(false);
      console.log('⏱️ Projecting phase started at:', startTime);

      // Set timer for minimum time (2000ms)
      addTimer(() => {
        console.log('⏰ Minimum time (2000ms) has passed');
        setHasMinimumTimePassed(true);
      }, MAGIC_MOMENT_TIMERS.PROJECTING_DURATION);
    }
  }, [isCalculating, isMonteCarloEnabled, hasStartedAnimation]);

  // Check transition conditions when minimum time passes
  useEffect(() => {
    if (hasMinimumTimePassed && animationPhase === 'projecting') {
      console.log('⏰ Minimum time passed - checking if data is ready');
      checkTransitionConditions();
    }
  }, [hasMinimumTimePassed, animationPhase, checkTransitionConditions]);

  // Check transition conditions when data becomes ready
  useEffect(() => {
    if (isMonteCarloEnabled && monteCarloData && !isCalculating && hasStartedAnimation && animationPhase === 'projecting') {
      console.log('📊 Monte Carlo data ready - checking if minimum time has passed');
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

