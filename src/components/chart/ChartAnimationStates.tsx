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
    
    console.log('🔍 VERIFICANDO TRANSIÇÃO:', {
      hasMinimumTimePassed,
      dataReady,
      isCalculating,
      animationPhase,
      monteCarloDataLength: monteCarloData?.scenarios.median.length || 0
    });
    
    magicMomentDebugger.addCheckpoint('Checking Transition', animationPhase, !!dataReady, shouldShow50Lines, {
      hasMinimumTimePassed,
      monteCarloDataLength: monteCarloData?.scenarios.median.length || 0,
      isCalculating,
      message: hasMinimumTimePassed ? 'Tempo mínimo atingido' : 'Aguardando tempo mínimo'
    });

    // 🎯 ROTEIRO CRÍTICO: Só transiciona para 'paths' se AMBOS: dados prontos E 1999ms passados E estamos em projecting
    if (hasMinimumTimePassed && dataReady && animationPhase === 'projecting') {
      setAnimationPhase('paths');
      setShouldShowAllLines(true);
      magicMomentDebugger.addCheckpoint('Transition to Paths', 'paths', true, true, {
        message: 'Transição para paths - desenhando 500 trajetórias'
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
      console.log('🔄 RESET SEGURO - animação já finalizada');
      setHasStartedAnimation(false);
      setHasMinimumTimePassed(false);
      setShouldShow50Lines(false);
      setShouldShowAllLines(false);
      magicMomentDebugger.addCheckpoint('Safe Reset', 'final', false, false, {
        message: 'Reset seguro após animação completa'
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
        message: 'Animation started'
      });

      // Minimum time before showing paths
      addTimer(() => {
        setHasMinimumTimePassed(true);
        magicMomentDebugger.addCheckpoint('Minimum Time Passed', 'projecting', false, false, {
          message: 'Minimum time passed'
        });
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
    if (monteCarloData && !isCalculating && animationPhase === 'projecting' && hasMinimumTimePassed) {
      checkTransitionConditions();
    }
  }, [monteCarloData, isCalculating, animationPhase, hasMinimumTimePassed, checkTransitionConditions]);

  // Handle subsequent animation phases
  useEffect(() => {
    if (animationPhase === 'paths') {
      magicMomentDebugger.addCheckpoint('Paths Phase Started', 'paths', true, true, {
        duration: MAGIC_MOMENT_TIMERS.PATHS_DURATION,
        message: 'ROTEIRO 2: Desenhando gradualmente 500 linhas (3999ms)'
      });
      
      // ROTEIRO 2: Paths (6 seconds) - Desenhar gradualmente todas as 500 linhas
      addTimer(() => {
        setAnimationPhase('optimizing');
        setShouldShowAllLines(false); // ❌ Parar de mostrar todas
        setShouldShow50Lines(true);   // ✅ Mostrar apenas 50 linhas
        
        magicMomentDebugger.addCheckpoint('Optimizing Phase Started', 'optimizing', true, true, {
          duration: MAGIC_MOMENT_TIMERS.OPTIMIZING_DURATION,
          message: 'ROTEIRO 3: Otimizando visualização... (mínimo 1999ms)'
        });
        
        // ROTEIRO 3: Optimizing (1999ms) - "Otimizando visualização..." 
        addTimer(() => {
          setAnimationPhase('drawing-final');
          setShouldShow50Lines(false); // ❌ Parar de mostrar 50
          
          magicMomentDebugger.addCheckpoint('Drawing Final Phase Started', 'drawing-final', true, false, {
            duration: MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION,
            message: 'ROTEIRO 4: Desenhando com calma as 3 trajetórias finais (1 a 1)'
          });
          
          // ROTEIRO 4: Drawing Final Lines (4 seconds) - Desenhar com calma 1 a 1
          addTimer(() => {
            setAnimationPhase('final');
            magicMomentDebugger.addCheckpoint('Animation Complete', 'final', true, false, {
              message: 'ROTEIRO COMPLETO: Momento mágico finalizado'
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

  // Clean animation state management

  return {
    animationPhase,
    isShowingLines,        // 500 linhas durante fase 'paths'
    isShowing50Lines,      // 50 linhas durante fase 'optimizing' 
    isDrawingFinalLines: animationPhase === 'drawing-final',
    // Função para debug
    getDebugReport: () => magicMomentDebugger.getFlowReport()
  };
};

