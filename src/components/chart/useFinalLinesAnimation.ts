
import { useState, useEffect, useRef } from 'react';
import { FINAL_LINES_ANIMATION } from '@/components/calculator/constants';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface UseFinalLinesAnimationProps {
  isDrawingFinalLines: boolean;
}

export const useFinalLinesAnimation = ({
  isDrawingFinalLines
}: UseFinalLinesAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<string>>(new Set());
  const [drawingLines, setDrawingLines] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const prefersReducedMotion = usePrefersReducedMotion();

  console.log('📈 useFinalLinesAnimation:', {
    isDrawingFinalLines,
    animatedLinesCount: animatedLines.size,
    drawingLinesCount: drawingLines.size,
    animatedLines: Array.from(animatedLines),
    drawingLines: Array.from(drawingLines)
  });

  // Clear all timeouts when component unmounts or animation resets
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Start final lines drawing animation
  useEffect(() => {
    if (isDrawingFinalLines) {
      console.log('🎯 Starting final lines drawing animation');

      // Reset states
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
      clearAllTimeouts();

      if (prefersReducedMotion) {
        const allFinalLines = new Set<string>(FINAL_LINES_ANIMATION.LINES);
        setAnimatedLines(allFinalLines);
        return;
      }

      // Schedule each final line to start drawing (pessimistic → median → optimistic)
      FINAL_LINES_ANIMATION.LINES.forEach((lineKey, index) => {
        const startDrawingTimeout = setTimeout(() => {
          console.log(`🖊️ Starting to draw final line: ${lineKey}`);
          setDrawingLines(prev => new Set([...prev, lineKey]));

          // After the drawing animation completes, mark as fully animated
          const completeDrawingTimeout = setTimeout(() => {
            console.log(`✅ Completed drawing final line: ${lineKey}`);
            setDrawingLines(prev => {
              const next = new Set(prev);
              next.delete(lineKey);
              return next;
            });
            setAnimatedLines(prev => new Set([...prev, lineKey]));
          }, FINAL_LINES_ANIMATION.STROKE_ANIMATION_DURATION);

          timeoutsRef.current.push(completeDrawingTimeout);
        }, index * FINAL_LINES_ANIMATION.DELAY_BETWEEN_LINES);

        timeoutsRef.current.push(startDrawingTimeout);
      });
    } else {
      console.log('🔄 Resetting final lines animation');
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
    }

    return clearAllTimeouts;
  }, [isDrawingFinalLines, prefersReducedMotion]);

  // Get animation state for a specific final line
  const getFinalLineAnimationState = (lineKey: string) => {
    const isDrawing = drawingLines.has(lineKey);
    const isComplete = animatedLines.has(lineKey);

    if (prefersReducedMotion) {
      return {
        isDrawing: false,
        isComplete: true,
        isVisible: true,
        strokeDasharray: 'none',
        strokeDashoffset: '0',
        opacity: 1,
        drawingStyle: {}
      };
    }

    return {
      isDrawing,
      isComplete,
      isVisible: isDrawing || isComplete,
      strokeDasharray: isDrawing ? '1000 1000' : 'none', // Large dash for drawing effect
      strokeDashoffset: isDrawing ? '1000' : '0',
      opacity: isComplete ? 1 : (isDrawing ? 0.8 : 0),
      drawingStyle: isDrawing
        ? {
            animation: `draw-line ${FINAL_LINES_ANIMATION.STROKE_ANIMATION_DURATION}ms ${FINAL_LINES_ANIMATION.ANIMATION_CURVE} forwards`
          }
        : {}
    };
  };

  return {
    getFinalLineAnimationState,
    animatedLinesCount: animatedLines.size,
    drawingLinesCount: drawingLines.size,
    isAnimationComplete: animatedLines.size === FINAL_LINES_ANIMATION.LINES.length,
    totalFinalLines: FINAL_LINES_ANIMATION.LINES.length
  };
};
