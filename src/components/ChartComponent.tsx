
import { useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ChartComponentProps {
  data: number[];
  years: number;
}

export const ChartComponent = ({ data, years }: ChartComponentProps) => {
  const chartData = data.map((value, index) => ({
    year: index,
    patrimonio: value,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border shadow-sm">
          <p className="text-sm font-medium">{`Ano ${label}`}</p>
          <p className="text-sm text-gray-700">
            {`Patrimônio: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
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
        <Line 
          type="monotone" 
          dataKey="patrimonio" 
          stroke="#FF6B00" 
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Patrimônio"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
