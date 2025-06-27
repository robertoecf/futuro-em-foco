import React, { useEffect, useState, useCallback } from 'react';

interface MatrixRainProps {
  isActive: boolean;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({ isActive }) => {
  const [columns, setColumns] = useState<string[]>([]);

  // Caracteres Matrix - principalmente katakana japoneses + alguns números
  const matrixChars =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ0123456789';

  const generateColumns = useCallback(() => {
    if (!isActive) return;

    const columnCount = Math.floor(window.innerWidth / 12); // Mais colunas (a cada 12px ao invés de 18px)
    const newColumns: string[] = [];

    for (let i = 0; i < columnCount; i++) {
      // Colunas mais longas e densas
      const columnHeight = Math.floor(Math.random() * 40) + 30; // 30-70 caracteres por coluna (mais que dobrou)
      let columnText = '';

      for (let j = 0; j < columnHeight; j++) {
        columnText += matrixChars[Math.floor(Math.random() * matrixChars.length)] + '\n';
      }

      newColumns.push(columnText);
    }

    setColumns(newColumns);
  }, [isActive, matrixChars]);

  useEffect(() => {
    if (!isActive) {
      setColumns([]);
      return;
    }

    generateColumns();

    // Regenerar colunas mais frequentemente para efeito mais dinâmico
    const interval = setInterval(generateColumns, 800);

    // Cleanup
    return () => clearInterval(interval);
  }, [isActive, generateColumns]);

  // Adicionar listener para redimensionamento da janela
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      generateColumns();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, generateColumns]);

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
