
import { MonteCarloResult } from '@/lib/utils';
import { ChartContainer } from './ChartContainer';
import { ReferenceLines } from './ReferenceLines';
import { MonteCarloLines } from './MonteCarloLines';
import { FinalResultLines } from './FinalResultLines';
import { LINE_ANIMATION } from '@/components/calculator/constants';

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
  lineDrawingDuration = LINE_ANIMATION.DRAWING_DURATION,
  actualLinesCount
}: ChartRendererProps) => {
  
  // Detect actual number of Monte Carlo lines in the data
  const detectLinesInData = () => {
    if (!chartData || chartData.length === 0) return 0;
    
    const firstDataPoint = chartData[0] || {};
    const lineKeys = Object.keys(firstDataPoint).filter(key => 
      key.startsWith('line') && key.match(/^line\d+$/)
    );
    
    return lineKeys.length;
  };

  const detectedLines = detectLinesInData();
  const totalLinesToRender = actualLinesCount || detectedLines || LINE_ANIMATION.TOTAL_LINES;

  console.log('📊 ChartRenderer lines detection:', {
    chartDataLength: chartData.length,
    hasMonteCarloData: !!monteCarloData,
    isShowingLines,
    isDrawingFinalLines,
    lineDrawingDuration,
    detectedLines,
    actualLinesCount,
    totalLinesToRender,
    firstDataKeys: chartData[0] ? Object.keys(chartData[0]).filter(k => k.startsWith('line')).slice(0, 10) : []
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
        totalLinesToRender={totalLinesToRender}
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
