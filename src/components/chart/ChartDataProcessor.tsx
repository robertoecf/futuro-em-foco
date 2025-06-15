
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

  // Generate animated paths based on Monte Carlo data
  const generateAnimatedPaths = () => {
    // Only generate when we have Monte Carlo data AND we're in animation phases
    if (!monteCarloData || (animationPhase !== 'paths' && animationPhase !== 'consolidating')) {
      console.log('🚫 Not generating paths - wrong conditions:', {
        hasMonteCarloData: !!monteCarloData,
        animationPhase
      });
      return [];
    }
    
    console.log('🎨 Generating 50 animated paths based on Monte Carlo data');
    const paths = [];
    const baseData = monteCarloData.scenarios.median;
    
    // Generate 50 varied paths based on the Monte Carlo scenarios
    for (let pathIndex = 0; pathIndex < 50; pathIndex++) {
      const pathData = baseData.map((value, dataIndex) => {
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
      paths.push(pathData);
    }
    
    console.log('✅ Generated', paths.length, 'animated paths');
    return paths;
  };

  const savingsLine = calculateSavingsLine();
  const animatedPaths = generateAnimatedPaths();

  console.log('📊 ChartDataProcessor state:', {
    animationPhase,
    visiblePathsCount: visiblePaths.length,
    animatedPathsGenerated: animatedPaths.length,
    hasMonteCarloData: !!monteCarloData,
    shouldIncludePathsInData: animatedPaths.length > 0
  });

  const chartData = data.map((value, index) => {
    const age = currentAge + index;
    const baseData = {
      age,
      patrimonio: value,
      poupanca: savingsLine[index] || 0,
      fase: age < (currentAge + accumulationYears) ? "Acumulação" : "Aposentadoria"
    };

    // Add Monte Carlo final results in final phase
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

    // Add animated paths data during animation phases
    if (animatedPaths.length > 0 && (animationPhase === 'paths' || animationPhase === 'consolidating')) {
      const pathsData: Record<string, number> = {};
      
      // Include ALL 50 paths in chartData (they will be controlled by opacity)
      animatedPaths.forEach((path, pathIndex) => {
        if (index < path.length) {
          pathsData[`path${pathIndex}`] = path[index];
        }
      });
      
      if (index < 3) {
        console.log(`🔍 Data point ${index} includes ${Object.keys(pathsData).length} paths`);
      }
      
      return { ...baseData, ...pathsData };
    }

    return baseData;
  });

  // Final verification
  if (animatedPaths.length > 0 && chartData.length > 0) {
    const pathKeys = Object.keys(chartData[0]).filter(key => key.startsWith('path'));
    console.log('✅ Chart data verification:', {
      pathKeysInData: pathKeys.length,
      expectedPaths: 50,
      success: pathKeys.length === 50
    });
  }

  return { chartData, savingsLine, animatedPaths };
};
