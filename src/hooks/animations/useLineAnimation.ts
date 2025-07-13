import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { LINE_ANIMATION } from '@/features/portfolio-planning/components/constants';

interface UseLineAnimationProps {
  isShowingLines: boolean;
  totalLines: number;
  drawingDuration?: number;
}

interface LineAnimationState {
  isDrawing: boolean;
  isComplete: boolean;
  isVisible: boolean;
  strokeDasharray: string;
  strokeDashoffset: string;
  opacity: number;
  animationDelay: string;
  drawingStyle: React.CSSProperties;
}

/**
 * Optimized line animation hook with proper cleanup and memory management
 * Features:
 * - Efficient timeout management
 * - Memory leak prevention
 * - Proper cleanup on unmount
 * - Optimized re-renders
 */
export const useLineAnimation = ({
  isShowingLines,
  totalLines = LINE_ANIMATION.TOTAL_LINES,
  drawingDuration = LINE_ANIMATION.DRAWING_DURATION,
}: UseLineAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<number>>(new Set());
  const [drawingLines, setDrawingLines] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const isUnmountedRef = useRef(false);

  // Calculate delay between lines based on total duration
  const delayBetweenLines = drawingDuration / totalLines;

  // Optimized cleanup function
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  // Optimized state updater to prevent unnecessary re-renders
  const updateAnimatedLines = useCallback((lineIndex: number) => {
    if (isUnmountedRef.current) return;

    setAnimatedLines((prev) => {
      const newSet = new Set(prev);
      newSet.add(lineIndex);
      return newSet;
    });
  }, []);

  const updateDrawingLines = useCallback((lineIndex: number, isDrawing: boolean) => {
    if (isUnmountedRef.current) return;

    setDrawingLines((prev) => {
      const newSet = new Set(prev);
      if (isDrawing) {
        newSet.add(lineIndex);
      } else {
        newSet.delete(lineIndex);
      }
      return newSet;
    });
  }, []);

  // Optimized animation starter
  const startLineAnimation = useCallback(
    (lineIndex: number) => {
      if (isUnmountedRef.current) return;

      // Start drawing phase
      updateDrawingLines(lineIndex, true);

      // Schedule completion
      const completeTimeout = setTimeout(() => {
        if (isUnmountedRef.current) return;

        updateDrawingLines(lineIndex, false);
        updateAnimatedLines(lineIndex);

        // Clean up this timeout
        timeoutsRef.current.delete(lineIndex);
      }, LINE_ANIMATION.STROKE_ANIMATION_DURATION);

      timeoutsRef.current.set(lineIndex, completeTimeout);
    },
    [updateDrawingLines, updateAnimatedLines]
  );

  // Main animation effect
  useEffect(() => {
    if (isShowingLines) {
      // Reset states
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
      clearAllTimeouts();

      // Schedule each line animation
      for (let i = 0; i < totalLines; i++) {
        const startTimeout = setTimeout(() => {
          startLineAnimation(i);
        }, i * delayBetweenLines);

        timeoutsRef.current.set(i * -1 - 1, startTimeout); // Use negative keys for start timeouts
      }
    } else {
      // Clear all animations
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
    }

    // Cleanup on dependency change
    return clearAllTimeouts;
  }, [isShowingLines, totalLines, delayBetweenLines, startLineAnimation, clearAllTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Optimized animation state getter with memoization
  const getLineAnimationState = useCallback(
    (lineIndex: number): LineAnimationState => {
      const isDrawing = drawingLines.has(lineIndex);
      const isComplete = animatedLines.has(lineIndex);

      return {
        isDrawing,
        isComplete,
        isVisible: isDrawing || isComplete,
        strokeDasharray: isDrawing ? '1000 1000' : 'none',
        strokeDashoffset: isDrawing ? '1000' : '0',
        opacity: isComplete ? 1 : isDrawing ? 0.8 : 0,
        animationDelay: `${lineIndex * delayBetweenLines}ms`,
        drawingStyle: isDrawing
          ? {
              animation: `draw-line ${LINE_ANIMATION.STROKE_ANIMATION_DURATION}ms ${LINE_ANIMATION.ANIMATION_CURVE} forwards`,
            }
          : {},
      };
    },
    [drawingLines, animatedLines, delayBetweenLines]
  );

  return {
    getLineAnimationState,
    animatedLinesCount: animatedLines.size,
    drawingLinesCount: drawingLines.size,
    isAnimationComplete: animatedLines.size === totalLines,
    totalLines,
    clearAllTimeouts,
  };
};
