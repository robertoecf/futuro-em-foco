
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, AreaChart } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MonteCarloResult } from '@/lib/utils';

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
  isCalculating = false
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

  const retirementAge = currentAge + accumulationYears;
  
  // Calcular patrimônio necessário para perpetuidade
  const perpetuityWealth = monthlyIncomeTarget > 0 && portfolioReturn > 0 
    ? (monthlyIncomeTarget * 12) / (portfolioReturn / 100)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const phase = data.fase;
      
      return (
        <Card className="p-0 border shadow-md">
          <CardContent className="p-3">
            <p className="text-sm font-bold">{`Idade: ${label} anos`}</p>
            
            {monteCarloData ? (
              <div className="space-y-1">
                <p className="text-sm text-green-600">
                  {`Cenário Otimista: ${formatCurrency(data.optimistic || 0)}`}
                </p>
                <p className="text-sm font-medium text-blue-600">
                  {`Cenário Neutro: ${formatCurrency(data.median || 0)}`}
                </p>
                <p className="text-sm text-red-600">
                  {`Cenário Pessimista: ${formatCurrency(data.pessimistic || 0)}`}
                </p>
              </div>
            ) : (
              <p className="text-sm">
                {`Patrimônio: ${formatCurrency(data.patrimonio)}`}
              </p>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              {phase === "Acumulação" ? "Fase de Acumulação" : "Fase de Aposentadoria"}
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  // Create a custom formatter for the Y-axis that uses Intl.NumberFormat
  const formatYAxis = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

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
    <div className="h-[400px] w-full">
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
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference line for retirement age */}
          <ReferenceLine 
            x={retirementAge} 
            stroke="#FF6B00" 
            strokeDasharray="5 5" 
            label={{ 
              value: 'Aposentadoria', 
              position: 'top', 
              fill: '#FF6B00',
              fontSize: 12
            }} 
          />
          
          {/* Reference line for perpetuity wealth */}
          {perpetuityWealth > 0 && (
            <ReferenceLine 
              y={perpetuityWealth} 
              stroke="#10B981" 
              strokeDasharray="8 4" 
              label={{ 
                value: 'Perpetuidade', 
                position: 'insideTopRight', 
                fill: '#10B981',
                fontSize: 12
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
      
      {/* Custom Legend */}
      <div className="mt-4 flex flex-col gap-2 text-xs text-gray-600">
        {/* Monte Carlo Legend */}
        {monteCarloData && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-green-500 border-dashed border-2"></div>
              <span>Cenário Otimista (75º percentil)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-500"></div>
              <span>Cenário Neutro (50º percentil)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-red-600 border-dashed border-2"></div>
              <span>Cenário Pessimista (25º percentil)</span>
            </div>
            {monteCarloResult.statistics.successProbability && (
              <div className="text-sm font-medium text-green-600 mt-2">
                Probabilidade de Sucesso: {(monteCarloResult.statistics.successProbability * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}
        
        {/* Perpetuity Legend Item */}
        {perpetuityWealth > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-green-500"></div>
            <span>Patrimônio para Perpetuidade: {formatCurrency(perpetuityWealth)} (renda indefinida sem esgotar o capital)</span>
          </div>
        )}
        
        {/* Patrimônio Legend Item (only for deterministic) */}
        {!monteCarloData && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-orange-500"></div>
            <span>Patrimônio</span>
          </div>
        )}
      </div>
    </div>
  );
};
