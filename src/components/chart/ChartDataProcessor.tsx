
import { useMemo, useRef, useEffect } from 'react';
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

  const monteCarloLinesRef = useRef<number[][]>([]);

  useEffect(() => {
    if (!isMonteCarloEnabled || !monteCarloData) {
      monteCarloLinesRef.current = [];
      return;
    }

    console.log('🎨 Generating 50 Monte Carlo lines');
    const lines = [] as number[][];
    const baseData = monteCarloData.scenarios.median;

    for (let lineIndex = 0; lineIndex < 50; lineIndex++) {
      const lineData = baseData.map((value, dataIndex) => {
        const pessimistic = monteCarloData.scenarios.pessimistic[dataIndex] || value;
        const optimistic = monteCarloData.scenarios.optimistic[dataIndex] || value;
        const randomFactor = Math.random();
        const interpolated = pessimistic + (optimistic - pessimistic) * randomFactor;
        const noise = (Math.random() - 0.5) * 0.1 * value;

        return Math.max(0, interpolated + noise);
      });
      lines.push(lineData);
    }

    console.log('✅ Generated', lines.length, 'Monte Carlo lines');
    monteCarloLinesRef.current = lines;
  }, [isMonteCarloEnabled, monteCarloData]);

  const monteCarloLines = monteCarloLinesRef.current;

  console.log('📊 ChartDataProcessor:', {
    isMonteCarloEnabled,
    hasMonteCarloData: !!monteCarloData,
    monteCarloLinesGenerated: monteCarloLines.length
  });

  const chartData = useMemo(() => data.map((value, index) => {
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
  }), [data, currentAge, accumulationYears, monteCarloData, savingsLine, monteCarloLines]);

  return { chartData, savingsLine, monteCarloLines };
};
