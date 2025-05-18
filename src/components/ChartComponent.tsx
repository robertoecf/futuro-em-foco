
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChartComponentProps {
  data: number[];
  accumulationYears: number;
  lifeExpectancy: number;
  onLifeExpectancyChange?: (value: number) => void;
}

export const ChartComponent = ({ 
  data, 
  accumulationYears, 
  lifeExpectancy = 100,
  onLifeExpectancyChange 
}: ChartComponentProps) => {
  const [localLifeExpectancy, setLocalLifeExpectancy] = useState(lifeExpectancy);

  const handleLifeExpectancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLocalLifeExpectancy(value);
      if (onLifeExpectancyChange) {
        onLifeExpectancyChange(value);
      }
    }
  };

  const chartData = data.map((value, index) => ({
    year: index,
    patrimonio: value,
    fase: index <= accumulationYears ? "Acumulação" : "Aposentadoria"
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const phase = payload[0].payload.fase;
      return (
        <Card className="p-0 border shadow-md">
          <CardContent className="p-3">
            <p className="text-sm font-bold">{`Ano ${label}`}</p>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <Label htmlFor="life-expectancy" className="text-sm">Expectativa de vida (anos):</Label>
        <Input
          id="life-expectancy"
          type="number"
          value={localLifeExpectancy}
          onChange={handleLifeExpectancyChange}
          className="w-20"
          min={accumulationYears + 1}
        />
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
              dataKey="year" 
              label={{ value: 'Anos', position: 'insideBottom', offset: -10 }}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis 
              tickFormatter={(value) => `R$${Math.floor(value/1000)}k`}
              label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference line for retirement year */}
            <ReferenceLine 
              x={accumulationYears} 
              stroke="#FF6B00" 
              strokeDasharray="5 5" 
              label={{ 
                value: 'Aposentadoria', 
                position: 'top', 
                fill: '#FF6B00',
                fontSize: 12
              }} 
            />
            
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
      </div>
    </div>
  );
};
