import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CalculationResult } from './types';
import type { MonteCarloResult } from '@/lib/utils';

interface ResultsCardsProps {
  calculationResult: CalculationResult | null;
  retirementAge: number;
  lifeExpectancy: number;
  initialAmount: number;
  monteCarloResult?: MonteCarloResult | null;
  isMonteCarloEnabled?: boolean;
  currentAge?: number;
  portfolioReturn?: number;
  showMonteCarloResults?: boolean;
}

// Memoized individual card components for better performance
const RetirementCard = memo(({ 
  finalAmount, 
  retirementAge 
}: { 
  finalAmount: number; 
  retirementAge: number; 
}) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Patrimônio na Aposentadoria</CardTitle>
      <Target className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-green-600">
        {formatCurrency(finalAmount)}
      </div>
      <p className="text-xs text-muted-foreground">
        Aos {retirementAge} anos
      </p>
    </CardContent>
  </Card>
));

const MonthlyIncomeCard = memo(({ 
  monthlyIncome, 
  currentAge, 
  lifeExpectancy 
}: { 
  monthlyIncome: number; 
  currentAge: number; 
  lifeExpectancy: number; 
}) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Renda Mensal Possível</CardTitle>
      <Calendar className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-blue-600">
        {formatCurrency(monthlyIncome)}
      </div>
      <p className="text-xs text-muted-foreground">
        Por {lifeExpectancy - currentAge} anos
      </p>
    </CardContent>
  </Card>
));

const AccumulationCard = memo(({ 
  initialAmount, 
  totalContributions, 
  retirementAge, 
  currentAge 
}: { 
  initialAmount: number; 
  totalContributions: number; 
  retirementAge: number; 
  currentAge: number; 
}) => {
  const totalInvested = useMemo(() => 
    initialAmount + totalContributions, 
    [initialAmount, totalContributions]
  );

  const yearsToRetirement = useMemo(() => 
    retirementAge - currentAge, 
    [retirementAge, currentAge]
  );

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
        <PiggyBank className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-600">
          {formatCurrency(totalInvested)}
        </div>
        <p className="text-xs text-muted-foreground">
          Em {yearsToRetirement} anos
        </p>
      </CardContent>
    </Card>
  );
});

const GrowthCard = memo(({ 
  finalAmount, 
  totalInvested, 
  portfolioReturn 
}: { 
  finalAmount: number; 
  totalInvested: number; 
  portfolioReturn: number; 
}) => {
  const totalGrowth = useMemo(() => 
    finalAmount - totalInvested, 
    [finalAmount, totalInvested]
  );

  const growthMultiplier = useMemo(() => 
    totalInvested > 0 ? finalAmount / totalInvested : 1, 
    [finalAmount, totalInvested]
  );

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Crescimento Total</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">
          {formatCurrency(totalGrowth)}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {growthMultiplier.toFixed(1)}x
          </Badge>
          <p className="text-xs text-muted-foreground">
            {portfolioReturn}% a.a.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

const MonteCarloSummaryCard = memo(({ 
  monteCarloResult 
}: { 
  monteCarloResult: MonteCarloResult; 
}) => {
  const successRate = useMemo(() => 
    (monteCarloResult.statistics.successProbability * 100),
    [monteCarloResult.statistics.successProbability]
  );

  const getBadgeVariant = useMemo(() => {
    if (successRate >= 80) return 'default';
    if (successRate >= 60) return 'secondary';
    return 'destructive';
  }, [successRate]);

  const getSuccessMessage = useMemo(() => {
    if (successRate >= 90) return 'Excelente probabilidade';
    if (successRate >= 80) return 'Boa probabilidade';
    if (successRate >= 60) return 'Probabilidade moderada';
    return 'Risco elevado';
  }, [successRate]);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-blue-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Análise Monte Carlo</CardTitle>
        <TrendingUp className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">
          {successRate.toFixed(1)}%
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <Badge variant={getBadgeVariant} className="text-xs">
            {getSuccessMessage}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Chance de atingir seus objetivos
        </p>
      </CardContent>
    </Card>
  );
});

// Main component with advanced memoization
export const ResultsCards = memo<ResultsCardsProps>(({
  calculationResult,
  retirementAge,
  lifeExpectancy,
  initialAmount,
  monteCarloResult = null,
  isMonteCarloEnabled = false,
  currentAge = 30,
  portfolioReturn = 4,
  showMonteCarloResults = false
}) => {
  // Memoized calculations to prevent recalculation on every render
  const { 
    finalAmount, 
    monthlyIncome, 
    totalContributions, 
    totalInvested 
  } = useMemo(() => {
    if (!calculationResult) {
      return {
        finalAmount: 0,
        monthlyIncome: 0,
        totalContributions: 0,
        totalInvested: initialAmount
      };
    }

    const years = retirementAge - currentAge;
    const totalContributions = years * 12 * (calculationResult.monthlyIncome || 0);
    
    return {
      finalAmount: calculationResult.finalAmount,
      monthlyIncome: calculationResult.monthlyIncome,
      totalContributions,
      totalInvested: initialAmount + totalContributions
    };
  }, [calculationResult, retirementAge, currentAge, initialAmount]);

  // Memoized card components array for better performance
  const baseCards = useMemo(() => [
    <RetirementCard 
      key="retirement"
      finalAmount={finalAmount} 
      retirementAge={retirementAge} 
    />,
    <MonthlyIncomeCard 
      key="income"
      monthlyIncome={monthlyIncome} 
      currentAge={currentAge}
      lifeExpectancy={lifeExpectancy} 
    />,
    <AccumulationCard 
      key="accumulation"
      initialAmount={initialAmount}
      totalContributions={totalContributions}
      retirementAge={retirementAge}
      currentAge={currentAge}
    />,
    <GrowthCard 
      key="growth"
      finalAmount={finalAmount}
      totalInvested={totalInvested}
      portfolioReturn={portfolioReturn}
    />
  ], [
    finalAmount, 
    retirementAge, 
    monthlyIncome, 
    currentAge, 
    lifeExpectancy, 
    initialAmount, 
    totalContributions, 
    totalInvested, 
    portfolioReturn
  ]);

  // Conditionally add Monte Carlo card only when needed
  const allCards = useMemo(() => {
    if (showMonteCarloResults && isMonteCarloEnabled && monteCarloResult) {
      return [
        ...baseCards,
        <MonteCarloSummaryCard 
          key="montecarlo"
          monteCarloResult={monteCarloResult} 
        />
      ];
    }
    return baseCards;
  }, [baseCards, showMonteCarloResults, isMonteCarloEnabled, monteCarloResult]);

  if (!calculationResult) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-white mb-4">
        Resultados da Simulação
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allCards}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-rendering
  return (
    prevProps.calculationResult?.finalAmount === nextProps.calculationResult?.finalAmount &&
    prevProps.calculationResult?.monthlyIncome === nextProps.calculationResult?.monthlyIncome &&
    prevProps.retirementAge === nextProps.retirementAge &&
    prevProps.lifeExpectancy === nextProps.lifeExpectancy &&
    prevProps.initialAmount === nextProps.initialAmount &&
    prevProps.isMonteCarloEnabled === nextProps.isMonteCarloEnabled &&
    prevProps.showMonteCarloResults === nextProps.showMonteCarloResults &&
    prevProps.currentAge === nextProps.currentAge &&
    prevProps.portfolioReturn === nextProps.portfolioReturn &&
    prevProps.monteCarloResult?.statistics.successProbability === nextProps.monteCarloResult?.statistics.successProbability
  );
});

// Display names for debugging
RetirementCard.displayName = 'RetirementCard';
MonthlyIncomeCard.displayName = 'MonthlyIncomeCard';
AccumulationCard.displayName = 'AccumulationCard';
GrowthCard.displayName = 'GrowthCard';
MonteCarloSummaryCard.displayName = 'MonteCarloSummaryCard';
ResultsCards.displayName = 'ResultsCards';
