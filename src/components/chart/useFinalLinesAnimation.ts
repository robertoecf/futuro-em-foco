import { useState, useEffect, useRef, useMemo } from 'react';
import React from 'react';
import { MAGIC_MOMENT_TIMERS } from '@/components/calculator/constants';

interface UseFinalLinesAnimationProps {
  isDrawingFinalLines: boolean;
}

interface AnimationState {
  strokeDasharray: string;
  strokeDashoffset: string;
  opacity: number;
  drawingStyle: React.CSSProperties;
  isVisible: boolean;
}

export const useFinalLinesAnimation = ({ isDrawingFinalLines }: UseFinalLinesAnimationProps) => {
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

      if (elapsed < MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION) {
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
    return (): AnimationState => {
      if (!isDrawingFinalLines) {
        // Estado final: todas as linhas completamente visíveis
        return {
          strokeDasharray: '1000',
          strokeDashoffset: '0',
          opacity: 1,
          drawingStyle: {},
          isVisible: true,
        };
      }

      // Todas as linhas começam juntas, sem delay
      const lineElapsed = animationTime;
      const lineProgress = Math.min(lineElapsed / MAGIC_MOMENT_TIMERS.DRAWING_FINAL_DURATION, 1);

      // Se ainda não começou a desenhar
      if (animationTime <= 0) {
        return {
          strokeDasharray: '1000',
          strokeDashoffset: '1000',
          opacity: 1,
          drawingStyle: {},
          isVisible: true,
        };
      }

      // Animação de desenho literal usando dashoffset
      const dashOffset = 1000 * (1 - lineProgress);

      return {
        strokeDasharray: '1000',
        strokeDashoffset: `${dashOffset}`,
        opacity: 1,
        drawingStyle: {},
        isVisible: true,
      };
    };
  }, [isDrawingFinalLines, animationTime]);

  return { getFinalLineAnimationState };
};
