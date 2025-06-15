
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
    if (!monteCarloData || (animationPhase !== 'paths' && animationPhase !== 'consolidating')) {
      console.log('❌ Not generating random paths:', { 
        hasMonteCarloData: !!monteCarloData, 
        animationPhase,
        shouldGenerate: animationPhase === 'paths' || animationPhase === 'consolidating'
      });
      return [];
    }
    
    console.log('🎨 Generating random paths for animation...');
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
    
    console.log('✅ Generated', paths.length, 'random paths');
    return paths;
  };

  const savingsLine = calculateSavingsLine();
  const randomPaths = generateRandomPaths();

  console.log('📊 ChartDataProcessor state:', {
    animationPhase,
    visiblePathsCount: visiblePaths.length,
    randomPathsCount: randomPaths.length,
    hasMonteCarloData: !!monteCarloData,
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

    // Add random paths data for animation phase - ALWAYS include all paths, control visibility via opacity
    if ((animationPhase === 'paths' || animationPhase === 'consolidating') && randomPaths.length > 0) {
      const pathsData: Record<string, number> = {};
      randomPaths.forEach((path, pathIndex) => {
        if (index < path.length) {
          pathsData[`path${pathIndex}`] = path[index];
        }
      });
      
      // Debug: Log how many paths we're adding to the first data point
      if (index === 0) {
        console.log('🔍 Adding paths to chartData:', {
          pathCount: Object.keys(pathsData).length,
          samplePaths: Object.keys(pathsData).slice(0, 5),
          visiblePathsCount: visiblePaths.length
        });
      }
      
      return { ...baseData, ...pathsData };
    }

    return baseData;
  });

  // Debug: Check if paths are in the final chartData
  if ((animationPhase === 'paths' || animationPhase === 'consolidating') && chartData.length > 0) {
    const firstDataPoint = chartData[0];
    const pathKeys = Object.keys(firstDataPoint).filter(key => key.startsWith('path'));
    console.log('📈 Final chartData contains paths:', {
      pathKeysCount: pathKeys.length,
      sampleKeys: pathKeys.slice(0, 5),
      firstDataPoint: Object.keys(firstDataPoint)
    });
  }

  return { chartData, savingsLine, randomPaths };
};
