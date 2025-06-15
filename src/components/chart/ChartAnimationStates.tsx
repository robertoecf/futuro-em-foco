
import { useState, useEffect } from 'react';
import { MonteCarloResult } from '@/lib/utils';
import { MAGIC_MOMENT_TIMERS } from '@/components/calculator/constants';

export type AnimationPhase = 'initial' | 'projecting' | 'paths' | 'consolidating' | 'final';

interface UseChartAnimationProps {
  isCalculating: boolean;
  isMonteCarloEnabled: boolean;
  monteCarloData: MonteCarloResult | null;
  onAnimationComplete?: () => void; // Callback para quando a animação terminar
}

export const useChartAnimation = ({ 
  isCalculating, 
  isMonteCarloEnabled, 
  monteCarloData,
  onAnimationComplete
}: UseChartAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('final');
  const [visiblePaths, setVisiblePaths] = useState<number[]>([]);
  const [pathOpacities, setPathOpacities] = useState<Record<number, number>>({});

  // Reset animation when Monte Carlo is disabled
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('🔄 Monte Carlo disabled - resetting to final phase');
      setAnimationPhase('final');
      setVisiblePaths([]);
      setPathOpacities({});
      return;
    }
  }, [isMonteCarloEnabled]);

  // Handle Monte Carlo animation sequence
  useEffect(() => {
    // Clear any existing timers
    let messageTimer: NodeJS.Timeout;
    let pathsTimer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    let fadeInterval: NodeJS.Timeout;

    if (isCalculating && isMonteCarloEnabled) {
      const startTime = Date.now();
      console.log('🎬 Starting Magic Moment animation at', new Date().toLocaleTimeString());
      console.log(`⏱️ Message will show for ${MAGIC_MOMENT_TIMERS.MESSAGE_DURATION}ms`);
      console.log(`📈 Paths will evolve over ${MAGIC_MOMENT_TIMERS.PATHS_EVOLUTION_DURATION}ms`);
      console.log(`✨ Consolidation will take ${MAGIC_MOMENT_TIMERS.CONSOLIDATION_DURATION}ms`);
      
      setAnimationPhase('projecting');
      setVisiblePaths([]);
      setPathOpacities({});
      
      // Phase 1: Show projecting message
      messageTimer = setTimeout(() => {
        const messageEndTime = Date.now();
        console.log(`💭 Message phase completed after ${messageEndTime - startTime}ms`);
        console.log('📊 Moving to paths evolution phase...');
        setAnimationPhase('paths');
        
        // Phase 2: Progressive path appearance
        const totalPaths = 50;
        const pathInterval = MAGIC_MOMENT_TIMERS.PATHS_EVOLUTION_DURATION / totalPaths;
        let currentPathIndex = 0;
        
        console.log(`🎨 Drawing ${totalPaths} paths over ${MAGIC_MOMENT_TIMERS.PATHS_EVOLUTION_DURATION}ms (${pathInterval.toFixed(1)}ms per path)`);
        
        progressInterval = setInterval(() => {
          if (currentPathIndex < totalPaths) {
            setVisiblePaths(prev => {
              const newPaths = [...prev, currentPathIndex];
              console.log(`✏️ Drawing path ${currentPathIndex + 1}/${totalPaths}`);
              return newPaths;
            });
            
            setPathOpacities(prev => ({
              ...prev,
              [currentPathIndex]: 1
            }));
            
            currentPathIndex++;
          } else {
            clearInterval(progressInterval);
            console.log('🎨 All paths drawn! Starting consolidation phase...');
            
            // Phase 3: Consolidation - fade out paths
            pathsTimer = setTimeout(() => {
              console.log('🌟 Starting consolidation phase...');
              setAnimationPhase('consolidating');
              
              // Fade out all paths gradually
              const fadeStep = 0.03; // Opacity reduction per step
              const fadeStepInterval = 40; // 40ms per step
              
              fadeInterval = setInterval(() => {
                setPathOpacities(prev => {
                  const newOpacities = { ...prev };
                  let allFaded = true;
                  
                  Object.keys(newOpacities).forEach(pathKey => {
                    const pathIndex = parseInt(pathKey);
                    if (newOpacities[pathIndex] > 0) {
                      newOpacities[pathIndex] = Math.max(0, newOpacities[pathIndex] - fadeStep);
                      if (newOpacities[pathIndex] > 0) allFaded = false;
                    }
                  });
                  
                  if (allFaded) {
                    clearInterval(fadeInterval);
                    const endTime = Date.now();
                    console.log('✨ Magic Moment animation completed!');
                    console.log(`🎯 Total animation time: ${endTime - startTime}ms`);
                    console.log('🏁 Calling onAnimationComplete callback');
                    setAnimationPhase('final');
                    
                    // Notify that animation is complete
                    if (onAnimationComplete) {
                      onAnimationComplete();
                    }
                  }
                  
                  return newOpacities;
                });
              }, fadeStepInterval);
            }, MAGIC_MOMENT_TIMERS.CONSOLIDATION_DURATION);
          }
        }, pathInterval);
        
      }, MAGIC_MOMENT_TIMERS.MESSAGE_DURATION);
    } else if (!isCalculating) {
      console.log('🏁 Calculation finished - moving to final phase');
      setAnimationPhase('final');
    }

    // Cleanup function to clear all timers
    return () => {
      if (messageTimer) {
        console.log('🧹 Cleaning up message timer');
        clearTimeout(messageTimer);
      }
      if (pathsTimer) {
        console.log('🧹 Cleaning up paths timer');
        clearTimeout(pathsTimer);
      }
      if (progressInterval) {
        console.log('🧹 Cleaning up progress interval');
        clearInterval(progressInterval);
      }
      if (fadeInterval) {
        console.log('🧹 Cleaning up fade interval');
        clearInterval(fadeInterval);
      }
    };
  }, [isCalculating, isMonteCarloEnabled, onAnimationComplete]);

  return {
    animationPhase,
    visiblePaths,
    pathOpacities
  };
};
