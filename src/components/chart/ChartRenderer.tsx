import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import type { ChartDataPoint } from '@/utils/csvExport';
import { CustomTooltip } from './CustomTooltip';
import { formatYAxis } from './utils/chartUtils';
import { useFinalLinesAnimation } from './useFinalLinesAnimation';
import { ChartVisibilityState } from './ChartInfo';

// Monte Carlo configuration
const MONTE_CARLO_EXHIBITION_LINES = 101; // Show 101 random lines in Scene 2

// Função para amostrar índices aleatórios únicos
function getRandomSampleIndices(total: number, sampleSize: number): number[] {
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, sampleSize);
}

interface ChartRendererProps {
  chartData: ChartDataPoint[];
  possibleRetirementAge: number;
  perpetuityWealth: number;
  monthlyIncomeTarget: number;
  monteCarloData: MonteCarloResult | null;
  isShowingLines: boolean;
  isShowing50Lines?: boolean;
  isDrawingFinalLines: boolean;
  lineDrawingDuration?: number;
  animationPhase?: 'projecting' | 'paths' | 'optimizing' | 'drawing-final' | 'final';
  showGrid?: boolean;
  visibility?: ChartVisibilityState;
  userRetirementAge?: number;
}

export const ChartRenderer = React.memo(
  ({
    chartData,
    possibleRetirementAge,
    perpetuityWealth,
    monthlyIncomeTarget: _monthlyIncomeTarget,
    monteCarloData,
    isShowingLines,
    isShowing50Lines: _isShowing50Lines,
    isDrawingFinalLines,
    animationPhase = 'final',
    showGrid = true,
    visibility,
    userRetirementAge,
  }: ChartRendererProps) => {
    const [labelColor, setLabelColor] = useState('#111827');

    useEffect(() => {
      const observer = new MutationObserver(() => {
        setLabelColor(document.documentElement.classList.contains('dark') ? '#FEFFFB' : '#111827');
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      // Set initial color
      setLabelColor(document.documentElement.classList.contains('dark') ? '#FEFFFB' : '#111827');

      return () => observer.disconnect();
    }, []);

    const { getFinalLineAnimationState } =
      useFinalLinesAnimation({
        isDrawingFinalLines,
      });

    // Estado para controlar se as bolinhas devem estar visíveis
    const shouldShowActiveDots = animationPhase === 'final' && !isDrawingFinalLines;

    // Estado para linhas Monte Carlo progressivas
    const [sampleIndices, setSampleIndices] = React.useState<number[]>([]);
    const [linesToShow, setLinesToShow] = React.useState(0);

    // Atualiza amostra de linhas e reseta progressão ao ativar isShowingLines
    React.useEffect(() => {
      if (monteCarloData && isShowingLines) {
        const totalLines = monteCarloData.allPaths ? monteCarloData.allPaths.length : 1001;
        setSampleIndices(getRandomSampleIndices(totalLines, MONTE_CARLO_EXHIBITION_LINES));
        setLinesToShow(0);
      }
    }, [monteCarloData, isShowingLines]);

    // Progressão animada das linhas
    React.useEffect(() => {
      if (!isShowingLines || sampleIndices.length === 0) return;
      let running = true;
      const interval = setInterval(() => {
        setLinesToShow((prev) => {
          if (!running) return prev;
          if (prev < sampleIndices.length) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 18); // ~1.8s para 101 linhas
      return () => {
        running = false;
        clearInterval(interval);
      };
    }, [isShowingLines, sampleIndices]);

    // 🎯 ABORDAGEM DIRETA: Garantir idades importantes nos ticks
    const allTicks = (() => {
      if (!chartData || chartData.length === 0) return [];

      const minAge = chartData[0].age;
      const maxAge = chartData[chartData.length - 1].age;

      // ✨ TICKS OBRIGATÓRIOS
      const mandatoryTicks: number[] = [minAge]; // Sempre início

      // 🔥 PRIORIDADE ABSOLUTA: Idade de aposentadoria (60)
      if (userRetirementAge && userRetirementAge > 0) {
        mandatoryTicks.push(userRetirementAge);
      }

      // ⭐ SEGUNDA PRIORIDADE: Idade calculada (53)
      if (possibleRetirementAge && possibleRetirementAge > 0) {
        mandatoryTicks.push(possibleRetirementAge);
      }

      // 📊 TICKS INTERMEDIÁRIOS: Múltiplos de 10 que não conflitam
      for (let age = Math.ceil(minAge / 10) * 10; age <= maxAge; age += 10) {
        // Só adiciona se não estiver muito próximo das idades importantes
        const tooClose = mandatoryTicks.some((tick) => Math.abs(tick - age) < 3);
        if (!tooClose) {
          mandatoryTicks.push(age);
        }
      }

      // Sempre fim
      mandatoryTicks.push(maxAge);

      // Remove duplicatas e ordena
      const finalTicks = [...new Set(mandatoryTicks)].sort((a, b) => a - b);

      // Custom tick generation for chart axes

      return finalTicks;
    })();

    // Generate colors for the lines
    const generateLineColor = (index: number) => {
      const colors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FECA57',
        '#FF9FF3',
        '#54A0FF',
        '#5F27CD',
        '#00D2D3',
        '#FF9F43',
        '#FC427B',
        '#1DD1A1',
        '#3742FA',
        '#2F3542',
        '#FF5722',
        '#009688',
        '#673AB7',
        '#E91E63',
        '#795548',
        '#607D8B',
      ];
      return colors[index % colors.length];
    };

    // Validation for chart rendering
    if (!chartData?.length) {
      return null;
    }

    return (
      <>
        <div className="relative h-[400px] w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={
                typeof window !== 'undefined' && window.innerWidth < 640
                  ? { top: 10, right: 10, left: 10, bottom: 10 }
                  : { top: 20, right: 30, left: 30, bottom: 20 }
              }
              style={{
                cursor: shouldShowActiveDots ? 'crosshair' : 'none',
                pointerEvents: shouldShowActiveDots ? 'auto' : 'none',
              }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />}

              <XAxis
                dataKey="age"
                label={
                  typeof window !== 'undefined' && window.innerWidth < 640
                    ? undefined
                    : { value: 'Idade', position: 'insideBottom', offset: -10, fill: labelColor }
                }
                tickFormatter={(value) => `${value}`}
                tick={{
                  fill: labelColor,
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12,
                }}
                axisLine={{ stroke: '#ffffff40' }}
                tickLine={{ stroke: '#ffffff40' }}
                ticks={allTicks}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                tickFormatter={formatYAxis}
                width={typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 60}
                tick={{
                  fill: labelColor,
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12,
                }}
                axisLine={{ stroke: '#ffffff40' }}
                tickLine={{ stroke: '#ffffff40' }}
                tickCount={typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 6}
              />

              {/* 🎯 VOLTA SIMPLES: Linhas de referência normais - problema é mudança de escala */}
              {/* Linha de Independência Financeira */}
              {(possibleRetirementAge > 0 || monteCarloData) &&
                visibility?.references.financialIndependence !== false && (
                  <ReferenceLine
                    x={possibleRetirementAge > 0 ? possibleRetirementAge : 65}
                    stroke="#9CA3AF"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: 'Independência financeira',
                      position: 'bottom',
                      offset: 15,
                      fill: labelColor,
                      fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 11,
                    }}
                  />
                )}

              {/* Linha de Patrimônio Perpetuidade */}
              {(perpetuityWealth > 0 || monteCarloData) &&
                visibility?.references.perpetuityWealth !== false && (
                  <ReferenceLine
                    y={perpetuityWealth > 0 ? perpetuityWealth : 1000000}
                    stroke="#9CA3AF"
                    strokeDasharray="8 4"
                    strokeWidth={2}
                    label={{
                      value: 'Patrimônio Perpetuidade',
                      position: 'insideTopRight',
                      fill: labelColor,
                      fontSize: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 11,
                    }}
                  />
                )}

              {shouldShowActiveDots && (
                <Tooltip
                  content={<CustomTooltip monteCarloData={monteCarloData} />}
                  cursor={false} // Remove a linha pontilhada vertical
                  animationDuration={0}
                  wrapperStyle={{
                    zIndex: 9999,
                    pointerEvents: 'auto',
                  }}
                  allowEscapeViewBox={{ x: true, y: true }} // Permite tooltip escapar dos limites para melhor posicionamento
                  isAnimationActive={false} // Desabilita animações para resposta mais rápida
                  offset={10} // Adiciona um pequeno offset para melhor posicionamento
                />
              )}

              {/* Savings line - controlled by visibility */}
              {visibility?.scenarios.totalSaved !== false && (
                isShowingLines ? (
                  <Line
                    type="monotone"
                    dataKey="poupanca"
                    name="Total Poupado"
                    stroke="#6B7280"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                    data={chartData.slice(0, linesToShow > 0 ? linesToShow : 1)}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="poupanca"
                    name="Total Poupado"
                    stroke="#6B7280"
                    strokeWidth={2}
                    strokeDasharray={isDrawingFinalLines ? getFinalLineAnimationState().strokeDasharray : '8 4'}
                    strokeDashoffset={isDrawingFinalLines ? getFinalLineAnimationState().strokeDashoffset : undefined}
                    strokeOpacity={isDrawingFinalLines ? getFinalLineAnimationState().opacity : 1}
                    dot={false}
                    activeDot={
                      shouldShowActiveDots
                        ? { r: 6, stroke: '#6B7280', strokeWidth: 2, fill: '#fff' }
                        : false
                    }
                    isAnimationActive={false}
                    style={isDrawingFinalLines ? getFinalLineAnimationState().drawingStyle : {}}
                  />
                )
              )}

              {/* Monte Carlo Animation Lines - Scene 2: Show 101 random lines, progressive */}
              {monteCarloData && isShowingLines && sampleIndices.slice(0, linesToShow).map((lineIndex, i) => (
                <Line
                  key={`monte-carlo-exhibition-line-${lineIndex}`}
                  type="monotone"
                  dataKey={`line${lineIndex}`}
                  stroke={generateLineColor(lineIndex)}
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  dot={false}
                  activeDot={false}
                  connectNulls={false}
                  isAnimationActive={true}
                  animationBegin={i * 2}
                  animationDuration={600}
                  animationEasing="ease-out"
                  style={{ pointerEvents: 'none' }}
                />
              ))}

              {/* 🎯 CORREÇÃO: Linhas SEMPRE renderizadas - escala fixa, só animação visual */}
              {monteCarloData && !isShowingLines && (
                <>
                  {/* Pessimistic Line - controlled by visibility */}
                  {visibility?.scenarios.pessimistic !== false && (
                    <Line
                      type="monotone"
                      dataKey="pessimistic"
                      name="Cenário Pessimista"
                      stroke="#DC2626"
                      strokeWidth={2}
                      strokeDasharray={isDrawingFinalLines ? getFinalLineAnimationState().strokeDasharray : '5 5'}
                      strokeDashoffset={getFinalLineAnimationState().strokeDashoffset}
                      strokeOpacity={getFinalLineAnimationState().opacity}
                      dot={false}
                      activeDot={
                        shouldShowActiveDots
                          ? { r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }
                          : false
                      }
                      isAnimationActive={false}
                      style={getFinalLineAnimationState().drawingStyle}
                    />
                  )}

                  {/* Median Line - controlled by visibility */}
                  {visibility?.scenarios.neutral !== false && (
                    <Line
                      type="monotone"
                      dataKey="median"
                      name="Cenário Neutro"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      strokeDasharray={isDrawingFinalLines ? getFinalLineAnimationState().strokeDasharray : 'none'}
                      strokeDashoffset={getFinalLineAnimationState().strokeDashoffset}
                      strokeOpacity={getFinalLineAnimationState().opacity}
                      dot={false}
                      activeDot={
                        shouldShowActiveDots
                          ? { r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }
                          : false
                      }
                      isAnimationActive={false}
                      style={getFinalLineAnimationState().drawingStyle}
                    />
                  )}

                  {/* Optimistic Line - controlled by visibility */}
                  {visibility?.scenarios.optimistic !== false && (
                    <Line
                      type="monotone"
                      dataKey="optimistic"
                      name="Cenário Otimista"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray={isDrawingFinalLines ? getFinalLineAnimationState().strokeDasharray : '5 5'}
                      strokeDashoffset={getFinalLineAnimationState().strokeDashoffset}
                      strokeOpacity={getFinalLineAnimationState().opacity}
                      dot={false}
                      activeDot={
                        shouldShowActiveDots
                          ? { r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }
                          : false
                      }
                      isAnimationActive={false}
                      style={getFinalLineAnimationState().drawingStyle}
                    />
                  )}
                </>
              )}

              {/* Regular patrimonio line - only when Monte Carlo is disabled and visibility allows */}
              {!monteCarloData && visibility?.scenarios.patrimony !== false && (
                <Line
                  type="monotone"
                  dataKey="patrimonio"
                  name="Patrimônio"
                  stroke="#FF6B00"
                  strokeWidth={2}
                  dot={false}
                  activeDot={
                    shouldShowActiveDots
                      ? { r: 8, stroke: '#FF6B00', strokeWidth: 2, fill: '#fff' }
                      : false
                  }
                  connectNulls
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }
);
