
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { CustomTooltip } from './chart/CustomTooltip';
import { ChartControls } from './chart/ChartControls';
import { ChartInfo } from './chart/ChartInfo';
import { calculatePossibleRetirementAge, calculatePerpetuityWealth, formatYAxis } from './chart/chartUtils';

interface ChartComponentProps {
  data: number[];
  accumulationYears: number;
  lifeExpectancy: number;
  currentAge: number;
  monthlyIncomeTarget?: number;
  portfolioReturn?: number;
  onLifeExpectancyChange?: (value: number) => void;
  showLifeExpectancyControl?: boolean;
  monteCarloData?: MonteCarloResult | null;
  isCalculating?: boolean;
  isMonteCarloEnabled?: boolean;
  onMonteCarloToggle?: (enabled: boolean) => void;
}

export const ChartComponent = ({ 
  data, 
  accumulationYears, 
  lifeExpectancy = 100,
  currentAge = 30,
  monthlyIncomeTarget = 0,
  portfolioReturn = 4,
  onLifeExpectancyChange,
  showLifeExpectancyControl = true,
  monteCarloData,
  isCalculating = false,
  isMonteCarloEnabled = false,
  onMonteCarloToggle
}: ChartComponentProps) => {
  console.log('ChartComponent data:', data);
  console.log('ChartComponent Monte Carlo data:', monteCarloData);

  const chartData = data.map((value, index) => {
    const age = currentAge + index;
    const baseData = {
      age,
      patrimonio: value,
      fase: age < (currentAge + accumulationYears) ? "Acumulação" : "Aposentadoria"
    };

    // Add Monte Carlo data if available
    if (monteCarloData && index < monteCarloData.scenarios.pessimistic.length) {
      return {
        ...baseData,
        pessimistic: monteCarloData.scenarios.pessimistic[index],
        median: monteCarloData.scenarios.median[index],
        optimistic: monteCarloData.scenarios.optimistic[index],
        percentile25: monteCarloData.statistics.percentile25[index],
        percentile75: monteCarloData.statistics.percentile75[index]
      };
    }

    return baseData;
  });

  const possibleRetirementAge = calculatePossibleRetirementAge(
    data,
    monthlyIncomeTarget,
    portfolioReturn,
    currentAge,
    accumulationYears
  );
  
  const perpetuityWealth = calculatePerpetuityWealth(monthlyIncomeTarget, portfolioReturn);

  if (isCalculating) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculando simulações Monte Carlo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Controls Section */}
      {(showLifeExpectancyControl || onMonteCarloToggle) && (
        <ChartControls
          lifeExpectancy={lifeExpectancy}
          possibleRetirementAge={possibleRetirementAge}
          isMonteCarloEnabled={isMonteCarloEnabled}
          onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
          onMonteCarloToggle={onMonteCarloToggle || (() => {})}
        />
      )}

      {/* Chart Section */}
      <div className="h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
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
                value: 'Aposentadoria Possível', 
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
                  value: 'Perpetuidade', 
                  position: 'insideTopRight', 
                  fill: '#6B7280',
                  fontSize: 11
                }} 
              />
            )}

            {/* Monte Carlo lines */}
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Information Section */}
      <ChartInfo
        monteCarloData={monteCarloData}
        perpetuityWealth={perpetuityWealth}
        possibleRetirementAge={possibleRetirementAge}
      />
    </div>
  );
};
