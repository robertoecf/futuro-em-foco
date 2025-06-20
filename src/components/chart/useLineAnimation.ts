
import { useState, useEffect, useRef } from 'react';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface UseLineAnimationProps {
  isShowingLines: boolean;
  totalLines: number;
  drawingDuration?: number;
}

export const useLineAnimation = ({
  isShowingLines,
  totalLines = LINE_ANIMATION.TOTAL_LINES,
  drawingDuration = LINE_ANIMATION.DRAWING_DURATION
}: UseLineAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<number>>(new Set());
  const [drawingLines, setDrawingLines] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  console.log('🎨 useLineAnimation:', {
    isShowingLines,
    totalLines,
    drawingDuration,
    animatedLinesCount: animatedLines.size,
    drawingLinesCount: drawingLines.size
  });

  // Calculate delay between lines based on total duration
  const delayBetweenLines = drawingDuration / totalLines;

  // Clear all timeouts when component unmounts or animation resets
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Start line drawing animation
  useEffect(() => {
    if (isShowingLines) {
      console.log('🚀 Starting line drawing animation');
      
      // Reset states
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
      clearAllTimeouts();

      // Schedule each line to start drawing
      for (let i = 0; i < totalLines; i++) {
        const startDrawingTimeout = setTimeout(() => {
          console.log(`✏️ Starting to draw line ${i}`);
          setDrawingLines(prev => new Set([...prev, i]));

          // After the drawing animation completes, mark as fully animated
          const completeDrawingTimeout = setTimeout(() => {
            console.log(`✅ Completed drawing line ${i}`);
            setDrawingLines(prev => {
              const next = new Set(prev);
              next.delete(i);
              return next;
            });
            setAnimatedLines(prev => new Set([...prev, i]));
          }, LINE_ANIMATION.STROKE_ANIMATION_DURATION);

          timeoutsRef.current.push(completeDrawingTimeout);
        }, i * delayBetweenLines);

        timeoutsRef.current.push(startDrawingTimeout);
      }
    } else {
      console.log('🔄 Resetting line animation');
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
    }

    return clearAllTimeouts;
  }, [isShowingLines, totalLines, delayBetweenLines]);

  // Get animation state for a specific line
  const getLineAnimationState = (lineIndex: number) => {
    const isDrawing = drawingLines.has(lineIndex);
    const isComplete = animatedLines.has(lineIndex);
    
    return {
      isDrawing,
      isComplete,
      isVisible: isDrawing || isComplete,
      strokeDasharray: isDrawing ? "1000 1000" : "none", // Large dash for drawing effect
      strokeDashoffset: isDrawing ? "1000" : "0",
      opacity: isComplete ? 1 : (isDrawing ? 0.8 : 0),
      animationDelay: `${lineIndex * delayBetweenLines}ms`,
      drawingStyle: isDrawing ? {
        animation: `draw-line ${LINE_ANIMATION.STROKE_ANIMATION_DURATION}ms ${LINE_ANIMATION.ANIMATION_CURVE} forwards`
      } : {}
    };
  };

  return {
    getLineAnimationState,
    animatedLinesCount: animatedLines.size,
    drawingLinesCount: drawingLines.size,
    isAnimationComplete: animatedLines.size === totalLines,
    totalLines
  };
};
