import React, { useEffect, useState, useCallback, useRef } from 'react';

interface MatrixRainProps {
  isActive: boolean;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ isActive }) => {
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
    const interval = setInterval(generateColumns, 1200);

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
    <div className="matrix-rain">
      {columns.map((column, index) => (
        <div
          key={`${index}-${column.length}`} // Key que muda para forçar re-render
          className="matrix-column"
          style={{
            left: `${index * 12}px`, // Ajustado para as colunas mais próximas
            animationDelay: `${Math.random() * 2}s`, // Delays menores
            animationDuration: `${2 + Math.random() * 2}s`, // Animações mais rápidas
          }}
        >
          {column}
        </div>
      ))}
    </div>
  );
};
