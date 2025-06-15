
import { MonteCarloResult } from '@/lib/utils';
import { AnimationPhase } from './ChartAnimationStates';

interface ChartDataProcessorProps {
  data: number[];
  currentAge: number;
  accumulationYears: number;
  initialAmount: number;
  monthlyAmount: number;
  monthlyIncomeTarget: number;
  monteCarloData: MonteCarloResult | null;
  animationPhase: AnimationPhase;
  visiblePaths: number[];
}

export const useChartDataProcessor = ({
  data,
  currentAge,
  accumulationYears,
  initialAmount,
  monthlyAmount,
  monthlyIncomeTarget,
  monteCarloData,
  animationPhase,
  visiblePaths
}: ChartDataProcessorProps) => {
  
  // Calculate savings line (initial + monthly contributions - retirement withdrawals)
  const calculateSavingsLine = () => {
    const savingsData: number[] = [];
    let totalSaved = initialAmount;
    
    for (let year = 0; year <= data.length - 1; year++) {
      const age = currentAge + year;
      
      if (year === 0) {
        // First year - just initial amount
        savingsData.push(initialAmount);
      } else if (age <= (currentAge + accumulationYears)) {
        // Accumulation phase - add monthly contributions
        totalSaved += monthlyAmount * 12;
        savingsData.push(totalSaved);
      } else {
        // Retirement phase - subtract monthly income
        const monthlyIncome = monthlyIncomeTarget > 0 ? monthlyIncomeTarget : data[accumulationYears] * 0.004;
        totalSaved -= monthlyIncome * 12;
        savingsData.push(Math.max(0, totalSaved));
      }
    }
    
    return savingsData;
  };

  // Generate random path data for animation with better variation
  const generateRandomPaths = () => {
    // Generate paths for animation phases only
    if (animationPhase !== 'paths' && animationPhase !== 'consolidating') {
      console.log('🚫 generateRandomPaths: Wrong phase:', animationPhase);
      return [];
    }
    
    if (!monteCarloData) {
      console.log('🚫 generateRandomPaths: No Monte Carlo data available');
      return [];
    }
    
    console.log('🎨 generateRandomPaths: Creating 50 animated paths for phase:', animationPhase);
    const paths = [];
    const baseData = monteCarloData.scenarios.median;
    
    for (let pathIndex = 0; pathIndex < 50; pathIndex++) {
      const pathData = baseData.map((value, index) => {
        // Create more dramatic variation for visual effect
        const volatility = 0.3 + (Math.random() * 0.4); // 30% to 70% volatility
        const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
        const variation = value * volatility * randomFactor;
        
        // Add some growth trend variation
        const growthFactor = 1 + (index * 0.01 * Math.random());
        
        return Math.max(0, (value + variation) * growthFactor);
      });
      paths.push(pathData);
    }
    
    console.log('✅ generateRandomPaths: Generated', paths.length, 'paths with', paths[0]?.length, 'data points each');
    return paths;
  };

  const savingsLine = calculateSavingsLine();
  const randomPaths = generateRandomPaths();

  console.log('📊 ChartDataProcessor processing with:', {
    animationPhase,
    visiblePathsCount: visiblePaths.length,
    randomPathsGenerated: randomPaths.length,
    hasMonteCarloData: !!monteCarloData,
    dataLength: data.length,
    shouldIncludePaths: (animationPhase === 'paths' || animationPhase === 'consolidating') && randomPaths.length > 0
  });

  const chartData = data.map((value, index) => {
    const age = currentAge + index;
    const baseData = {
      age,
      patrimonio: value,
      poupanca: savingsLine[index] || 0,
      fase: age < (currentAge + accumulationYears) ? "Acumulação" : "Aposentadoria"
    };

    // Add Monte Carlo data if available and in final phase
    if (monteCarloData && animationPhase === 'final' && index < monteCarloData.scenarios.pessimistic.length) {
      return {
        ...baseData,
        pessimistic: monteCarloData.scenarios.pessimistic[index],
        median: monteCarloData.scenarios.median[index],
        optimistic: monteCarloData.scenarios.optimistic[index],
        percentile25: monteCarloData.statistics.percentile25[index],
        percentile75: monteCarloData.statistics.percentile75[index]
      };
    }

    // Add random paths data for animation phases - CRITICAL FIX
    if ((animationPhase === 'paths' || animationPhase === 'consolidating') && randomPaths.length > 0) {
      const pathsData: Record<string, number> = {};
      
      // Include ALL 50 paths in the data
      randomPaths.forEach((path, pathIndex) => {
        if (index < path.length) {
          pathsData[`path${pathIndex}`] = path[index];
        }
      });
      
      // Debug: Log for first few data points
      if (index < 3) {
        console.log(`🔍 Adding ${Object.keys(pathsData).length} paths to data point ${index}:`, {
          age,
          pathKeys: Object.keys(pathsData).slice(0, 5),
          sampleValues: Object.values(pathsData).slice(0, 5)
        });
      }
      
      return { ...baseData, ...pathsData };
    }

    return baseData;
  });

  // Final verification: Check if paths are actually in the chartData
  if ((animationPhase === 'paths' || animationPhase === 'consolidating') && chartData.length > 0) {
    const firstDataPoint = chartData[0];
    const pathKeys = Object.keys(firstDataPoint).filter(key => key.startsWith('path'));
    console.log('✅ FINAL VERIFICATION - chartData contains paths:', {
      pathKeysFound: pathKeys.length,
      expectedPaths: 50,
      firstFewPathKeys: pathKeys.slice(0, 5),
      allDataKeys: Object.keys(firstDataPoint),
      success: pathKeys.length === 50
    });
    
    if (pathKeys.length === 0) {
      console.error('❌ CRITICAL ERROR: No path data found in chartData despite being in animation phase!');
    }
  }

  return { chartData, savingsLine, randomPaths };
};
