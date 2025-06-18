
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

  // Calculate gradient opacity based on line's final value position
  const calculateGradientOpacity = (lineIndex: number): number => {
    if (!chartData || chartData.length === 0) return 0.5;
    
    // Get the final value for this line (last data point)
    const finalDataPoint = chartData[chartData.length - 1];
    const lineValue = finalDataPoint?.[`line${lineIndex}`];
    
    if (!lineValue) return 0.5;
    
    // Collect all final values to determine position in range
    const allFinalValues: number[] = [];
    for (let i = 0; i < totalLines; i++) {
      const value = finalDataPoint?.[`line${i}`];
      if (value) allFinalValues.push(value);
    }
    
    if (allFinalValues.length === 0) return 0.5;
    
    // Calculate percentile position (0 = bottom, 1 = top)
    allFinalValues.sort((a, b) => a - b);
    const position = allFinalValues.indexOf(lineValue) / (allFinalValues.length - 1);
    
    // Create subtle gradient: top values get higher opacity, bottom values get lower
    if (position >= 0.8) return 0.7; // Top 20%
    if (position >= 0.6) return 0.6; // 60-80%
    if (position >= 0.4) return 0.5; // 40-60%
    if (position >= 0.2) return 0.4; // 20-40%
    return 0.3; // Bottom 20%
  };

  // Start line animation with smooth fade-in only
  useEffect(() => {
    if (isShowingLines) {
      console.log('🚀 Starting line animation with smooth fade-in');
      
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

  // Get animation state for a specific line with gradient opacity
  const getLineAnimationState = (lineIndex: number) => {
    const isFading = fadingLines.has(lineIndex);
    const isComplete = animatedLines.has(lineIndex);
    const gradientOpacity = calculateGradientOpacity(lineIndex);
    
    return {
      isFading,
      isComplete,
      isVisible: isFading || isComplete,
      targetOpacity: gradientOpacity,
      currentOpacity: isComplete ? gradientOpacity : (isFading ? gradientOpacity * 0.3 : 0),
      animationDelay: `${lineIndex * delayBetweenLines}ms`,
      // Smooth opacity-only animation - no stroke animations that cause flickering
      style: {
        opacity: isComplete ? gradientOpacity : (isFading ? gradientOpacity * 0.3 : 0),
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
