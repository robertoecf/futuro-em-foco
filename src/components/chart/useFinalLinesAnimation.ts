
import { useState, useEffect, useRef } from 'react';
import { FINAL_LINES_ANIMATION } from '@/components/calculator/constants';

interface UseFinalLinesAnimationProps {
  isDrawingFinalLines: boolean;
}

export const useFinalLinesAnimation = ({
  isDrawingFinalLines
}: UseFinalLinesAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<string>>(new Set());
  const [fadingLines, setFadingLines] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  console.log('📈 useFinalLinesAnimation:', {
    isDrawingFinalLines,
    animatedLinesCount: animatedLines.size,
    fadingLinesCount: fadingLines.size,
    animatedLines: Array.from(animatedLines),
    fadingLines: Array.from(fadingLines)
  });

  // Clear all timeouts when component unmounts or animation resets
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Start final lines drawing animation
  useEffect(() => {
    if (isDrawingFinalLines) {
      console.log('🎯 Starting final lines fade-in animation');
      
      // Reset states
      setAnimatedLines(new Set());
      setFadingLines(new Set());
      clearAllTimeouts();

      // Schedule each final line to start fading in (pessimistic → median → optimistic)
      FINAL_LINES_ANIMATION.LINES.forEach((lineKey, index) => {
        const startFadingTimeout = setTimeout(() => {
          console.log(`✨ Starting fade-in for final line: ${lineKey}`);
          setFadingLines(prev => new Set([...prev, lineKey]));

          // After the fade-in completes, mark as fully animated
          const completeFadingTimeout = setTimeout(() => {
            console.log(`✅ Completed fade-in for final line: ${lineKey}`);
            setFadingLines(prev => {
              const next = new Set(prev);
              next.delete(lineKey);
              return next;
            });
            setAnimatedLines(prev => new Set([...prev, lineKey]));
          }, FINAL_LINES_ANIMATION.OPACITY_FADE_DURATION);

          timeoutsRef.current.push(completeFadingTimeout);
        }, index * FINAL_LINES_ANIMATION.DELAY_BETWEEN_LINES);

        timeoutsRef.current.push(startFadingTimeout);
      });
    } else {
      console.log('🔄 Resetting final lines animation');
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setFadingLines(new Set());
    }

    return clearAllTimeouts;
  }, [isDrawingFinalLines]);

  // Get animation state for a specific final line - only opacity animation
  const getFinalLineAnimationState = (lineKey: string) => {
    const isFading = fadingLines.has(lineKey);
    const isComplete = animatedLines.has(lineKey);
    
    return {
      isFading,
      isComplete,
      isVisible: isFading || isComplete,
      opacity: isComplete ? 1 : (isFading ? 0.8 : 0),
      style: {
        opacity: isComplete ? 1 : (isFading ? 0.8 : 0),
        transition: isFading ? `opacity ${FINAL_LINES_ANIMATION.OPACITY_FADE_DURATION}ms ease-in-out` : 'none',
        willChange: isFading ? 'opacity' : 'auto'
      }
    };
  };

  return {
    getFinalLineAnimationState,
    animatedLinesCount: animatedLines.size,
    fadingLinesCount: fadingLines.size,
    isAnimationComplete: animatedLines.size === FINAL_LINES_ANIMATION.LINES.length,
    totalFinalLines: FINAL_LINES_ANIMATION.LINES.length
  };
};
