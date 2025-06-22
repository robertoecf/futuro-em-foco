
import React, { useEffect, useRef, useMemo } from 'react';
import { ChartDataPoint } from '@/utils/csvExport';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface OptimizedMonteCarloLinesProps {
  chartData: ChartDataPoint[];
  width: number;
  height: number;
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  isShowingLines: boolean;
}

export const OptimizedMonteCarloLines = React.memo(({
  chartData,
  width,
  height,
  xScale,
  yScale,
  isShowingLines
}: OptimizedMonteCarloLinesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Generate colors for 500 lines with better distribution
  const lineColors = useMemo(() => {
    const colors: string[] = [];
    const baseColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    
    // Generate 500 colors with variations
    for (let i = 0; i < LINE_ANIMATION.TOTAL_LINES; i++) {
      const baseColor = baseColors[i % baseColors.length];
      const variation = 1 - (Math.floor(i / baseColors.length) * 0.1);
      
      // Apply brightness variation
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      
      const newR = Math.round(r * variation);
      const newG = Math.round(g * variation);
      const newB = Math.round(b * variation);
      
      colors.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`);
    }
    
    return colors;
  }, []);

  // Optimized drawing function using requestAnimationFrame
  useEffect(() => {
    if (!canvasRef.current || !isShowingLines) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    const drawLines = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / LINE_ANIMATION.DRAWING_DURATION, 1);
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Calculate how many lines to draw based on progress
      const linesToDraw = Math.floor(progress * LINE_ANIMATION.TOTAL_LINES);
      
      // Batch rendering for better performance
      ctx.save();
      
      // Draw lines in batches
      for (let batch = 0; batch < Math.ceil(linesToDraw / LINE_ANIMATION.BATCH_SIZE); batch++) {
        const startIdx = batch * LINE_ANIMATION.BATCH_SIZE;
        const endIdx = Math.min(startIdx + LINE_ANIMATION.BATCH_SIZE, linesToDraw);
        
        for (let lineIndex = startIdx; lineIndex < endIdx; lineIndex++) {
          ctx.beginPath();
          ctx.strokeStyle = lineColors[lineIndex];
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.6 + (lineIndex / LINE_ANIMATION.TOTAL_LINES) * 0.4;
          
          let firstPoint = true;
          for (let i = 0; i < chartData.length; i++) {
            const dataPoint = chartData[i];
            const value = dataPoint[`line${lineIndex}`];
            
            if (value !== undefined) {
              const x = xScale(dataPoint.age);
              const y = yScale(value as number);
              
              if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
              } else {
                ctx.lineTo(x, y);
              }
            }
          }
          
          ctx.stroke();
        }
      }
      
      ctx.restore();
      
      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(drawLines);
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(drawLines);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      startTimeRef.current = 0;
    };
  }, [chartData, width, height, xScale, yScale, isShowingLines, lineColors]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}); 
