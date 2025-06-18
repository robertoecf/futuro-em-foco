import { MonteCarloResult } from '@/lib/utils';

interface ChartDataProcessorProps {
  data: number[];
  currentAge: number;
  accumulationYears: number;
  initialAmount: number;
  monthlyAmount: number;
  monthlyIncomeTarget: number;
  monteCarloData: MonteCarloResult | null;
  isMonteCarloEnabled: boolean;
}

export const useChartDataProcessor = ({
  data,
  currentAge,
  accumulationYears,
  initialAmount,
  monthlyAmount,
  monthlyIncomeTarget,
  monteCarloData,
  isMonteCarloEnabled
}: ChartDataProcessorProps) => {
  
  // Calculate savings line
  const calculateSavingsLine = () => {
    const savingsData: number[] = [];
    let totalSaved = initialAmount;
    
    for (let year = 0; year <= data.length - 1; year++) {
      const age = currentAge + year;
      
      if (year === 0) {
        savingsData.push(initialAmount);
      } else if (age <= (currentAge + accumulationYears)) {
        totalSaved += monthlyAmount * 12;
        savingsData.push(totalSaved);
      } else {
        const monthlyIncome = monthlyIncomeTarget > 0 ? monthlyIncomeTarget : data[accumulationYears] * 0.004;
        totalSaved -= monthlyIncome * 12;
        savingsData.push(Math.max(0, totalSaved));
      }
    }
    
    return savingsData;
  };

  // Generate Monte Carlo lines based on available data
  const generateMonteCarloLines = () => {
    if (!isMonteCarloEnabled || !monteCarloData) {
      return [];
    }
    
    console.log('🎨 Generating Monte Carlo lines from available data');
    const lines = [];
    const baseData = monteCarloData.scenarios.median;
    
    // Check how many line keys are available in the first data point
    const firstDataPoint = data[0] || {};
    const availableLineKeys = Object.keys(firstDataPoint).filter(key => key.startsWith('line'));
    const numberOfLines = availableLineKeys.length;
    
    console.log('📊 Available Monte Carlo lines in data:', {
      totalDataPoints: data.length,
      availableLineKeys: numberOfLines,
      firstLineKeys: availableLineKeys.slice(0, 5) // Show first 5 for debugging
    });
    
    // Generate lines based on available data or create synthetic ones
    const targetLines = Math.max(numberOfLines, 50); // Minimum 50 lines for visual effect
    
    for (let lineIndex = 0; lineIndex < targetLines; lineIndex++) {
      const lineData = baseData.map((value, dataIndex) => {
        // Use existing line data if available
        if (data[dataIndex] && data[dataIndex][`line${lineIndex}`] !== undefined) {
          return data[dataIndex][`line${lineIndex}`];
        }
        
        // Otherwise, create variation between pessimistic and optimistic scenarios
        const pessimistic = monteCarloData.scenarios.pessimistic[dataIndex] || value;
        const optimistic = monteCarloData.scenarios.optimistic[dataIndex] || value;
        
        // Interpolate between scenarios with some randomness
        const randomFactor = Math.random();
        const interpolated = pessimistic + (optimistic - pessimistic) * randomFactor;
        
        // Add some additional noise for visual variety
        const noise = (Math.random() - 0.5) * 0.1 * value;
        
        return Math.max(0, interpolated + noise);
      });
      lines.push(lineData);
    }
    
    console.log('✅ Generated', lines.length, 'Monte Carlo lines');
    return lines;
  };

  // Detect number of Monte Carlo lines in chart data
  const detectMonteCarloLinesCount = () => {
    if (!monteCarloData || data.length === 0) return 0;
    
    const firstDataPoint = data[0] || {};
    const lineKeys = Object.keys(firstDataPoint).filter(key => key.startsWith('line') && key.match(/^line\d+$/));
    const count = lineKeys.length;
    
    console.log('🔍 Detected Monte Carlo lines in chart data:', {
      totalKeys: Object.keys(firstDataPoint).length,
      lineKeys: lineKeys.slice(0, 10), // Show first 10 for debugging
      detectedCount: count
    });
    
    return count;
  };

  const savingsLine = calculateSavingsLine();
  const monteCarloLines = generateMonteCarloLines();
  const actualLinesCount = detectMonteCarloLinesCount();

  console.log('📊 ChartDataProcessor summary:', {
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    monteCarloLinesGenerated: monteCarloLines.length,
    actualLinesInData: actualLinesCount,
    dataLength: data.length
  });

  const chartData = data.map((value, index) => {
    const age = currentAge + index;
    const baseData = {
      age,
      patrimonio: value,
      poupanca: savingsLine[index] || 0,
      fase: age < (currentAge + accumulationYears) ? "Acumulação" : "Aposentadoria"
    };

    // Always include Monte Carlo data when available
    if (monteCarloData && index < monteCarloData.scenarios.pessimistic.length) {
      const monteCarloData_final = {
        pessimistic: monteCarloData.scenarios.pessimistic[index],
        median: monteCarloData.scenarios.median[index],
        optimistic: monteCarloData.scenarios.optimistic[index],
        percentile25: monteCarloData.statistics.percentile25[index],
        percentile75: monteCarloData.statistics.percentile75[index]
      };

      // Add the Monte Carlo lines data from generated lines
      const linesData: Record<string, number> = {};
      monteCarloLines.forEach((line, lineIndex) => {
        if (index < line.length) {
          linesData[`line${lineIndex}`] = line[lineIndex];
        }
      });

      return { ...baseData, ...monteCarloData_final, ...linesData };
    }

    return baseData;
  });

  return { 
    chartData, 
    savingsLine, 
    monteCarloLines, 
    actualLinesCount: Math.max(actualLinesCount, monteCarloLines.length) 
  };
};
