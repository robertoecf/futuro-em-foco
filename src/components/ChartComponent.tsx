import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart } from 'recharts';
import { MonteCarloResult } from '@/lib/utils';
import { CustomTooltip } from './chart/CustomTooltip';
import { ChartControls } from './chart/ChartControls';
import { ChartInfo } from './chart/ChartInfo';
import { ExportButton } from './chart/ExportButton';
import { calculatePossibleRetirementAge, formatYAxis } from './chart/chartUtils';
import { InvestorProfile, CalculationResult } from '@/components/calculator/useCalculator';
import { useState, useEffect } from 'react';

interface ChartComponentProps {
  data: number[];
  accumulationYears: number;
  lifeExpectancy: number;
  currentAge: number;
  monthlyIncomeTarget?: number;
  portfolioReturn?: number;
  onLifeExpectancyChange?: (value: number) => void;
  showLifeExpectancyControl?: boolean;
  monteCarloData?: MonteCarloResult | null;
  isCalculating?: boolean;
  isMonteCarloEnabled?: boolean;
  onMonteCarloToggle?: (enabled: boolean) => void;
  initialAmount?: number;
  monthlyAmount?: number;
  retirementAge?: number;
  retirementIncome?: number;
  investorProfile?: InvestorProfile;
  calculationResult?: CalculationResult | null;
}

export const ChartComponent = ({ 
  data, 
  accumulationYears, 
  lifeExpectancy = 100,
  currentAge = 30,
  monthlyIncomeTarget = 0,
  portfolioReturn = 4,
  onLifeExpectancyChange,
  showLifeExpectancyControl = true,
  monteCarloData,
  isCalculating = false,
  isMonteCarloEnabled = false,
  onMonteCarloToggle,
  initialAmount = 0,
  monthlyAmount = 0,
  retirementAge = 65,
  retirementIncome = 0,
  investorProfile = 'moderado',
  calculationResult = null
}: ChartComponentProps) => {
  const [animationPhase, setAnimationPhase] = useState<'initial' | 'projecting' | 'paths' | 'consolidating' | 'final'>('initial');
  const [visiblePaths, setVisiblePaths] = useState<number[]>([]);
  const [pathOpacities, setPathOpacities] = useState<Record<number, number>>({});

  console.log('ChartComponent data:', data);
  console.log('ChartComponent Monte Carlo data:', monteCarloData);

  // Reset animation when Monte Carlo starts
  useEffect(() => {
    if (isCalculating && isMonteCarloEnabled) {
      setAnimationPhase('projecting');
      setVisiblePaths([]);
      setPathOpacities({});
      
      // After 2 seconds, start showing paths
      const timer1 = setTimeout(() => {
        if (monteCarloData) {
          setAnimationPhase('paths');
          // Generate 50 random paths for visual effect
          const pathsToShow = Array.from({ length: 50 }, (_, i) => i);
          setVisiblePaths(pathsToShow);
          
          // Initialize all paths with full opacity
          const initialOpacities: Record<number, number> = {};
          pathsToShow.forEach(path => {
            initialOpacities[path] = 1;
          });
          setPathOpacities(initialOpacities);
          
          // After 3 seconds showing all paths, start consolidating
          const timer2 = setTimeout(() => {
            setAnimationPhase('consolidating');
            
            // Fade out paths gradually over 2 seconds
            const fadeInterval = setInterval(() => {
              setPathOpacities(prev => {
                const newOpacities = { ...prev };
                let allFaded = true;
                
                pathsToShow.forEach(path => {
                  if (newOpacities[path] > 0) {
                    newOpacities[path] = Math.max(0, newOpacities[path] - 0.05);
                    if (newOpacities[path] > 0) allFaded = false;
                  }
                });
                
                if (allFaded) {
                  clearInterval(fadeInterval);
                  setAnimationPhase('final');
                }
                
                return newOpacities;
              });
            }, 50);
          }, 3000);
        }
      }, 2000);
    } else if (!isCalculating) {
      setAnimationPhase('final');
    }
  }, [isCalculating, isMonteCarloEnabled, monteCarloData]);

  // Generate random colors for paths
  const generatePathColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#FC427B', '#1DD1A1', '#3742FA', '#2F3542', '#FF5722',
      '#009688', '#673AB7', '#E91E63', '#795548', '#607D8B'
    ];
    return colors[index % colors.length];
  };

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

  const savingsLine = calculateSavingsLine();

  // Generate random path data for animation
  const generateRandomPaths = () => {
    if (!monteCarloData || animationPhase !== 'paths') return [];
    
    const paths = [];
    const baseData = monteCarloData.scenarios.median;
    
    for (let pathIndex = 0; pathIndex < 50; pathIndex++) {
      const pathData = baseData.map((value, index) => {
        // Add random variation to create visual diversity
        const variation = (Math.random() - 0.5) * 0.4 * value;
        return Math.max(0, value + variation);
      });
      paths.push(pathData);
    }
    
    return paths;
  };

  const randomPaths = generateRandomPaths();

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

    // Add random paths data for animation phase
    if (animationPhase === 'paths' || animationPhase === 'consolidating') {
      const pathsData: Record<string, number> = {};
      randomPaths.forEach((path, pathIndex) => {
        if (index < path.length) {
          pathsData[`path${pathIndex}`] = path[index];
        }
      });
      return { ...baseData, ...pathsData };
    }

    return baseData;
  });

  const possibleRetirementAge = calculatePossibleRetirementAge(
    data,
    monthlyIncomeTarget,
    portfolioReturn,
    currentAge,
    accumulationYears
  );
  
  // Calculate perpetuity wealth based on retirement return and desired income
  const perpetuityWealth = monthlyIncomeTarget > 0 ? 
    (monthlyIncomeTarget * 12) / (portfolioReturn / 100) : 0;

  // Show projecting message
  if (animationPhase === 'projecting') {
    return (
      <div className="w-full">
        <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Projetando futuros possíveis...</h3>
            <p className="text-gray-600">Analisando mil cenários diferentes baseados em risco e volatilidade</p>
          </div>
        </div>
        
        {/* Controls Section */}
        {(showLifeExpectancyControl || onMonteCarloToggle) && (
          <ChartControls
            lifeExpectancy={lifeExpectancy}
            possibleRetirementAge={possibleRetirementAge}
            isMonteCarloEnabled={isMonteCarloEnabled}
            onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
            onMonteCarloToggle={onMonteCarloToggle || (() => {})}
          />
        )}
      </div>
    );
  }

  const planningInputs = {
    initialAmount,
    monthlyAmount,
    currentAge,
    retirementAge,
    lifeExpectancy,
    retirementIncome,
    portfolioReturn,
    investorProfile
  };

  return (
    <div className="w-full">
      {/* Chart Section */}
      <div className="relative h-[400px] w-full bg-white border border-gray-200 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="age" 
              label={{ value: 'Idade', position: 'insideBottom', offset: -10 }}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              width={80}
            />
            <Tooltip content={<CustomTooltip monteCarloData={monteCarloData} />} />
            
            {/* Reference line for possible retirement age */}
            <ReferenceLine 
              x={possibleRetirementAge} 
              stroke="#9CA3AF" 
              strokeDasharray="5 5" 
              label={{ 
                value: 'Idade de Aposentadoria', 
                position: 'top', 
                fill: '#6B7280',
                fontSize: 11
              }} 
            />
            
            {/* Reference line for perpetuity wealth */}
            {perpetuityWealth > 0 && (
              <ReferenceLine 
                y={perpetuityWealth} 
                stroke="#9CA3AF" 
                strokeDasharray="8 4" 
                label={{ 
                  value: 'Patrimônio Perpetuidade', 
                  position: 'insideTopRight', 
                  fill: '#6B7280',
                  fontSize: 11
                }} 
              />
            )}

            {/* Savings line - gray continuous line */}
            <Line 
              type="monotone" 
              dataKey="poupanca" 
              name="Total Poupado"
              stroke="#6B7280" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, stroke: '#6B7280', strokeWidth: 2, fill: '#fff' }}
            />

            {/* Animation phase: Show all random paths */}
            {(animationPhase === 'paths' || animationPhase === 'consolidating') && (
              <>
                {visiblePaths.map((pathIndex) => (
                  <Line
                    key={`path${pathIndex}`}
                    type="monotone"
                    dataKey={`path${pathIndex}`}
                    stroke={generatePathColor(pathIndex)}
                    strokeWidth={1}
                    strokeOpacity={pathOpacities[pathIndex] || 0}
                    dot={false}
                    activeDot={false}
                    connectNulls
                  />
                ))}
              </>
            )}

            {/* Final phase: Show Monte Carlo results or main patrimonio line */}
            {animationPhase === 'final' && (
              <>
                {monteCarloData ? (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="optimistic" 
                      name="Cenário Otimista"
                      stroke="#10B981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="median" 
                      name="Cenário Neutro"
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pessimistic" 
                      name="Cenário Pessimista"
                      stroke="#DC2626" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }}
                    />
                  </>
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey="patrimonio" 
                    name="Patrimônio"
                    stroke="#FF6B00" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 8, stroke: '#FF6B00', strokeWidth: 2, fill: '#fff' }}
                    connectNulls
                  />
                )}
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Export Button - positioned at bottom right of chart */}
        <div className="absolute bottom-4 right-4">
          <ExportButton
            chartData={chartData}
            planningInputs={planningInputs}
            calculationResult={calculationResult}
          />
        </div>
      </div>

      {/* Controls Section - Now below the chart */}
      {(showLifeExpectancyControl || onMonteCarloToggle) && (
        <ChartControls
          lifeExpectancy={lifeExpectancy}
          possibleRetirementAge={possibleRetirementAge}
          isMonteCarloEnabled={isMonteCarloEnabled}
          onLifeExpectancyChange={onLifeExpectancyChange || (() => {})}
          onMonteCarloToggle={onMonteCarloToggle || (() => {})}
        />
      )}
      
      {/* Information Section */}
      <ChartInfo
        monteCarloData={monteCarloData}
        perpetuityWealth={perpetuityWealth}
        possibleRetirementAge={possibleRetirementAge}
      />
    </div>
  );
};
