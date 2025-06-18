
import { ComposedChart, ResponsiveContainer } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { ChartGrid } from './ChartGrid';
import { ReferenceLines } from './ReferenceLines';
import { LineComponents } from './LineComponents';
import { LINE_ANIMATION } from '@/components/calculator/constants';

interface ChartRendererProps {
  chartData: any[];
  possibleRetirementAge: number;
  perpetuityWealth: number;
  monteCarloData: MonteCarloResult | null;
  isShowingLines: boolean;
  isDrawingFinalLines: boolean;
  lineDrawingDuration?: number;
}

export const ChartRenderer = ({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monteCarloData,
  isShowingLines,
  isDrawingFinalLines,
  lineDrawingDuration = LINE_ANIMATION.DRAWING_DURATION
}: ChartRendererProps) => {

  console.log('📊 ChartRenderer (fixed):', {
    chartDataLength: chartData.length,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines,
    lineDrawingDuration
  });

  return (
    <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <ChartGrid monteCarloData={monteCarloData} />
          
          <ReferenceLines 
            possibleRetirementAge={possibleRetirementAge}
            perpetuityWealth={perpetuityWealth}
          />

          <LineComponents
            monteCarloData={monteCarloData}
            isShowingLines={isShowingLines}
            isDrawingFinalLines={isDrawingFinalLines}
            lineDrawingDuration={lineDrawingDuration}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
