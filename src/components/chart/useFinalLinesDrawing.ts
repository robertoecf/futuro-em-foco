
import { useState, useEffect, useRef } from 'react';

interface UseFinalLinesDrawingProps {
  isDrawingFinalLines: boolean;
}

export const useFinalLinesDrawing = ({
  isDrawingFinalLines
}: UseFinalLinesDrawingProps) => {
  const [drawingState, setDrawingState] = useState<{
    pessimistic: 'hidden' | 'drawing' | 'complete';
    median: 'hidden' | 'drawing' | 'complete';
    optimistic: 'hidden' | 'drawing' | 'complete';
  }>({
    pessimistic: 'hidden',
    median: 'hidden', 
    optimistic: 'hidden'
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  console.log('🎯 useFinalLinesDrawing:', {
    isDrawingFinalLines,
    drawingState
  });

  // Clear timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    if (isDrawingFinalLines) {
      console.log('🚀 Starting final lines drawing sequence');
      clearAllTimeouts();
      
      // Reset all to hidden first
      setDrawingState({
        pessimistic: 'hidden',
        median: 'hidden',
        optimistic: 'hidden'
      });

      // Draw pessimistic line first
      const drawPessimistic = setTimeout(() => {
        console.log('📉 Drawing pessimistic line');
        setDrawingState(prev => ({ ...prev, pessimistic: 'drawing' }));
        
        const completePessimistic = setTimeout(() => {
          console.log('✅ Completed pessimistic line');
          setDrawingState(prev => ({ ...prev, pessimistic: 'complete' }));
        }, 1000);
        timeoutsRef.current.push(completePessimistic);
      }, 500);
      timeoutsRef.current.push(drawPessimistic);

      // Draw median line second
      const drawMedian = setTimeout(() => {
        console.log('📊 Drawing median line');
        setDrawingState(prev => ({ ...prev, median: 'drawing' }));
        
        const completeMedian = setTimeout(() => {
          console.log('✅ Completed median line');
          setDrawingState(prev => ({ ...prev, median: 'complete' }));
        }, 1000);
        timeoutsRef.current.push(completeMedian);
      }, 1800);
      timeoutsRef.current.push(drawMedian);

      // Draw optimistic line third
      const drawOptimistic = setTimeout(() => {
        console.log('📈 Drawing optimistic line');
        setDrawingState(prev => ({ ...prev, optimistic: 'drawing' }));
        
        const completeOptimistic = setTimeout(() => {
          console.log('✅ Completed optimistic line');
          setDrawingState(prev => ({ ...prev, optimistic: 'complete' }));
        }, 1000);
        timeoutsRef.current.push(completeOptimistic);
      }, 3100);
      timeoutsRef.current.push(drawOptimistic);

    } else {
      // When not drawing, show all lines as complete (no animation)
      setDrawingState({
        pessimistic: 'complete',
        median: 'complete',
        optimistic: 'complete'
      });
    }

    return clearAllTimeouts;
  }, [isDrawingFinalLines]);

  const getLineStyle = (lineKey: 'pessimistic' | 'median' | 'optimistic') => {
    const state = drawingState[lineKey];
    
    const baseStyle = {
      opacity: state === 'hidden' ? 0 : 1,
      strokeDasharray: state === 'drawing' ? "1000 1000" : 
                      lineKey === 'median' ? "none" : "8 4",
      strokeDashoffset: state === 'drawing' ? "1000" : "0",
      transition: state === 'drawing' ? 'stroke-dashoffset 1s ease-out' : 'opacity 0.3s ease-out'
    };

    return baseStyle;
  };

  return {
    getLineStyle,
    drawingState,
    isAnimationComplete: Object.values(drawingState).every(state => state === 'complete')
  };
};
