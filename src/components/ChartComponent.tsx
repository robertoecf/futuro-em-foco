
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface ChartComponentProps {
  data: number[];
  accumulationYears: number;
  lifeExpectancy: number;
  currentAge: number;
  monthlyIncomeTarget?: number;
  portfolioReturn?: number;
  onLifeExpectancyChange?: (value: number) => void;
  showLifeExpectancyControl?: boolean;
}

export const ChartComponent = ({ 
  data, 
  accumulationYears, 
  lifeExpectancy = 100,
  currentAge = 30,
  monthlyIncomeTarget = 0,
  portfolioReturn = 4,
  onLifeExpectancyChange,
  showLifeExpectancyControl = true
}: ChartComponentProps) => {
  console.log('ChartComponent data:', data);
  console.log('ChartComponent currentAge:', currentAge);
  console.log('ChartComponent accumulationYears:', accumulationYears);

  const chartData = data.map((value, index) => {
    const age = currentAge + index;
    console.log(`Index ${index}: age ${age}, value ${value}`);
    return {
      age,
      patrimonio: value,
      fase: age < (currentAge + accumulationYears) ? "Acumulação" : "Aposentadoria"
    };
  });

  const retirementAge = currentAge + accumulationYears;
  
  // Calcular patrimônio necessário para perpetuidade
  const perpetuityWealth = monthlyIncomeTarget > 0 && portfolioReturn > 0 
    ? (monthlyIncomeTarget * 12) / (portfolioReturn / 100)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const phase = payload[0].payload.fase;
      return (
        <Card className="p-0 border shadow-md">
          <CardContent className="p-3">
            <p className="text-sm font-bold">{`Idade: ${label} anos`}</p>
            <p className="text-sm">
              {`Patrimônio: ${formatCurrency(payload[0].value)}`}
            </p>
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <defs>
            <linearGradient id="accumulationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="retirementGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          
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
          <Legend 
            verticalAlign="top" 
            align="left"
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          
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
                position: 'topRight', 
                fill: '#10B981',
                fontSize: 12
              }} 
            />
          )}
          
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
        </LineChart>
      </ResponsiveContainer>
      
      {/* Perpetuity explanation */}
      {perpetuityWealth > 0 && (
        <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500" style={{ borderBottom: '2px dashed #10B981' }}></div>
          <span>Patrimônio para Perpetuidade: {formatCurrency(perpetuityWealth)} (renda indefinida sem esgotar o capital)</span>
        </div>
      )}
    </div>
  );
};
