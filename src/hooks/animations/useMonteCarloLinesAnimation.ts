import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MAGIC_MOMENT_TIMERS } from '@/features/portfolio-planning/components/constants';

interface UseMonteCarloLinesAnimationProps {
  isShowingLines: boolean;
  totalLines?: number;
  animationDuration?: number;
}

interface MonteCarloLineAnimationState {
  isDrawing: boolean;
  isComplete: boolean;
  isVisible: boolean;
  strokeDasharray: string;
  strokeDashoffset: string;
  opacity: number;
  drawingStyle: React.CSSProperties;
}

/**
 * Progressive line drawing animation hook for Monte Carlo lines in Scene 2
 * Features:
 * - All 1001 lines draw progressively from 0% to 100% along X-axis
 * - Synchronized timing with magic moment PATHS_DURATION (3999ms)
 * - Smooth 60fps animation using requestAnimationFrame
 * - Memory efficient with proper cleanup
 */
export const useMonteCarloLinesAnimation = ({
  isShowingLines,
  totalLines = 1001,
  animationDuration = MAGIC_MOMENT_TIMERS.PATHS_DURATION, // 3999ms
}: UseMonteCarloLinesAnimationProps) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [drawingLines, setDrawingLines] = useState<Set<number>>(new Set());
  const [completedLines, setCompletedLines] = useState<Set<number>>(new Set());

  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const isAnimatingRef = useRef(false);

  // Calculate timing parameters
  const lineDrawDuration = animationDuration * 0.75; // 75% of total time for drawing each line
  const maxStaggerDelay = animationDuration * 0.25; // 25% of total time for stagger
  const staggerDelayPerLine = maxStaggerDelay / totalLines; // Delay between line starts

  // Get progress for a specific line
  const getLineProgress = useCallback(
    (lineIndex: number, currentTime: number) => {
      const lineStartTime = lineIndex * staggerDelayPerLine;
      const lineElapsed = Math.max(0, currentTime - lineStartTime);
      return Math.min(lineElapsed / lineDrawDuration, 1);
    },
    [staggerDelayPerLine, lineDrawDuration]
  );

  // Main animation frame function
  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      setAnimationProgress(elapsed);

      // Update line states based on progress
      const newDrawingLines = new Set<number>();
      const newCompletedLines = new Set<number>();

      for (let lineIndex = 0; lineIndex < totalLines; lineIndex++) {
        const lineProgress = getLineProgress(lineIndex, elapsed);

        if (lineProgress > 0 && lineProgress < 1) {
          newDrawingLines.add(lineIndex);
        } else if (lineProgress >= 1) {
          newCompletedLines.add(lineIndex);
        }
      }

      setDrawingLines(newDrawingLines);
      setCompletedLines(newCompletedLines);

      // Continue animation if not complete
      if (elapsed < animationDuration && isAnimatingRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - all lines should be completed
        isAnimatingRef.current = false;
        const allLinesSet = new Set(Array.from({ length: totalLines }, (_, i) => i));
        setCompletedLines(allLinesSet);
        setDrawingLines(new Set());
        setAnimationProgress(animationDuration);
      }
    },
    [totalLines, animationDuration, getLineProgress]
  );

  // Control animation start/stop
  useEffect(() => {
    if (isShowingLines) {
      // Start animation
      isAnimatingRef.current = true;
      startTimeRef.current = undefined;
      setAnimationProgress(0);
      setDrawingLines(new Set());
      setCompletedLines(new Set());
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Stop animation
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAnimationProgress(0);
      setDrawingLines(new Set());
      setCompletedLines(new Set());
    }

    return () => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isShowingLines, animate]);

  // Get animation state for a specific line
  const getLineAnimationState = useCallback(
    (lineIndex: number): MonteCarloLineAnimationState => {
      const lineProgress = getLineProgress(lineIndex, animationProgress);
      const isDrawing = drawingLines.has(lineIndex);
      const isComplete = completedLines.has(lineIndex);
      const isVisible = isDrawing || isComplete;

      // Calculate stroke dash offset for progressive drawing effect
      const dashLength = 1000; // Large dash for smooth drawing
      const strokeDashoffset = isDrawing ? dashLength * (1 - lineProgress) : 0;

      // Opacity progression: start at 0.2, reach 0.6 when drawing, final 0.3
      let opacity = 0;
      if (isComplete) {
        opacity = 0.3; // Final opacity for completed lines
      } else if (isDrawing) {
        opacity = 0.2 + 0.4 * lineProgress; // Progressive opacity while drawing
      }

      return {
        isDrawing,
        isComplete,
        isVisible,
        strokeDasharray: isDrawing ? `${dashLength} ${dashLength}` : 'none',
        strokeDashoffset: strokeDashoffset.toString(),
        opacity,
        drawingStyle: isDrawing
          ? {
              transition: 'stroke-dashoffset 0.1s linear',
            }
          : {},
      };
    },
    [animationProgress, drawingLines, completedLines, getLineProgress]
  );

  return {
    getLineAnimationState,
    animationProgress,
    isAnimationComplete: animationProgress >= animationDuration,
    totalLines,
    drawingLinesCount: drawingLines.size,
    completedLinesCount: completedLines.size,
  };
};
