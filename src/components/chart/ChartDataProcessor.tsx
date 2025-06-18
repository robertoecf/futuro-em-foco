
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

  // Generate Monte Carlo lines with guaranteed data inclusion
  const generateMonteCarloLinesData = () => {
    if (!isMonteCarloEnabled || !monteCarloData) {
      console.log('⚠️ Monte Carlo disabled or no data available');
      return { linesData: {}, actualLinesCount: 0 };
    }
    
    console.log('🎯 Generating Monte Carlo lines data');
    
    // Create 50 line variations between pessimistic and optimistic scenarios
    const targetLines = 50;
    const linesData: Record<string, number[]> = {};
    
    for (let lineIndex = 0; lineIndex < targetLines; lineIndex++) {
      const lineData: number[] = [];
      
      for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
        if (dataIndex < monteCarloData.scenarios.pessimistic.length) {
          const pessimistic = monteCarloData.scenarios.pessimistic[dataIndex];
          const optimistic = monteCarloData.scenarios.optimistic[dataIndex];
          const median = monteCarloData.scenarios.median[dataIndex];
          
          // Create variation: interpolate between scenarios with controlled randomness
          const randomFactor = Math.random();
          let interpolated: number;
          
          if (randomFactor < 0.3) {
            // 30% closer to pessimistic
            interpolated = pessimistic + (median - pessimistic) * Math.random();
          } else if (randomFactor > 0.7) {
            // 30% closer to optimistic
            interpolated = median + (optimistic - median) * Math.random();
          } else {
            // 40% between pessimistic and optimistic
            interpolated = pessimistic + (optimistic - pessimistic) * Math.random();
          }
          
          // Add small noise for visual variety (max 5% of value)
          const noise = (Math.random() - 0.5) * 0.05 * interpolated;
          const finalValue = Math.max(0, interpolated + noise);
          
          lineData.push(finalValue);
        } else {
          // Fallback for missing data points
          lineData.push(data[dataIndex] || 0);
        }
      }
      
      linesData[`line${lineIndex}`] = lineData;
    }
    
    console.log('✅ Generated Monte Carlo lines:', {
      targetLines,
      dataLength: data.length,
      sampleKeys: Object.keys(linesData).slice(0, 5)
    });
    
    return { linesData, actualLinesCount: targetLines };
  };

  const savingsLine = calculateSavingsLine();
  const { linesData, actualLinesCount } = generateMonteCarloLinesData();

  console.log('📊 ChartDataProcessor final summary:', {
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    actualLinesCount,
    dataLength: data.length,
    linesGenerated: Object.keys(linesData).length
  });

  // Build chart data with all components
  const chartData = data.map((value, index) => {
    const age = currentAge + index;
    const baseData = {
      age,
      patrimonio: value,
      poupanca: savingsLine[index] || 0,
      fase: age < (currentAge + accumulationYears) ? "Acumulação" : "Aposentadoria"
    };

    // Add Monte Carlo scenario data when available
    const monteCarloScenarios = monteCarloData && index < monteCarloData.scenarios.pessimistic.length ? {
      pessimistic: monteCarloData.scenarios.pessimistic[index],
      median: monteCarloData.scenarios.median[index],
      optimistic: monteCarloData.scenarios.optimistic[index],
      percentile25: monteCarloData.statistics.percentile25[index],
      percentile75: monteCarloData.statistics.percentile75[index]
    } : {};

    // Add individual Monte Carlo lines data
    const individualLinesData: Record<string, number> = {};
    Object.entries(linesData).forEach(([lineKey, lineValues]) => {
      if (index < lineValues.length) {
        individualLinesData[lineKey] = lineValues[index];
      }
    });

    return { 
      ...baseData, 
      ...monteCarloScenarios, 
      ...individualLinesData 
    };
  });

  return { 
    chartData, 
    savingsLine, 
    actualLinesCount
  };
};
