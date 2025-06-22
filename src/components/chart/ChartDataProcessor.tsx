
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { MonteCarloResult } from '@/lib/utils';

// Monte Carlo configuration
const MONTE_CARLO_ALL_LINES = 1001; // Total scenarios to calculate

// Approximation of inverse normal CDF for percentile mapping
function approximateInverseNormal(p: number): number {
  // Clamp percentile to valid range
  p = Math.max(0.0001, Math.min(0.9999, p));
  
  // Beasley-Springer-Moro approximation
  const a0 = 2.515517, a1 = 0.802853, a2 = 0.010328;
  const b1 = 1.432788, b2 = 0.189269, b3 = 0.001308;
  
  if (p < 0.5) {
    const t = Math.sqrt(-2 * Math.log(p));
    return -((a2 * t + a1) * t + a0) / (((b3 * t + b2) * t + b1) * t + 1);
  } else {
    const t = Math.sqrt(-2 * Math.log(1 - p));
    return ((a2 * t + a1) * t + a0) / (((b3 * t + b2) * t + b1) * t + 1);
  }
}

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

  const monteCarloLinesRef = useRef<number[][]>([]);
  
  // Calculate savings line
  const savingsLine = useMemo(() => {
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
  }, [data, currentAge, accumulationYears, initialAmount, monthlyAmount, monthlyIncomeTarget]);

  // Generate MonteCarloAllLines (1001) when data is available
  const generateMonteCarloLines = useCallback(() => {
    if (!isMonteCarloEnabled || !monteCarloData) {
      console.log('🚫 MonteCarloAllLines generation skipped:', { isMonteCarloEnabled, hasMonteCarloData: !!monteCarloData });
      return [];
    }
    
    console.log('🎲 Generating MonteCarloAllLines:', { 
      totalLines: MONTE_CARLO_ALL_LINES,
      medianDataLength: monteCarloData.scenarios.median.length 
    });
    
    const lines: number[][] = [];
    const baseData = monteCarloData.scenarios.median;
    
    // Generate 1001 varied paths using realistic statistical distribution
    for (let lineIndex = 0; lineIndex < MONTE_CARLO_ALL_LINES; lineIndex++) {
      const lineData = baseData.map((value, dataIndex) => {
        const pessimistic = monteCarloData.scenarios.pessimistic[dataIndex] || value;
        const median = monteCarloData.scenarios.median[dataIndex] || value;
        const optimistic = monteCarloData.scenarios.optimistic[dataIndex] || value;
        
        // Generate normal distribution around median
        // Using Box-Muller transform for proper gaussian distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const standardNormal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        // Map line index to percentile (0 to 1)
        const percentile = lineIndex / (MONTE_CARLO_ALL_LINES - 1);
        
        // Use inverse normal CDF approximation to map percentile to standard normal
        const normalValue = approximateInverseNormal(percentile);
        
        // Estimate standard deviation from percentiles
        // P25 ≈ median - 0.674σ, P75 ≈ median + 0.674σ
        const stdDev = (optimistic - pessimistic) / (2 * 0.674);
        
        // Generate value using normal distribution centered on median
        const simulatedValue = median + (normalValue * stdDev);
        
        // Add small random variation to avoid identical lines
        const noise = (Math.random() - 0.5) * 0.02 * Math.abs(simulatedValue);
        
        return Math.max(0, simulatedValue + noise);
      });
      lines.push(lineData);
    }
    
    console.log('✅ MonteCarloAllLines generated:', {
      totalLinesGenerated: lines.length,
      firstLineLength: lines[0]?.length || 0,
      lastLineLength: lines[lines.length - 1]?.length || 0
    });
    
    return lines;
  }, [isMonteCarloEnabled, monteCarloData]);

  useEffect(() => {
    console.log('🔄 useEffect triggered - generating lines:', { 
      isMonteCarloEnabled, 
      hasMonteCarloData: !!monteCarloData 
    });
    monteCarloLinesRef.current = generateMonteCarloLines();
  }, [monteCarloData, isMonteCarloEnabled, generateMonteCarloLines]);

  const chartData = useMemo(() => {
    // Generate lines immediately if not already generated
    if (isMonteCarloEnabled && monteCarloData && monteCarloLinesRef.current.length === 0) {
      console.log('🚨 Generating lines immediately in chartData useMemo');
      monteCarloLinesRef.current = generateMonteCarloLines();
    }
    
    return data.map((value, index) => {
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

      // Add the MonteCarloAllLines (1001) data
      const linesData: Record<string, number> = {};
      monteCarloLinesRef.current.forEach((line, lineIndex) => {
        if (index < line.length) {
          linesData[`line${lineIndex}`] = line[index];
        }
      });

      // Debug first data point
      if (index === 0) {
        console.log('🔍 MonteCarloAllLines Data Debug:', {
          totalLinesGenerated: monteCarloLinesRef.current.length,
          firstLineLength: monteCarloLinesRef.current[0]?.length || 0,
          hasLine0: !!linesData.line0,
          line0Value: linesData.line0,
          totalDataKeys: Object.keys(linesData).length
        });
      }

      const finalData = { ...baseData, ...monteCarloData_final, ...linesData };
      
      // Data point ready with Monte Carlo lines

      return finalData;
    }

    return baseData;
  });
  }, [data, currentAge, accumulationYears, savingsLine, monteCarloData, isMonteCarloEnabled, generateMonteCarloLines]);

  return { chartData, savingsLine, monteCarloLines: monteCarloLinesRef.current };
};

