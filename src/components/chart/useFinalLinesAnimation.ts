
import { useState, useEffect, useRef } from 'react';
import { FINAL_LINES_ANIMATION } from '@/components/calculator/constants';

interface UseFinalLinesAnimationProps {
  isDrawingFinalLines: boolean;
}

export const useFinalLinesAnimation = ({
  isDrawingFinalLines
}: UseFinalLinesAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<string>>(new Set());
  const [drawingLines, setDrawingLines] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);


  // Clear all timeouts when component unmounts or animation resets
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Start final lines drawing animation
  useEffect(() => {
    if (isDrawingFinalLines) {
      
      // Reset states
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
      clearAllTimeouts();

      // Schedule each final line to start drawing (pessimistic → median → optimistic)
      FINAL_LINES_ANIMATION.LINES.forEach((lineKey, index) => {
        const startDrawingTimeout = setTimeout(() => {
          setDrawingLines(prev => new Set([...prev, lineKey]));

          // After the drawing animation completes, mark as fully animated
          const completeDrawingTimeout = setTimeout(() => {
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
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
    }

    return clearAllTimeouts;
  }, [isDrawingFinalLines]);

  // Get animation state for a specific final line
  const getFinalLineAnimationState = (lineKey: string) => {
    const isDrawing = drawingLines.has(lineKey);
    const isComplete = animatedLines.has(lineKey);
    
    return {
      isDrawing,
      isComplete,
      isVisible: isDrawing || isComplete,
      strokeDasharray: isDrawing ? "1000 1000" : "none", // Large dash for drawing effect
      strokeDashoffset: isDrawing ? "1000" : "0",
      opacity: isComplete ? 1 : (isDrawing ? 0.8 : 0),
      drawingStyle: isDrawing ? {
        animation: `draw-line ${FINAL_LINES_ANIMATION.STROKE_ANIMATION_DURATION}ms ${FINAL_LINES_ANIMATION.ANIMATION_CURVE} forwards`
      } : {}
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
