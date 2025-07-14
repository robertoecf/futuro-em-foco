import React, { useEffect, useState, useCallback, useRef } from 'react';
import { performanceValidator } from '@/utils/performanceValidation';

interface MatrixRainProps {
  isActive: boolean;
  mask?: 'top' | 'bottom' | 'none';
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ isActive, mask = 'none' }) => {
  const [columns, setColumns] = useState<string[]>([]);
  
  // Cache window dimensions to prevent reflows
  const windowDimensionsRef = useRef({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  });

  // Caracteres Matrix - principalmente katakana japoneses + alguns números
  const matrixChars = useRef(
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ0123456789'
  );

  // Update cached window dimensions
  const updateWindowDimensions = useCallback(() => {
    windowDimensionsRef.current = {
      width: window.innerWidth,
    };
  }, []);

  const generateColumns = useCallback(() => {
    if (!isActive) return;

    performanceValidator.startMeasuring('MatrixRain-generateColumns');

    // Use cached width to prevent reflows
    const columnCount = Math.floor(windowDimensionsRef.current.width / 12); // Mais colunas (a cada 12px ao invés de 18px)
    const newColumns: string[] = [];

    for (let i = 0; i < columnCount; i++) {
      // Colunas mais longas e densas
      const columnHeight = Math.floor(Math.random() * 40) + 30; // 30-70 caracteres por coluna (mais que dobrou)
      let columnText = '';

      for (let j = 0; j < columnHeight; j++) {
        columnText += matrixChars.current[Math.floor(Math.random() * matrixChars.current.length)] + '\n';
      }

      newColumns.push(columnText);
    }

    setColumns(newColumns);
    performanceValidator.endMeasuring('MatrixRain-generateColumns');
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setColumns([]);
      return;
    }

    // Initialize window dimensions
    updateWindowDimensions();
    generateColumns();

    // Reduced frequency for better performance (1.2s instead of 800ms)
    const interval = setInterval(generateColumns, 2500);

    // Cleanup
    return () => clearInterval(interval);
  }, [isActive, generateColumns, updateWindowDimensions]);

  // Optimized resize listener with throttling
  useEffect(() => {
    if (!isActive) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      // Throttle resize events to prevent excessive recalculations
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateWindowDimensions();
        generateColumns();
      }, 150); // 150ms throttle
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isActive, generateColumns, updateWindowDimensions]);

  if (!isActive) return null;

  return (
    <div className={`matrix-rain${mask === 'top' ? ' matrix-rain-top' : ''}${mask === 'bottom' ? ' matrix-rain-bottom' : ''}`}>
      {columns.map((column, index) => (
        <div
          key={`${index}-${column.length}`} // Key que muda para forçar re-render
          className="matrix-column"
          style={{
            left: `${index * 12}px`, // Ajustado para as colunas mais próximas
            animationDelay: `${Math.random() * 2}s`, // Delays menores
            animationDuration: `${5 + Math.random() * 5}s`, // Animações mais lentas (5s a 10s)
          }}
        >
          {column}
        </div>
      ))}
    </div>
  );
};
