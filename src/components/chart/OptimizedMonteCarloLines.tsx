import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { ChartDataPoint } from '@/utils/csvExport';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface OptimizedMonteCarloLinesProps {
  chartData: ChartDataPoint[];
  width: number;
  height: number;
  xScale: (value: number) => number;
  yScale: (value: number) => number;
  isShowingLines: boolean;
  isShowing50Lines?: boolean;
  animationPhase?: 'projecting' | 'paths' | 'optimizing' | 'drawing-final' | 'final';
}

// 🎯 FASE 2 OTIMIZAÇÃO: Performance constants
const PERFORMANCE_CONFIG = {
  MAX_LINES_SCENE_2: 1001, // Scene 2: Show all lines
  OPTIMIZED_LINES_SCENE_3: 50, // Scene 3: Show 50 optimized lines
  THROTTLE_DELAY: 16, // ~60fps throttling
  BATCH_SIZE_SCENE_2: 100, // Larger batches for scene 2
  BATCH_SIZE_SCENE_3: 10, // Smaller batches for scene 3 precision
  CANVAS_ALPHA: true,
  LINE_WIDTH_SCENE_2: 1.0,
  LINE_WIDTH_SCENE_3: 2.2,
  OPACITY_SCENE_2: 0.3,
  OPACITY_SCENE_3: 0.8,
} as const;

export const OptimizedMonteCarloLines = React.memo(({
  chartData,
  width,
  height,
  xScale,
  yScale,
  isShowingLines,
  isShowing50Lines = false,
  animationPhase = 'final'
}: OptimizedMonteCarloLinesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);

  // 🎯 OTIMIZAÇÃO: Determine current scene and configuration
  const currentScene = useMemo(() => {
    if (animationPhase === 'paths' && isShowingLines) return 'scene2';
    if (animationPhase === 'optimizing' && isShowing50Lines) return 'scene3';
    return 'none';
  }, [animationPhase, isShowingLines, isShowing50Lines]);

  const sceneConfig = useMemo(() => {
    switch (currentScene) {
      case 'scene2':
        return {
          totalLines: PERFORMANCE_CONFIG.MAX_LINES_SCENE_2,
          batchSize: PERFORMANCE_CONFIG.BATCH_SIZE_SCENE_2,
          lineWidth: PERFORMANCE_CONFIG.LINE_WIDTH_SCENE_2,
          opacity: PERFORMANCE_CONFIG.OPACITY_SCENE_2,
          duration: LINE_ANIMATION.DRAWING_DURATION,
        };
      case 'scene3':
        return {
          totalLines: PERFORMANCE_CONFIG.OPTIMIZED_LINES_SCENE_3,
          batchSize: PERFORMANCE_CONFIG.BATCH_SIZE_SCENE_3,
          lineWidth: PERFORMANCE_CONFIG.LINE_WIDTH_SCENE_3,
          opacity: PERFORMANCE_CONFIG.OPACITY_SCENE_3,
          duration: 1500, // Faster animation for 50 lines
        };
      default:
        return null;
    }
  }, [currentScene]);

  // 🎯 OTIMIZAÇÃO: Memoized color generation with better distribution
  const lineColors = useMemo(() => {
    if (!sceneConfig) return [];
    
    const colors: string[] = [];
    const baseColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    
    for (let i = 0; i < sceneConfig.totalLines; i++) {
      const baseColor = baseColors[i % baseColors.length];
      const variation = currentScene === 'scene3' ? 
        1 - (i / sceneConfig.totalLines) * 0.3 : // More variation for 50 lines
        1 - (Math.floor(i / baseColors.length) * 0.1); // Less variation for 1001 lines
      
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      
      const newR = Math.round(r * variation);
      const newG = Math.round(g * variation);
      const newB = Math.round(b * variation);
      
      colors.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`);
    }
    
    return colors;
  }, [sceneConfig, currentScene]);

  // 🎯 OTIMIZAÇÃO: Throttled drawing function with RAF
  const throttledDraw = useCallback((timestamp: number) => {
    // Throttling for 60fps performance
    if (timestamp - lastRenderTime.current < PERFORMANCE_CONFIG.THROTTLE_DELAY) {
      animationRef.current = requestAnimationFrame(throttledDraw);
      return;
    }
    lastRenderTime.current = timestamp;

    if (!canvasRef.current || !sceneConfig) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: PERFORMANCE_CONFIG.CANVAS_ALPHA });
    if (!ctx) return;

    if (!startTimeRef.current) startTimeRef.current = timestamp;
    
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / sceneConfig.duration, 1);
    
    // Clear canvas efficiently
    ctx.clearRect(0, 0, width, height);
    
    // Calculate lines to draw based on progress
    const linesToDraw = Math.floor(progress * sceneConfig.totalLines);
    
    if (linesToDraw === 0) {
      animationRef.current = requestAnimationFrame(throttledDraw);
      return;
    }

    // 🎯 OTIMIZAÇÃO: Batch rendering with optimized context operations
    ctx.save();
    ctx.lineWidth = sceneConfig.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Process in batches for better performance
    for (let batch = 0; batch < Math.ceil(linesToDraw / sceneConfig.batchSize); batch++) {
      const startIdx = batch * sceneConfig.batchSize;
      const endIdx = Math.min(startIdx + sceneConfig.batchSize, linesToDraw);
      
      // Batch context operations
      ctx.beginPath();
      
      for (let lineIndex = startIdx; lineIndex < endIdx; lineIndex++) {
        ctx.strokeStyle = lineColors[lineIndex];
        ctx.globalAlpha = sceneConfig.opacity + (lineIndex / sceneConfig.totalLines) * 0.4;
        
        // Draw line path
        let firstPoint = true;
        ctx.beginPath();
        
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
      animationRef.current = requestAnimationFrame(throttledDraw);
    }
  }, [chartData, width, height, xScale, yScale, lineColors, sceneConfig]);

  // 🎯 OTIMIZAÇÃO: Effect with cleanup and performance monitoring
  useEffect(() => {
    if (currentScene === 'none') {
      // Clear canvas when no scene is active
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }
      }
      return;
    }

    // Set canvas dimensions
    if (canvasRef.current) {
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }

    // Reset timing
    startTimeRef.current = 0;
    lastRenderTime.current = 0;

    // Start animation
    animationRef.current = requestAnimationFrame(throttledDraw);

    // Debug logging for performance monitoring
    console.log(`🎯 FASE 2 Monte Carlo Otimizado: ${currentScene} iniciado`, {
      totalLines: sceneConfig?.totalLines,
      batchSize: sceneConfig?.batchSize,
      duration: sceneConfig?.duration
    });

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      startTimeRef.current = 0;
      lastRenderTime.current = 0;
    };
  }, [currentScene, throttledDraw, width, height, sceneConfig]);

  // Don't render canvas if no scene is active
  if (currentScene === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: currentScene === 'scene3' ? 2 : 1, // Higher z-index for scene 3
      }}
      aria-label={`Monte Carlo simulation ${currentScene === 'scene2' ? '1001 scenarios' : '50 optimized scenarios'}`}
    />
  );
}); 
