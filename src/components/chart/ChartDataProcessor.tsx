
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

  // Generate 50 Monte Carlo lines when data is available
  const generateMonteCarloLines = () => {
    if (!isMonteCarloEnabled || !monteCarloData) {
      return [];
    }
    
    console.log('🎨 Generating 50 Monte Carlo lines');
    const lines = [];
    const baseData = monteCarloData.scenarios.median;
    
    // Generate 50 varied paths based on the Monte Carlo scenarios
    for (let lineIndex = 0; lineIndex < 50; lineIndex++) {
      const lineData = baseData.map((value, dataIndex) => {
        // Create variation between pessimistic and optimistic scenarios
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

  const savingsLine = calculateSavingsLine();
  const monteCarloLines = generateMonteCarloLines();

  console.log('📊 ChartDataProcessor:', {
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    monteCarloLinesGenerated: monteCarloLines.length
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

      // Add the 50 Monte Carlo lines data
      const linesData: Record<string, number> = {};
      monteCarloLines.forEach((line, lineIndex) => {
        if (index < line.length) {
          linesData[`line${lineIndex}`] = line[index];
        }
      });

      return { ...baseData, ...monteCarloData_final, ...linesData };
    }

    return baseData;
  });

  return { chartData, savingsLine, monteCarloLines };
};
