import { useState, useEffect } from 'react';

export const useOverscroll = () => {
  const [isOverscrolling, setIsOverscrolling] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    let overscrollTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;

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

    const handleWheel = (e: WheelEvent) => {
      // Detectar tentativa de scroll além dos limites com mais sensibilidade
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      const isAtTop = scrollTop <= 0 && e.deltaY < -50; // Scroll forte para cima no topo
      const isAtBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 50; // Scroll forte para baixo no final
      
      if (isAtTop || isAtBottom) {
        triggerMatrix();
      }
    };

    const handleTouchMove = (_e: TouchEvent) => {
      // Detectar overscroll em dispositivos móveis
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      const isAtTop = scrollTop <= 5;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      
      if (isAtTop || isAtBottom) {
        triggerMatrix();
      }
    };

    // Adicionar listeners apenas para wheel e touch (removido scroll normal)
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
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