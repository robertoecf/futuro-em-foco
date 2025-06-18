
import { useState, useEffect, useRef } from 'react';
import { FINAL_LINES_ANIMATION } from '@/components/calculator/constants';

interface UseFinalLinesAnimationProps {
  isDrawingFinalLines: boolean;
}

export const useFinalLinesAnimation = ({
  isDrawingFinalLines
}: UseFinalLinesAnimationProps) => {
  const [currentlyDrawing, setCurrentlyDrawing] = useState<string | null>(null);
  const [completedLines, setCompletedLines] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  console.log('📈 useFinalLinesAnimation:', {
    isDrawingFinalLines,
    currentlyDrawing,
    completedLinesCount: completedLines.size,
    completedLines: Array.from(completedLines)
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
      setCurrentlyDrawing(null);
      setCompletedLines(new Set());
      clearAllTimeouts();

      // Schedule each final line to be drawn (pessimistic → median → optimistic)
      FINAL_LINES_ANIMATION.LINES.forEach((lineKey, index) => {
        // Start drawing the line
        const startDrawingTimeout = setTimeout(() => {
          console.log(`🖊️ Starting to draw final line: ${lineKey}`);
          setCurrentlyDrawing(lineKey);

          // After the drawing animation completes, mark as completed
          const completeDrawingTimeout = setTimeout(() => {
            console.log(`✅ Completed drawing final line: ${lineKey}`);
            setCurrentlyDrawing(null);
            setCompletedLines(prev => new Set([...prev, lineKey]));
          }, FINAL_LINES_ANIMATION.STROKE_ANIMATION_DURATION);

          timeoutsRef.current.push(completeDrawingTimeout);
        }, index * FINAL_LINES_ANIMATION.DELAY_BETWEEN_LINES);

        timeoutsRef.current.push(startDrawingTimeout);
      });
    } else if (!isDrawingFinalLines) {
      // Only reset if we're not in drawing mode - this preserves completed lines
      console.log('🔄 Resetting final lines animation');
      clearAllTimeouts();
      setCurrentlyDrawing(null);
      // Don't reset completedLines here - let them stay visible
    }

    return clearAllTimeouts;
  }, [isDrawingFinalLines]);

  // Get animation state for a specific final line
  const getFinalLineAnimationState = (lineKey: string) => {
    const isDrawing = currentlyDrawing === lineKey;
    const isComplete = completedLines.has(lineKey);
    const isVisible = isDrawing || isComplete;
    
    return {
      isDrawing,
      isComplete,
      isVisible,
      strokeDasharray: isDrawing ? "1000 1000" : "none",
      strokeDashoffset: isDrawing ? "1000" : "0",
      opacity: isVisible ? 1 : 0,
      drawingStyle: isDrawing ? {
        animation: `draw-line ${FINAL_LINES_ANIMATION.STROKE_ANIMATION_DURATION}ms ease-out forwards`
      } : {}
    };
  };

  return {
    getFinalLineAnimationState,
    currentlyDrawing,
    completedLinesCount: completedLines.size,
    isAnimationComplete: completedLines.size === FINAL_LINES_ANIMATION.LINES.length,
    totalFinalLines: FINAL_LINES_ANIMATION.LINES.length
  };
};
