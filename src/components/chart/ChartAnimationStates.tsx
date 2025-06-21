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

// 🔍 SISTEMA DE DEBUG PARA MOMENTO MÁGICO
interface MagicMomentCheckpoint {
  step: string;
  timestamp: number;
  phase: AnimationPhase;
  dataReady: boolean;
  linesVisible: boolean;
  details: Record<string, unknown>;
}

class MagicMomentDebugger {
  private checkpoints: MagicMomentCheckpoint[] = [];
  
  addCheckpoint(step: string, phase: AnimationPhase, dataReady: boolean, linesVisible: boolean, details: Record<string, unknown> = {}) {
    const checkpoint: MagicMomentCheckpoint = {
      step,
      timestamp: Date.now(),
      phase,
      dataReady,
      linesVisible,
      details
    };
    
    this.checkpoints.push(checkpoint);
    console.log(`🔍 MAGIC MOMENT CHECKPOINT [${step}]:`, {
      phase,
      dataReady,
      linesVisible,
      ...details
    });
  }
  
  getFlowReport() {
    console.log('📋 MAGIC MOMENT FLOW REPORT:', this.checkpoints);
    return this.checkpoints;
  }
  
  clear() {
    this.checkpoints = [];
  }
}

const magicMomentDebugger = new MagicMomentDebugger();

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
  
  // 🎯 CORREÇÃO DO BUG: Estados para controlar exibição das linhas
  const [shouldShow50Lines, setShouldShow50Lines] = useState(false);
  const [shouldShowAllLines, setShouldShowAllLines] = useState(false);

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
    
    magicMomentDebugger.addCheckpoint('Checking Transition', animationPhase, !!dataReady, shouldShow50Lines, {
      hasMinimumTimePassed,
      monteCarloDataLength: monteCarloData?.scenarios.median.length || 0,
      isCalculating
    });

    if (hasMinimumTimePassed && dataReady) {
      setAnimationPhase('paths');
      setShouldShowAllLines(true); // ✅ Mostrar todas as 500 linhas
      magicMomentDebugger.addCheckpoint('Transition to Paths', 'paths', true, true, {
        message: 'Starting to show all 500 lines'
      });
    } else {
      const waitingFor: string[] = [];
      if (!hasMinimumTimePassed) waitingFor.push('minimum time (1999ms)');
      if (!dataReady) waitingFor.push('Monte Carlo data');
      magicMomentDebugger.addCheckpoint('Waiting for Conditions', animationPhase, !!dataReady, shouldShow50Lines, {
        waitingFor
      });
    }
  }, [hasMinimumTimePassed, monteCarloData, isCalculating, animationPhase, shouldShow50Lines]);

  // Reset animation state when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      clearAllTimers();
      setAnimationPhase('final');
      setHasStartedAnimation(false);
      setProjectingStartTime(null);
      setHasMinimumTimePassed(false);
      setShouldShow50Lines(false);
      setShouldShowAllLines(false);
      magicMomentDebugger.clear();
      return;
    }
  }, [isMonteCarloEnabled]);

  // 🎯 CORREÇÃO CRÍTICA: Reset hasStartedAnimation quando Monte Carlo é reativado
  useEffect(() => {
    if (isMonteCarloEnabled && !isCalculating) {
      // Reset animation state when Monte Carlo is re-enabled but not calculating
      setHasStartedAnimation(false);
      setAnimationPhase('final');
      setHasMinimumTimePassed(false);
      setShouldShow50Lines(false);
      setShouldShowAllLines(false);
      magicMomentDebugger.addCheckpoint('Monte Carlo Re-enabled', 'final', false, false, {
        message: 'Monte Carlo reativado - estado resetado para nova animação'
      });
    }
  }, [isMonteCarloEnabled, isCalculating]);

  // Handle calculation start
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled && !hasStartedAnimation) {
      const startTime = Date.now();
      setProjectingStartTime(startTime);
      setAnimationPhase('projecting');
      setHasStartedAnimation(true);
      setHasMinimumTimePassed(false);
      setShouldShow50Lines(false);
      setShouldShowAllLines(false);
      
      magicMomentDebugger.addCheckpoint('Animation Started', 'projecting', false, false, {
        startTime,
        message: 'Magic moment começou - fase projecting com 1999ms'
      });

      // Set timer for minimum time (1999ms)
      addTimer(() => {
        setHasMinimumTimePassed(true);
        magicMomentDebugger.addCheckpoint('Minimum Time Passed', 'projecting', false, false, {
          elapsed: Date.now() - startTime,
          message: 'Tempo mínimo de 1999ms atingido'
        });
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
      magicMomentDebugger.addCheckpoint('Paths Phase Started', 'paths', true, true, {
        duration: MAGIC_MOMENT_TIMERS.PATHS_DURATION,
        message: 'Exibindo 500 linhas Monte Carlo'
      });
      
      // Phase 1: Paths (6 seconds) - Mostrar todas as 500 linhas
      addTimer(() => {
        setAnimationPhase('optimizing');
        setShouldShowAllLines(false); // ❌ Parar de mostrar todas
        setShouldShow50Lines(true);   // ✅ Mostrar apenas 50 linhas
        
        magicMomentDebugger.addCheckpoint('Optimizing Phase Started', 'optimizing', true, true, {
          duration: MAGIC_MOMENT_TIMERS.OPTIMIZING_DURATION,
          message: 'Mostrando 50 linhas durante otimização'
        });
        
        // Phase 2: Optimizing (2 seconds) - Mostrar 50 linhas
        addTimer(() => {
          setAnimationPhase('drawing-final');
          setShouldShow50Lines(false); // ❌ Parar de mostrar 50
          
          magicMomentDebugger.addCheckpoint('Drawing Final Phase Started', 'drawing-final', true, false, {
            duration: MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION,
            message: 'Desenhando 3 linhas finais'
          });
          
          // Phase 3: Drawing Final Lines (4 seconds)
          addTimer(() => {
            setAnimationPhase('final');
            magicMomentDebugger.addCheckpoint('Animation Complete', 'final', true, false, {
              message: 'Momento mágico finalizado'
            });
            
            // Gerar relatório final
            magicMomentDebugger.getFlowReport();
            
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

  // 🎯 CORREÇÃO: Lógica corrigida para exibição das linhas
  const isShowingLines = shouldShowAllLines; // 500 linhas durante 'paths'
  const isShowing50Lines = shouldShow50Lines; // 50 linhas durante 'optimizing'

  return {
    animationPhase,
    isShowingLines,        // 500 linhas durante fase 'paths'
    isShowing50Lines,      // 50 linhas durante fase 'optimizing' 
    isDrawingFinalLines: animationPhase === 'drawing-final',
    // Função para debug
    getDebugReport: () => magicMomentDebugger.getFlowReport()
  };
};

