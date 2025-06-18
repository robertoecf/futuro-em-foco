
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
  const [visibleLines, setVisibleLines] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  console.log('🎨 useLineAnimation:', {
    isShowingLines,
    totalLines,
    drawingDuration,
    visibleLinesCount: visibleLines.size
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
      
      // Reset state
      setVisibleLines(new Set());
      clearAllTimeouts();

      // Schedule each line to appear progressively
      for (let i = 0; i < totalLines; i++) {
        const showLineTimeout = setTimeout(() => {
          console.log(`✏️ Showing line ${i}`);
          setVisibleLines(prev => new Set([...prev, i]));
        }, i * delayBetweenLines);

        timeoutsRef.current.push(showLineTimeout);
      }
    } else {
      console.log('🔄 Resetting line animation');
      clearAllTimeouts();
      setVisibleLines(new Set());
    }

    return clearAllTimeouts;
  }, [isShowingLines, totalLines, delayBetweenLines]);

  // Get animation state for a specific line
  const getLineAnimationState = (lineIndex: number) => {
    const isVisible = visibleLines.has(lineIndex);
    
    return {
      isVisible,
      opacity: isVisible ? 1 : 0,
      animationDelay: `${lineIndex * delayBetweenLines}ms`
    };
  };

  return {
    getLineAnimationState,
    visibleLinesCount: visibleLines.size,
    isAnimationComplete: visibleLines.size === totalLines,
    totalLines
  };
};
