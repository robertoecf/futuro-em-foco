import React, { useMemo, useState, useEffect, useRef } from 'react';

interface FinalLineAnimationProps {
  isDrawingFinalLines: boolean;
}

interface AnimationState {
  strokeDasharray: string;
  strokeDashoffset: string;
  opacity: number;
  drawingStyle: React.CSSProperties;
  isVisible: boolean;
}

const ANIMATION_TIMINGS = {
  DURATION_PER_LINE: 1000, // 1 segundo por linha
  STAGGER_DELAY: 0, // Começar todas ao mesmo tempo mas com delays diferentes
  TOTAL_DURATION: 3000, // 3 segundos total
  PESSIMISTIC_START: 0,
  MEDIAN_START: 500, // Começa 0.5s depois
  OPTIMISTIC_START: 1000, // Começa 1s depois
};

export const useFinalLinesAnimation = ({ isDrawingFinalLines }: FinalLineAnimationProps) => {
  const [animationTime, setAnimationTime] = useState(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Gerencia o timer da animação
  useEffect(() => {
    if (!isDrawingFinalLines) {
      setAnimationTime(0);
      startTimeRef.current = undefined;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateAnimation = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      setAnimationTime(elapsed);

      if (elapsed < ANIMATION_TIMINGS.TOTAL_DURATION) {
        animationFrameRef.current = requestAnimationFrame(updateAnimation);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDrawingFinalLines]);

  const getFinalLineAnimationState = useMemo(() => {
    return (lineType: 'optimistic' | 'median' | 'pessimistic'): AnimationState => {
      if (!isDrawingFinalLines) {
        // Estado final: todas as linhas completamente visíveis
        return {
          strokeDasharray: lineType === 'median' ? 'none' : '5 5',
          strokeDashoffset: '0',
          opacity: 1,
          drawingStyle: {},
          isVisible: true,
        };
      }

      // Determinar o timing para cada linha
      let startTime: number;
      let baseDashArray: string;

      switch (lineType) {
        case 'pessimistic':
          startTime = ANIMATION_TIMINGS.PESSIMISTIC_START;
          baseDashArray = '5 5';
          break;
        case 'median':
          startTime = ANIMATION_TIMINGS.MEDIAN_START;
          baseDashArray = 'none';
          break;
        case 'optimistic':
          startTime = ANIMATION_TIMINGS.OPTIMISTIC_START;
          baseDashArray = '5 5';
          break;
        default:
          startTime = 0;
          baseDashArray = 'none';
      }

      // Calcular progresso para esta linha específica
      const lineElapsed = Math.max(0, animationTime - startTime);
      const lineProgress = Math.min(lineElapsed / ANIMATION_TIMINGS.DURATION_PER_LINE, 1);

      // Se ainda não começou a desenhar esta linha
      if (animationTime < startTime) {
        return {
          strokeDasharray: '1000 1000',
          strokeDashoffset: '1000',
          opacity: 0,
          drawingStyle: {},
          isVisible: false,
        };
      }

      // Animação de desenho usando dashoffset
      const dashOffset = 1000 * (1 - lineProgress);
      const opacity = 0.3 + 0.7 * lineProgress; // De 0.3 a 1.0

      const animationState: AnimationState = {
        strokeDasharray: lineProgress === 1 ? baseDashArray : '1000 1000',
        strokeDashoffset: lineProgress === 1 ? '0' : dashOffset.toString(),
        opacity: lineProgress === 1 ? 1 : opacity,
        drawingStyle: {
          transition: lineProgress === 1 ? 'stroke-dasharray 0.3s ease-out' : 'none',
        },
        isVisible: true,
      };

      console.log(
        `🎬 Animation state for ${lineType} (time: ${animationTime.toFixed(0)}ms, progress: ${(lineProgress * 100).toFixed(1)}%):`,
        {
          startTime,
          lineElapsed,
          progress: lineProgress,
          dashOffset,
          opacity,
        }
      );

      return animationState;
    };
  }, [isDrawingFinalLines, animationTime]);

  const isAnimationComplete = useMemo(() => {
    return !isDrawingFinalLines || animationTime >= ANIMATION_TIMINGS.TOTAL_DURATION;
  }, [isDrawingFinalLines, animationTime]);

  return {
    getFinalLineAnimationState,
    isAnimationComplete,
  };
};
