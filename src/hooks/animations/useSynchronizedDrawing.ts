import { useState, useEffect, useRef, useCallback } from 'react';
import { MAGIC_MOMENT_TIMERS } from '@/features/portfolio-planning/components/constants';

interface UseSynchronizedDrawingProps {
  isActive: boolean;
  duration?: number;
}

/**
 * High-performance synchronized drawing animation hook
 * Features:
 * - Single animation progress (0→1) for ALL lines simultaneously
 * - Smooth 60fps using requestAnimationFrame
 * - Synchronized reveal from 0% to 100% along X-axis
 * - Minimal state updates for optimal performance
 */
export const useSynchronizedDrawing = ({
  isActive,
  duration = MAGIC_MOMENT_TIMERS.PATHS_DURATION, // 3999ms
}: UseSynchronizedDrawingProps) => {
  const [drawingProgress, setDrawingProgress] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const isAnimatingRef = useRef(false);

  // Main animation frame function - single progress value
  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      setDrawingProgress(progress);

      // Continue animation if not complete
      if (progress < 1 && isAnimatingRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        setIsAnimationComplete(true);
        isAnimatingRef.current = false;
        setDrawingProgress(1);
      }
    },
    [duration]
  );

  // Control animation start/stop
  useEffect(() => {
    if (isActive) {
      // Start synchronized animation
      isAnimatingRef.current = true;
      startTimeRef.current = undefined;
      setDrawingProgress(0);
      setIsAnimationComplete(false);
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setDrawingProgress(0);
      setIsAnimationComplete(false);
    }

    return () => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, animate]);

  return {
    drawingProgress, // 0 to 1 - controls reveal from left to right
    isAnimationComplete,
    isAnimating: isAnimatingRef.current,
  };
};
