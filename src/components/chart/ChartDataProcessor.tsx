
import { MonteCarloResult } from '@/lib/utils';
import { LINE_ANIMATION } from '@/components/calculator/constants';

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

// Generate unique colors for 500 lines using HSL color space
const generateLineColor = (index: number, total: number = LINE_ANIMATION.TOTAL_LINES) => {
  // Use HSL to generate evenly distributed colors across the spectrum
  const hue = (index * 360) / total; // Distribute across full color wheel
  const saturation = 60 + (index % 30); // Vary saturation for variety
  const lightness = 45 + (index % 20); // Vary lightness for variety
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

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

  // Generate 500 Monte Carlo lines when data is available
  const generateMonteCarloLines = () => {
    if (!isMonteCarloEnabled || !monteCarloData) {
      return [];
    }
    
    console.log('🎨 Generating', LINE_ANIMATION.TOTAL_LINES, 'Monte Carlo lines');
    const lines = [];
    const baseData = monteCarloData.scenarios.median;
    
    // Generate varied paths based on the Monte Carlo scenarios
    for (let lineIndex = 0; lineIndex < LINE_ANIMATION.TOTAL_LINES; lineIndex++) {
      const lineData = baseData.map((value, dataIndex) => {
        // Create variation between pessimistic and optimistic scenarios
        const pessimistic = monteCarloData.scenarios.pessimistic[dataIndex] || value;
        const optimistic = monteCarloData.scenarios.optimistic[dataIndex] || value;
        
        // Use more sophisticated distribution for 500 lines
        const randomFactor1 = Math.random();
        const randomFactor2 = Math.random();
        
        // Create broader distribution with some lines going beyond the original range
        let interpolated;
        if (randomFactor1 < 0.1) {
          // 10% of lines go beyond pessimistic
          interpolated = pessimistic * (0.7 + randomFactor2 * 0.3);
        } else if (randomFactor1 > 0.9) {
          // 10% of lines go beyond optimistic
          interpolated = optimistic * (1.0 + randomFactor2 * 0.5);
        } else {
          // 80% of lines interpolate between scenarios
          interpolated = pessimistic + (optimistic - pessimistic) * randomFactor2;
        }
        
        // Add controlled noise for visual variety
        const noiseIntensity = 0.05 + (lineIndex % 10) * 0.005; // Vary noise by line
        const noise = (Math.random() - 0.5) * noiseIntensity * value;
        
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
    monteCarloLinesGenerated: monteCarloLines.length,
    totalLines: LINE_ANIMATION.TOTAL_LINES
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

      // Add the 500 Monte Carlo lines data
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
    generateLineColor
  };
};
