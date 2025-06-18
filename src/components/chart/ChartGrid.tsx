
import { XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { formatYAxis } from './chartUtils';
import { MonteCarloResult } from '@/lib/utils';

interface ChartGridProps {
  monteCarloData: MonteCarloResult | null;
}

export const ChartGrid = ({ monteCarloData }: ChartGridProps) => {
  return (
    <>
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
    </>
  );
};
