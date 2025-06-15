
import { useState, useEffect } from 'react';
import { MonteCarloResult } from '@/lib/utils';
import { MAGIC_MOMENT_TIMERS } from '@/components/calculator/constants';

export type AnimationPhase = 'initial' | 'projecting' | 'paths' | 'consolidating' | 'final';

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
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('final');
  const [visiblePaths, setVisiblePaths] = useState<number[]>([]);
  const [pathOpacities, setPathOpacities] = useState<Record<number, number>>({});
  const [calculationStartTime, setCalculationStartTime] = useState<number | null>(null);

  // Reset animation when Monte Carlo is disabled - always go to final
  useEffect(() => {
    if (!isMonteCarloEnabled) {
      console.log('🔄 Monte Carlo disabled - resetting to final phase');
      setAnimationPhase('final');
      setVisiblePaths([]);
      setPathOpacities({});
      setCalculationStartTime(null);
      return;
    }
  }, [isMonteCarloEnabled]);

  // Handle calculation start
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled && !calculationStartTime) {
      const startTime = Date.now();
      console.log('🚀 Calculation started at', new Date().toLocaleTimeString());
      setCalculationStartTime(startTime);
      setAnimationPhase('projecting');
      setVisiblePaths([]);
      setPathOpacities({});
    } else if (!isCalculating && !isMonteCarloEnabled) {
      // Se não está calculando e Monte Carlo está desabilitado, vai direto para final
      console.log('🏁 No calculation needed - going to final phase');
      setAnimationPhase('final');
      setCalculationStartTime(null);
    }
  }, [isCalculating, isMonteCarloEnabled, calculationStartTime]);

  // Handle Monte Carlo animation sequence when data is ready
  useEffect(() => {
    let messageTimer: NodeJS.Timeout;
    let pathsTimer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    let fadeInterval: NodeJS.Timeout;

    if (isCalculating && isMonteCarloEnabled && calculationStartTime && monteCarloData) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - calculationStartTime;
      const minimumMessageTime = MAGIC_MOMENT_TIMERS.MESSAGE_DURATION; // 3 seconds
      
      console.log('📊 Monte Carlo data ready!', {
        elapsedCalculationTime: elapsedTime,
        minimumMessageTime,
        willWait: elapsedTime < minimumMessageTime
      });

      // Initialize all 50 paths with opacity 0 immediately when data is ready
      const initialOpacities: Record<number, number> = {};
      for (let i = 0; i < 50; i++) {
        initialOpacities[i] = 0;
      }
      setPathOpacities(initialOpacities);
      console.log('🎨 Initialized all 50 paths with opacity 0');

      // Wait minimum 3 seconds, or until calculation is done (whichever is longer)
      const waitTime = Math.max(0, minimumMessageTime - elapsedTime);
      
      messageTimer = setTimeout(() => {
        console.log('💭 Message phase completed, moving to paths animation');
        setAnimationPhase('paths');
        
        // Phase 2: Progressive path appearance
        const totalPaths = 50;
        const pathEvolutionTime = MAGIC_MOMENT_TIMERS.PATHS_EVOLUTION_DURATION; // 6 seconds
        const pathInterval = pathEvolutionTime / totalPaths;
        let currentPathIndex = 0;
        
        console.log(`🎨 Starting path animation: ${totalPaths} paths over ${pathEvolutionTime}ms`);
        
        progressInterval = setInterval(() => {
          if (currentPathIndex < totalPaths) {
            setVisiblePaths(prev => {
              const newPaths = [...prev, currentPathIndex];
              console.log(`✏️ Animating path ${currentPathIndex + 1}/${totalPaths} to opacity 1`);
              return newPaths;
            });
            
            setPathOpacities(prev => ({
              ...prev,
              [currentPathIndex]: 1
            }));
            
            currentPathIndex++;
          } else {
            clearInterval(progressInterval);
            console.log('🎨 All paths animated! Starting consolidation...');
            
            // Phase 3: Consolidation - fade out paths
            pathsTimer = setTimeout(() => {
              console.log('🌟 Starting consolidation phase...');
              setAnimationPhase('consolidating');
              
              // Fade out all paths gradually
              const fadeStep = 0.03;
              const fadeStepInterval = 40;
              
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
                    console.log(`🎯 Total time: ${endTime - calculationStartTime}ms`);
                    setAnimationPhase('final');
                    
                    if (onAnimationComplete) {
                      onAnimationComplete();
                    }
                  }
                  
                  return newOpacities;
                });
              }, fadeStepInterval);
            }, MAGIC_MOMENT_TIMERS.CONSOLIDATION_DURATION); // 3 seconds consolidation
          }
        }, pathInterval);
        
      }, waitTime);
    } else if (!isCalculating && calculationStartTime) {
      // Se a calculação terminou mas não temos dados de Monte Carlo, ir para final
      console.log('🏁 Calculation finished without Monte Carlo - moving to final phase');
      setAnimationPhase('final');
      setCalculationStartTime(null);
    }

    // Cleanup function
    return () => {
      if (messageTimer) clearTimeout(messageTimer);
      if (pathsTimer) clearTimeout(pathsTimer);
      if (progressInterval) clearInterval(progressInterval);
      if (fadeInterval) clearInterval(fadeInterval);
    };
  }, [isCalculating, isMonteCarloEnabled, calculationStartTime, monteCarloData, onAnimationComplete]);

  // Fallback: se algo der errado, sempre garantir que termine em 'final'
  useEffect(() => {
    if (!isCalculating && animationPhase !== 'final') {
      console.log('🔄 Fallback: Ensuring final phase when not calculating');
      setTimeout(() => {
        setAnimationPhase('final');
      }, 1000);
    }
  }, [isCalculating, animationPhase]);

  return {
    animationPhase,
    visiblePaths,
    pathOpacities
  };
};
