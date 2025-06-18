
import { useState, useEffect, useRef } from 'react';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface UseLineAnimationProps {
  isShowingLines: boolean;
  totalLines: number;
  drawingDuration?: number;
  chartData?: any[];
}

export const useLineAnimation = ({
  isShowingLines,
  totalLines = LINE_ANIMATION.TOTAL_LINES,
  drawingDuration = LINE_ANIMATION.DRAWING_DURATION,
  chartData = []
}: UseLineAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<number>>(new Set());
  const [fadingLines, setFadingLines] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  console.log('🎨 useLineAnimation:', {
    isShowingLines,
    totalLines,
    drawingDuration,
    animatedLinesCount: animatedLines.size,
    fadingLinesCount: fadingLines.size
  });

  // Calculate delay between lines based on total duration
  const delayBetweenLines = drawingDuration / totalLines;

  // Clear all timeouts when component unmounts or animation resets
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Start line animation with simple fade-in
  useEffect(() => {
    if (isShowingLines) {
      console.log('🚀 Starting line animation - simple version');
      
      // Reset states
      setAnimatedLines(new Set());
      setFadingLines(new Set());
      clearAllTimeouts();

      // Schedule each line to start fading in
      for (let i = 0; i < totalLines; i++) {
        const startFadingTimeout = setTimeout(() => {
          console.log(`✨ Starting fade-in for line ${i}`);
          setFadingLines(prev => new Set([...prev, i]));

          // After the fade-in completes, mark as fully animated
          const completeFadingTimeout = setTimeout(() => {
            console.log(`✅ Completed fade-in for line ${i}`);
            setFadingLines(prev => {
              const next = new Set(prev);
              next.delete(i);
              return next;
            });
            setAnimatedLines(prev => new Set([...prev, i]));
          }, LINE_ANIMATION.OPACITY_FADE_DURATION);

          timeoutsRef.current.push(completeFadingTimeout);
        }, i * delayBetweenLines);

        timeoutsRef.current.push(startFadingTimeout);
      }
    } else {
      console.log('🔄 Resetting line animation');
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setFadingLines(new Set());
    }

    return clearAllTimeouts;
  }, [isShowingLines, totalLines, delayBetweenLines]);

  // Get animation state for a specific line - SIMPLE VERSION
  const getLineAnimationState = (lineIndex: number) => {
    const isFading = fadingLines.has(lineIndex);
    const isComplete = animatedLines.has(lineIndex);
    
    // Opacidade fixa e simples
    const targetOpacity = 0.6; // Opacidade única para todas as linhas
    
    return {
      isFading,
      isComplete,
      isVisible: isFading || isComplete,
      targetOpacity,
      currentOpacity: isComplete ? targetOpacity : (isFading ? targetOpacity * 0.3 : 0),
      animationDelay: `${lineIndex * delayBetweenLines}ms`,
      // Animação simples apenas com opacity
      style: {
        opacity: isComplete ? targetOpacity : (isFading ? targetOpacity * 0.3 : 0),
        transition: isFading ? `opacity ${LINE_ANIMATION.OPACITY_FADE_DURATION}ms ease-in-out` : 'none',
        willChange: isFading ? 'opacity' : 'auto'
      }
    };
  };

  return {
    getLineAnimationState,
    animatedLinesCount: animatedLines.size,
    fadingLinesCount: fadingLines.size,
    isAnimationComplete: animatedLines.size === totalLines,
    totalLines
  };
};
