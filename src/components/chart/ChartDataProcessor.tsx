import { useEffect, useRef, useCallback, useMemo } from 'react';
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

  // Generate 500 Monte Carlo lines when data is available
  const generateMonteCarloLines = useCallback(() => {
    if (!isMonteCarloEnabled || !monteCarloData) {
      console.log('🚫 NÃO GERANDO LINHAS MONTE CARLO:', { isMonteCarloEnabled, hasMonteCarloData: !!monteCarloData });
      return [];
    }
    
    console.log('🎲 GERANDO LINHAS MONTE CARLO:', {
      totalLines: LINE_ANIMATION.TOTAL_LINES,
      baseDataLength: monteCarloData.scenarios.median.length,
      pessimisticLength: monteCarloData.scenarios.pessimistic.length,
      optimisticLength: monteCarloData.scenarios.optimistic.length
    });
    
    const lines: number[][] = [];
    const baseData = monteCarloData.scenarios.median;
    
    // Generate 500 varied paths based on the Monte Carlo scenarios
    for (let lineIndex = 0; lineIndex < LINE_ANIMATION.TOTAL_LINES; lineIndex++) {
      const lineData = baseData.map((value, dataIndex) => {
        // Create variation between pessimistic and optimistic scenarios
        const pessimistic = monteCarloData.scenarios.pessimistic[dataIndex] || value;
        const optimistic = monteCarloData.scenarios.optimistic[dataIndex] || value;
        
        // Use a more sophisticated interpolation for 500 lines
        const t = lineIndex / (LINE_ANIMATION.TOTAL_LINES - 1);
        const randomFactor = Math.random() * 0.3 + 0.7; // Between 0.7 and 1.0
        
        // Create a distribution that clusters around the median
        const normalizedT = Math.pow(t, 2) * (t < 0.5 ? 1 : -1) + 0.5;
        const interpolated = pessimistic + (optimistic - pessimistic) * normalizedT;
        
        // Add controlled noise
        const noise = (Math.random() - 0.5) * 0.05 * value * randomFactor;
        
        return Math.max(0, interpolated + noise);
      });
      lines.push(lineData);
    }
    
    console.log('✅ LINHAS MONTE CARLO GERADAS:', {
      totalLinesGenerated: lines.length,
      firstLineLength: lines[0]?.length || 0,
      firstLineFirstValue: lines[0]?.[0] || 0,
      lastLineFirstValue: lines[lines.length - 1]?.[0] || 0
    });
    
    return lines;
  }, [isMonteCarloEnabled, monteCarloData]);

  useEffect(() => {
    monteCarloLinesRef.current = generateMonteCarloLines();
  }, [monteCarloData, isMonteCarloEnabled, generateMonteCarloLines]);

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

      // Add the 500 Monte Carlo lines data
      const linesData: Record<string, number> = {};
      monteCarloLinesRef.current.forEach((line, lineIndex) => {
        if (index < line.length) {
          linesData[`line${lineIndex}`] = line[index];
        }
      });

      const finalData = { ...baseData, ...monteCarloData_final, ...linesData };
      
      // 🔍 DEBUG: Log do primeiro ponto de dados para verificar se as linhas estão incluídas
      if (index === 0) {
        const finalDataAny = finalData as any;
        console.log('🎯 PRIMEIRO PONTO DE DADOS CHART:', {
          age: finalData.age,
          patrimonio: finalData.patrimonio,
          poupanca: finalData.poupanca,
          pessimistic: finalData.pessimistic,
          median: finalData.median,
          optimistic: finalData.optimistic,
          // Verificar se as linhas estão incluídas
          hasLine0: !!finalDataAny.line0,
          hasLine1: !!finalDataAny.line1,
          hasLine10: !!finalDataAny.line10,
          hasLine100: !!finalDataAny.line100,
          line0Value: finalDataAny.line0,
          line1Value: finalDataAny.line1,
          totalLinesIncluded: Object.keys(finalData).filter(key => key.startsWith('line')).length,
          totalMonteCarloLines: monteCarloLinesRef.current.length
        });
      }

      return finalData;
    }

    return baseData;
  }), [data, currentAge, accumulationYears, savingsLine, monteCarloData]);

  return { chartData, savingsLine, monteCarloLines: monteCarloLinesRef.current };
};
