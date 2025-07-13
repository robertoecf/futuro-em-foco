import { useState, useEffect, useRef } from 'react';

export const useOverscroll = () => {
  const [isOverscrolling, setIsOverscrolling] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  // Cache current scroll position - updated separately from wheel events
  const scrollPositionRef = useRef({
    scrollTop: 0,
    isAtTop: false,
    isAtBottom: false,
  });
  
  // Cache DOM dimensions to prevent repeated queries
  const scrollDimensionsRef = useRef({
    scrollHeight: 0,
    clientHeight: 0,
  });
  
  // Throttling state for wheel events
  const lastWheelTimeRef = useRef(0);
  const wheelThrottleDelay = 16; // ~60fps

  useEffect(() => {
    let overscrollTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

    // Update scroll position and boundaries - called separately from wheel events
    const updateScrollPosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const { scrollHeight, clientHeight } = scrollDimensionsRef.current;
      
      scrollPositionRef.current = {
        scrollTop,
        isAtTop: scrollTop <= 5,
        isAtBottom: scrollTop + clientHeight >= scrollHeight - 5,
      };
    };

    // Update cached scroll dimensions
    const updateScrollDimensions = () => {
      scrollDimensionsRef.current = {
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      };
      // Also update position when dimensions change
      updateScrollPosition();
    };

    const triggerMatrix = () => {
      if (hasTriggered) return; // Só permite uma vez por sessão

      setIsOverscrolling(true);
      setHasTriggered(true);

      // Desativar o efeito após 8 segundos (mais tempo para apreciar)
      overscrollTimer = setTimeout(() => {
        setIsOverscrolling(false);
      }, 8000);

      // Reset para permitir novamente após 30 segundos
      resetTimer = setTimeout(() => {
        setHasTriggered(false);
      }, 30000);
    };

    // Wheel handler - NO DOM QUERIES, only uses cached position
    const handleWheel = (e: WheelEvent) => {
      // Throttle wheel events for performance
      const now = performance.now();
      if (now - lastWheelTimeRef.current < wheelThrottleDelay) {
        return;
      }
      lastWheelTimeRef.current = now;

      // Use cached position data - NO DOM ACCESS during wheel events
      const { isAtTop, isAtBottom } = scrollPositionRef.current;
      
      const isOverscrollingUp = isAtTop && e.deltaY < -50; // Strong scroll up at top
      const isOverscrollingDown = isAtBottom && e.deltaY > 50; // Strong scroll down at bottom

      if (isOverscrollingUp || isOverscrollingDown) {
        triggerMatrix();
      }
    };

    // Touch handler - also uses cached position
    const handleTouchMove = (_e: TouchEvent) => {
      const { isAtTop, isAtBottom } = scrollPositionRef.current;

      if (isAtTop || isAtBottom) {
        triggerMatrix();
      }
    };

    // Scroll handler - updates cached position via RAF
    const handleScroll = () => {
      requestAnimationFrame(updateScrollPosition);
    };

    // Initialize cached dimensions and position
    updateScrollDimensions();

    // Update dimensions on resize
    const handleResize = () => {
      updateScrollDimensions();
    };

    // Add all event listeners
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (overscrollTimer) {
        clearTimeout(overscrollTimer);
      }
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
    };
  }, [hasTriggered]);

  return isOverscrolling;
};
