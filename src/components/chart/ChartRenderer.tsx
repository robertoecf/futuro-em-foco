
import { MonteCarloResult } from '@/lib/utils';
import { ChartContainer } from './ChartContainer';
import { ReferenceLines } from './ReferenceLines';
import { MonteCarloLines } from './MonteCarloLines';
import { FinalResultLines } from './FinalResultLines';

interface ChartRendererProps {
  chartData: any[];
  possibleRetirementAge: number;
  perpetuityWealth: number;
  monteCarloData: MonteCarloResult | null;
  isShowingLines: boolean;
  isDrawingFinalLines: boolean;
  lineDrawingDuration?: number;
  actualLinesCount?: number;
}

export const ChartRenderer = ({
  chartData,
  possibleRetirementAge,
  perpetuityWealth,
  monteCarloData,
  isShowingLines,
  isDrawingFinalLines,
  lineDrawingDuration = 2000,
  actualLinesCount = 0
}: ChartRendererProps) => {
  
  console.log('📊 ChartRenderer rendering:', {
    chartDataLength: chartData.length,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines,
    actualLinesCount,
    sampleDataKeys: chartData[0] ? Object.keys(chartData[0]).filter(k => k.startsWith('line')).length : 0
  });

  return (
    <ChartContainer chartData={chartData} monteCarloData={monteCarloData}>
      <ReferenceLines 
        possibleRetirementAge={possibleRetirementAge}
        perpetuityWealth={perpetuityWealth}
      />
      
      <MonteCarloLines
        chartData={chartData}
        monteCarloData={monteCarloData}
        isShowingLines={isShowingLines}
        totalLinesToRender={actualLinesCount}
        lineDrawingDuration={lineDrawingDuration}
      />

      <FinalResultLines
        monteCarloData={monteCarloData}
        isDrawingFinalLines={isDrawingFinalLines}
        isShowingLines={isShowingLines}
      />
    </ChartContainer>
  );
};
