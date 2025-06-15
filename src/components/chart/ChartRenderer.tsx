
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { CustomTooltip } from './CustomTooltip';
import { formatYAxis } from './chartUtils';
import { MonteCarloAnimation } from './MonteCarloAnimation';
import { AnimationPhase } from './ChartAnimationStates';

interface ChartRendererProps {
  chartData: any[];
  possibleRetirementAge: number;
  perpetuityWealth: number;
  monteCarloData: MonteCarloResult | null;
  animationPhase: AnimationPhase;
  visiblePaths: number[];
  pathOpacities: Record<number, number>;
}

export const ChartRenderer = ({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monteCarloData,
  animationPhase,
  visiblePaths,
  pathOpacities
}: ChartRendererProps) => {
  
  // Debug chartData structure during animation phases
  if (animationPhase === 'paths' || animationPhase === 'consolidating') {
    const firstDataPoint = chartData[0] || {};
    const pathKeysInData = Object.keys(firstDataPoint).filter(k => k.startsWith('path'));
    
    console.log('📊 ChartRenderer - Animation Phase Debug:', {
      animationPhase,
      chartDataLength: chartData.length,
      pathKeysInFirstPoint: pathKeysInData.length,
      visiblePathsCount: visiblePaths.length,
      pathOpacitiesCount: Object.keys(pathOpacities).length,
      firstDataPointKeys: Object.keys(firstDataPoint),
      pathDataExists: pathKeysInData.length > 0
    });
    
    if (pathKeysInData.length === 0) {
      console.error('❌ ChartRenderer: NO PATH DATA FOUND IN CHART DATA!');
    } else {
      console.log('✅ ChartRenderer: Path data successfully detected in chartData');
    }
  }

  return (
    <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="age" 
            label={{ value: 'Idade', position: 'insideBottom', offset: -10 }}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            width={80}
          />
          <Tooltip content={<CustomTooltip monteCarloData={monteCarloData} />} />
          
          {/* Reference line for possible retirement age */}
          <ReferenceLine 
            x={possibleRetirementAge} 
            stroke="#9CA3AF" 
            strokeDasharray="5 5" 
            label={{ 
              value: 'Idade de Aposentadoria', 
              position: 'top', 
              fill: '#6B7280',
              fontSize: 11
            }} 
          />
          
          {/* Reference line for perpetuity wealth */}
          {perpetuityWealth > 0 && (
            <ReferenceLine 
              y={perpetuityWealth} 
              stroke="#9CA3AF" 
              strokeDasharray="8 4" 
              label={{ 
                value: 'Patrimônio Perpetuidade', 
                position: 'insideTopRight', 
                fill: '#6B7280',
                fontSize: 11
              }} 
            />
          )}

          {/* Savings line - gray continuous line */}
          <Line 
            type="monotone" 
            dataKey="poupanca" 
            name="Total Poupado"
            stroke="#6B7280" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: '#6B7280', strokeWidth: 2, fill: '#fff' }}
          />

          {/* Animation phase: Show animated Monte Carlo paths */}
          <MonteCarloAnimation
            animationPhase={animationPhase}
            visiblePaths={visiblePaths}
            pathOpacities={pathOpacities}
          />

          {/* Final phase: Show Monte Carlo results or main patrimonio line */}
          {animationPhase === 'final' && (
            <>
              {monteCarloData ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="optimistic" 
                    name="Cenário Otimista"
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="median" 
                    name="Cenário Neutro"
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pessimistic" 
                    name="Cenário Pessimista"
                    stroke="#DC2626" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }}
                  />
                </>
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="patrimonio" 
                  name="Patrimônio"
                  stroke="#FF6B00" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8, stroke: '#FF6B00', strokeWidth: 2, fill: '#fff' }}
                  connectNulls
                />
              )}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
