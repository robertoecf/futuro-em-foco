
import { useState, useEffect, useRef } from 'react';

interface UseLineAnimationProps {
  isShowingLines: boolean;
  totalLines?: number;
  drawingDuration?: number;
}

export const useLineAnimation = ({
  isShowingLines,
  totalLines = 50,
  drawingDuration = 2000
}: UseLineAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<number>>(new Set());
  const [drawingLines, setDrawingLines] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  console.log('🎨 useLineAnimation:', {
    isShowingLines,
    totalLines,
    drawingDuration,
    animatedLinesCount: animatedLines.size
  });

  // Ensure we have valid totalLines
  const safeTotalLines = Math.max(1, totalLines || 50);
  const delayBetweenLines = drawingDuration / safeTotalLines;

  // Clear all timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Start line drawing animation
  useEffect(() => {
    if (isShowingLines && safeTotalLines > 0) {
      console.log(`🚀 Starting line animation for ${safeTotalLines} lines`);
      
      // Reset states
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
      clearAllTimeouts();

      // Schedule each line to start drawing
      for (let i = 0; i < safeTotalLines; i++) {
        const startTimeout = setTimeout(() => {
          setDrawingLines(prev => new Set([...prev, i]));

          // Complete drawing after animation duration
          const completeTimeout = setTimeout(() => {
            setDrawingLines(prev => {
              const next = new Set(prev);
              next.delete(i);
              return next;
            });
            setAnimatedLines(prev => new Set([...prev, i]));
          }, 1500); // Fixed duration for individual line drawing

          timeoutsRef.current.push(completeTimeout);
        }, i * delayBetweenLines);

        timeoutsRef.current.push(startTimeout);
      }
    } else {
      console.log('🔄 Resetting line animation');
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setDrawingLines(new Set());
    }

    return clearAllTimeouts;
  }, [isShowingLines, safeTotalLines, delayBetweenLines]);

  // Get animation state for a specific line
  const getLineAnimationState = (lineIndex: number) => {
    const isDrawing = drawingLines.has(lineIndex);
    const isComplete = animatedLines.has(lineIndex);
    
    return {
      isDrawing,
      isComplete,
      isVisible: isDrawing || isComplete,
      strokeDasharray: isDrawing ? "1000 1000" : "none",
      strokeDashoffset: isDrawing ? "1000" : "0",
      opacity: isComplete ? 1 : (isDrawing ? 0.8 : 0),
      drawingStyle: isDrawing ? {
        animation: `draw-line 1500ms ease-out forwards`
      } : {}
    };
  };

  return {
    getLineAnimationState,
    animatedLinesCount: animatedLines.size,
    isAnimationComplete: animatedLines.size === safeTotalLines,
    totalLines: safeTotalLines
  };
};
