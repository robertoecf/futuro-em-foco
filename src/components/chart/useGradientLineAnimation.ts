
import { useState, useEffect, useRef } from 'react';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface UseGradientLineAnimationProps {
  isShowingLines: boolean;
  totalLines: number;
  chartData: any[];
  drawingDuration?: number;
}

export const useGradientLineAnimation = ({
  isShowingLines,
  totalLines = LINE_ANIMATION.TOTAL_LINES,
  chartData,
  drawingDuration = LINE_ANIMATION.DRAWING_DURATION
}: UseGradientLineAnimationProps) => {
  const [animatedLines, setAnimatedLines] = useState<Set<number>>(new Set());
  const [fadingLines, setFadingLines] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  console.log('🎨 useGradientLineAnimation:', {
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

  // Helper function to add timer with cleanup
  const addTimer = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    timeoutsRef.current.push(timer);
    return timer;
  };

  // Calculate gradient opacity based on line's final value position
  const calculateGradientOpacity = (lineIndex: number): number => {
    if (!chartData || chartData.length === 0) return LINE_ANIMATION.GRADIENT_OPACITY.MIDDLE;
    
    // Get the final value for this line (last data point)
    const finalDataPoint = chartData[chartData.length - 1];
    const lineValue = finalDataPoint?.[`line${lineIndex}`];
    
    if (!lineValue) return LINE_ANIMATION.GRADIENT_OPACITY.MIDDLE;
    
    // Collect all final values to determine position in range
    const allFinalValues: number[] = [];
    for (let i = 0; i < totalLines; i++) {
      const value = finalDataPoint?.[`line${i}`];
      if (value) allFinalValues.push(value);
    }
    
    if (allFinalValues.length === 0) return LINE_ANIMATION.GRADIENT_OPACITY.MIDDLE;
    
    // Calculate percentile position (0 = bottom, 1 = top)
    allFinalValues.sort((a, b) => a - b);
    const position = allFinalValues.indexOf(lineValue) / (allFinalValues.length - 1);
    
    // Create gradient: top values get higher opacity, bottom values get lower
    const { TOP, MIDDLE, BOTTOM } = LINE_ANIMATION.GRADIENT_OPACITY;
    
    if (position >= 0.8) return TOP; // Top 20%
    if (position >= 0.6) return TOP * 0.85; // 60-80%
    if (position >= 0.4) return MIDDLE * 1.1; // 40-60%
    if (position >= 0.2) return MIDDLE * 0.9; // 20-40%
    return BOTTOM; // Bottom 20%
  };

  // Start line fading animation
  useEffect(() => {
    if (isShowingLines) {
      console.log('🚀 Starting gradient line animation with', totalLines, 'lines');
      
      // Reset states
      setAnimatedLines(new Set());
      setFadingLines(new Set());
      clearAllTimeouts();

      // Schedule each line to start fading in
      for (let i = 0; i < totalLines; i++) {
        const startFadingTimeout = addTimer(() => {
          console.log(`✨ Starting fade-in for line ${i}`);
          setFadingLines(prev => new Set([...prev, i]));

          // After the fade-in completes, mark as fully animated
          const completeFadingTimeout = addTimer(() => {
            console.log(`✅ Completed fade-in for line ${i}`);
            setFadingLines(prev => {
              const next = new Set(prev);
              next.delete(i);
              return next;
            });
            setAnimatedLines(prev => new Set([...prev, i]));
          }, LINE_ANIMATION.FADE_IN_DURATION);

          timeoutsRef.current.push(completeFadingTimeout);
        }, i * delayBetweenLines);

        timeoutsRef.current.push(startFadingTimeout);
      }
    } else {
      console.log('🔄 Resetting gradient line animation');
      clearAllTimeouts();
      setAnimatedLines(new Set());
      setFadingLines(new Set());
    }

    return clearAllTimeouts;
  }, [isShowingLines, totalLines, delayBetweenLines]);

  // Get animation state for a specific line
  const getLineAnimationState = (lineIndex: number) => {
    const isFading = fadingLines.has(lineIndex);
    const isComplete = animatedLines.has(lineIndex);
    const gradientOpacity = calculateGradientOpacity(lineIndex);
    
    return {
      isFading,
      isComplete,
      isVisible: isFading || isComplete,
      targetOpacity: gradientOpacity,
      currentOpacity: isComplete ? gradientOpacity : (isFading ? gradientOpacity * 0.7 : 0),
      animationDelay: `${lineIndex * delayBetweenLines}ms`,
      style: {
        opacity: isComplete ? gradientOpacity : (isFading ? gradientOpacity * 0.7 : 0),
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
