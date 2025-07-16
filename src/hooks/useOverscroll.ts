import { useState, useEffect, useRef } from 'react';
import { performanceValidator } from '@/utils/performanceValidation';

export const useOverscroll = () => {
  const [isOverscrolling, setIsOverscrolling] = useState(false);

  // Estado para bloquear múltiplos triggers
  const overscrollLock = useRef(false);
  const overscrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cache de posição e dimensões
  const scrollPositionRef = useRef({
    scrollTop: 0,
    isAtTop: false,
    isAtBottom: false,
  });
  const scrollDimensionsRef = useRef({
    scrollHeight: 0,
    clientHeight: 0,
  });

  // Touch tracking
  const lastTouchY = useRef<number | null>(null);

  // Throttle para wheel
  const lastWheelTimeRef = useRef(0);
  const wheelThrottleDelay = 16; // ~60fps

  useEffect(() => {
    // Atualiza posição de scroll e limites
    const updateScrollPosition = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const { scrollHeight, clientHeight } = scrollDimensionsRef.current;
      scrollPositionRef.current = {
        scrollTop,
        isAtTop: scrollTop <= 5,
        isAtBottom: scrollTop + clientHeight >= scrollHeight - 5,
      };
    };

    // Atualiza dimensões cacheadas
    const updateScrollDimensions = () => {
      scrollDimensionsRef.current = {
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      };
      updateScrollPosition();
    };

    // Dispara overscroll, mas só se não estiver bloqueado
    const triggerMatrix = () => {
      if (overscrollLock.current) return;
      overscrollLock.current = true;
      setIsOverscrolling(true);
      overscrollTimerRef.current = setTimeout(() => {
        setIsOverscrolling(false);
        overscrollLock.current = false;
      }, 8000);
    };

    // Wheel: só dispara se tentar rolar além do topo/fundo
    const handleWheel = (e: WheelEvent) => {
      performanceValidator.startMeasuring('useOverscroll-wheelHandler');
      const now = performance.now();
      if (now - lastWheelTimeRef.current < wheelThrottleDelay) {
        performanceValidator.endMeasuring('useOverscroll-wheelHandler');
        return;
      }
      lastWheelTimeRef.current = now;
      const { isAtTop, isAtBottom } = scrollPositionRef.current;
      const isOverscrollingUp = isAtTop && e.deltaY < -50;
      const isOverscrollingDown = isAtBottom && e.deltaY > 50;
      if (isOverscrollingUp || isOverscrollingDown) {
        triggerMatrix();
      }
      performanceValidator.endMeasuring('useOverscroll-wheelHandler');
    };

    // Touch: só dispara se tentar "puxar" além do topo/fundo
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (lastTouchY.current === null) return;
      const currentY = e.touches[0]?.clientY ?? null;
      if (currentY === null) return;
      const deltaY = currentY - lastTouchY.current;
      const { isAtTop, isAtBottom } = scrollPositionRef.current;
      // Puxando para baixo no topo OU para cima no fundo
      if ((isAtTop && deltaY > 30) || (isAtBottom && deltaY < -30)) {
        triggerMatrix();
      }
    };
    const handleTouchEnd = () => {
      lastTouchY.current = null;
    };

    // Scroll: só atualiza cache
    const handleScroll = () => {
      requestAnimationFrame(updateScrollPosition);
    };

    // Resize: atualiza dimensões
    const handleResize = () => {
      updateScrollDimensions();
    };

    // Inicializa cache
    updateScrollDimensions();

    // Listeners
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (overscrollTimerRef.current) {
        clearTimeout(overscrollTimerRef.current);
      }
    };
  }, []);

  return isOverscrolling;
};
