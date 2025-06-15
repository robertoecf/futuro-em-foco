
import { useState, useEffect } from 'react';
import { MonteCarloResult } from '@/lib/utils';

interface UseChartAnimationProps {
  isCalculating: boolean;
  isMonteCarloEnabled: boolean;
  monteCarloData: MonteCarloResult | null;
  onAnimationComplete?: () => void;
}

export const useChartAnimation = ({ 
  isCalculating, 
  isMonteCarloEnabled, 
  monteCarloData,
  onAnimationComplete
}: UseChartAnimationProps) => {
  const [isShowingLines, setIsShowingLines] = useState(false);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);

  console.log('🎬 useChartAnimation state:', {
    isCalculating,
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    hasStartedAnimation
  });

  // Reset when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('🔄 Monte Carlo disabled - resetting animation');
      setIsShowingLines(false);
      setHasStartedAnimation(false);
      return;
    }
  }, [isMonteCarloEnabled]);

  // Start animation when Monte Carlo data is ready
  useEffect(() => {
    if (isMonteCarloEnabled && monteCarloData && !hasStartedAnimation) {
      console.log('🚀 Starting Monte Carlo animation - showing 50 lines');
      setIsShowingLines(true);
      setHasStartedAnimation(true);
      
      // After 6 seconds, hide lines and show final result
      const timer = setTimeout(() => {
        console.log('✨ Animation complete - hiding lines, showing final result');
        setIsShowingLines(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 6000); // 6 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isMonteCarloEnabled, monteCarloData, hasStartedAnimation, onAnimationComplete]);

  // Reset animation state when calculation starts
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled) {
      console.log('🔄 Calculation started - resetting animation state');
      setHasStartedAnimation(false);
      setIsShowingLines(false);
    }
  }, [isCalculating, isMonteCarloEnabled]);

  return {
    isShowingLines
  };
};
