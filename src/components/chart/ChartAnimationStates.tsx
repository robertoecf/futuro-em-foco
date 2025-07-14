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

  addCheckpoint(
    step: string,
    phase: AnimationPhase,
    dataReady: boolean,
    linesVisible: boolean,
    details: Record<string, unknown> = {}
  ) {
    const checkpoint: MagicMomentCheckpoint = {
      step,
      timestamp: Date.now(),
      phase,
      dataReady,
      linesVisible,
      details,
    };

    this.checkpoints.push(checkpoint);
  }

  getFlowReport() {
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
  onAnimationComplete,
}: UseChartAnimationProps) => {
  // 🎯 CORREÇÃO CRÍTICA: Inicializar com 'projecting' se já estiver calculando
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>(
    isCalculating && isMonteCarloEnabled ? 'projecting' : 'final'
  );
  const [_projectingStartTime, setProjectingStartTime] = useState<number | null>(null);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);
  const [hasMinimumTimePassed, setHasMinimumTimePassed] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 🎯 CORREÇÃO DO BUG: Estados para controlar exibição das linhas
  const [shouldShow50Lines, setShouldShow50Lines] = useState(false);
  const [shouldShowAllLines, setShouldShowAllLines] = useState(false);

  // Cleanup function for timers
  const clearAllTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
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

    magicMomentDebugger.addCheckpoint(
      'Checking Transition',
      animationPhase,
      !!dataReady,
      shouldShow50Lines,
      {
        hasMinimumTimePassed,
        monteCarloDataLength: monteCarloData?.scenarios.median.length || 0,
        isCalculating,
        message: hasMinimumTimePassed ? 'Minimum time passed' : 'Waiting minimum time',
      }
    );

    // 🎯 ROTEIRO CRÍTICO: Só transiciona para 'paths' se AMBOS: dados prontos E 1999ms passados E estamos em projecting
    // CENA 1 → CENA 2: Tempo mínimo de 1999ms SEMPRE respeitado
    if (hasMinimumTimePassed && dataReady && animationPhase === 'projecting') {
      setAnimationPhase('paths');
      setShouldShowAllLines(true);
      magicMomentDebugger.addCheckpoint('Transition to Paths (CENA 2)', 'paths', true, true, {
        message: 'CENA 1→2: Transição após 1999ms mínimos + dados prontos',
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
    if (isMonteCarloEnabled && !isCalculating && animationPhase === 'final') {
      // Só reset se estivermos na fase final (animação completa)
      // NÃO reset durante a animação quando isCalculating fica false
      // Safe reset after animation complete
      setHasStartedAnimation(false);
      setHasMinimumTimePassed(false);
      setShouldShow50Lines(false);
      setShouldShowAllLines(false);
      magicMomentDebugger.addCheckpoint('Safe Reset', 'final', false, false, {
        message: 'Reset seguro após animação completa',
      });
    }
  }, [isMonteCarloEnabled, isCalculating, animationPhase]);

  // Force immediate transition to projecting when calculation starts
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled && animationPhase !== 'projecting') {
      setAnimationPhase('projecting');
    }
  }, [isCalculating, isMonteCarloEnabled, animationPhase]);

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
        message: 'Animation started',
      });

      // CENA 1: Minimum time de 1999ms SEMPRE respeitado, mesmo que dados carreguem antes
      addTimer(() => {
        setHasMinimumTimePassed(true);
        magicMomentDebugger.addCheckpoint(
          'Minimum Time Passed (1999ms)',
          'projecting',
          false,
          false,
          {
            message: 'Tempo mínimo de 1999ms respeitado - pode transicionar',
          }
        );
      }, MAGIC_MOMENT_TIMERS.PROJECTING_DURATION);
    }
  }, [isCalculating, isMonteCarloEnabled, hasStartedAnimation]);

  // Check transition conditions when minimum time passes OR when data becomes ready
  useEffect(() => {
    if (hasMinimumTimePassed && animationPhase === 'projecting') {
      checkTransitionConditions();
    }
  }, [hasMinimumTimePassed, animationPhase, checkTransitionConditions]);

  // Also check when data becomes ready
  useEffect(() => {
    if (
      monteCarloData &&
      !isCalculating &&
      animationPhase === 'projecting' &&
      hasMinimumTimePassed
    ) {
      checkTransitionConditions();
    }
  }, [
    monteCarloData,
    isCalculating,
    animationPhase,
    hasMinimumTimePassed,
    checkTransitionConditions,
  ]);

  // Handle subsequent animation phases
  useEffect(() => {
    if (animationPhase === 'paths') {
      magicMomentDebugger.addCheckpoint('CENA 2 Started', 'paths', true, true, {
        duration: MAGIC_MOMENT_TIMERS.PATHS_DURATION,
        message: 'CENA 2: Mostrando 1001 linhas com tooltips desabilitados',
      });

      // CENA 2 → CENA 3: Show 1001 lines for 3999ms, then show optimizing message
      addTimer(() => {
        setAnimationPhase('optimizing');
        setShouldShowAllLines(false);
        setShouldShow50Lines(false); // CENA 3: Apenas mensagem "Otimizando..."

        magicMomentDebugger.addCheckpoint('CENA 3 Started', 'optimizing', true, false, {
          duration: MAGIC_MOMENT_TIMERS.OPTIMIZING_DURATION,
          message: 'CENA 3: Mesmo formato da CENA 1 com texto "Otimizando exibição..."',
        });

        // CENA 3: Show optimizing message for 1999ms, then final
        addTimer(() => {
          setAnimationPhase('drawing-final');
          setShouldShow50Lines(false);
          setShouldShowAllLines(false); // 🎯 CORREÇÃO: Garantir que todas as linhas sejam ocultadas na CENA 4

          magicMomentDebugger.addCheckpoint('CENA 4 Started', 'drawing-final', true, false, {
            duration: MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION,
            message: 'CENA 4: Desenhando 3 linhas finais',
          });

          // CENA 4: Show final result after 3000ms
          addTimer(() => {
            setAnimationPhase('final');
            magicMomentDebugger.addCheckpoint('Animation Complete', 'final', true, false, {
              message: 'Momento mágico completo',
            });

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

  // Clean animation state management

  return {
    animationPhase,
    isShowingLines, // 500 linhas durante fase 'paths'
    isShowing50Lines, // 50 linhas durante fase 'optimizing'
    isDrawingFinalLines: animationPhase === 'drawing-final',
    // Função para debug
    getDebugReport: () => magicMomentDebugger.getFlowReport(),
  };
};
