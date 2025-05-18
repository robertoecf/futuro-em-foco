
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartComponent } from './ChartComponent';
import { formatCurrency, calculateFullProjection } from '@/lib/utils';

type InvestorProfile = 'conservador' | 'moderado' | 'arrojado';

interface CalculationResult {
  finalAmount: number;
  yearlyValues: number[];
  monthlyIncome: number;
}

const DEFAULT_INITIAL_AMOUNT = 15000;
const DEFAULT_MONTHLY_AMOUNT = 1000;
const DEFAULT_CURRENT_AGE = 30;
const DEFAULT_RETIREMENT_AGE = 65;
const DEFAULT_OBJECTIVE = 'aposentadoria';
const DEFAULT_LIFE_EXPECTANCY = 100;

export const Calculator = () => {
  const [initialAmount, setInitialAmount] = useState(DEFAULT_INITIAL_AMOUNT);
  const [monthlyAmount, setMonthlyAmount] = useState(DEFAULT_MONTHLY_AMOUNT);
  const [currentAge, setCurrentAge] = useState(DEFAULT_CURRENT_AGE);
  const [retirementAge, setRetirementAge] = useState(DEFAULT_RETIREMENT_AGE);
  const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULT_LIFE_EXPECTANCY);
  const [objective, setObjective] = useState(DEFAULT_OBJECTIVE);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>('moderado');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // Calculate accumulation years based on current and retirement age
  const accumulationYears = retirementAge - currentAge;
  
  // Taxa de retorno anual com base no perfil do investidor
  const getAnnualReturn = () => {
    switch (investorProfile) {
      case 'conservador': return 0.06; // 6% a.a.
      case 'moderado': return 0.09; // 9% a.a.
      case 'arrojado': return 0.12; // 12% a.a.
      default: return 0.09;
    }
  };
  
  const calculateProjection = () => {
    const annualReturn = getAnnualReturn();
    const monthlyIncomeRate = 0.004; // 0.4% de renda mensal
    
    const result = calculateFullProjection(
      initialAmount,
      monthlyAmount,
      accumulationYears,
      lifeExpectancy - currentAge, // Total years from current age to life expectancy
      annualReturn,
      monthlyIncomeRate
    );
    
    setCalculationResult({
      finalAmount: result.retirementAmount,
      yearlyValues: result.yearlyValues,
      monthlyIncome: result.monthlyIncome
    });
  };
  
  // Calcular projeção inicial na montagem do componente
  useEffect(() => {
    calculateProjection();
  }, []);

  const handleInitialAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    setInitialAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  const handleMonthlyAmountChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, ''));
    setMonthlyAmount(isNaN(numericValue) ? 0 : numericValue);
  };

  const handleCurrentAgeChange = (value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      setCurrentAge(numericValue);
      // If retirement age is less than or equal to current age, adjust it
      if (retirementAge <= numericValue) {
        setRetirementAge(numericValue + 1);
      }
    }
  };

  const handleRetirementAgeChange = (value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > currentAge) {
      setRetirementAge(numericValue);
    }
  };
  
  const handleLifeExpectancyChange = (value: number) => {
    setLifeExpectancy(value);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-6">Defina seus parâmetros</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger id="objective">
                    <SelectValue placeholder="Selecione um objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
                    <SelectItem value="preservar">Preservar Patrimônio</SelectItem>
                    <SelectItem value="usufruir">Usufruir do Patrimônio</SelectItem>
                    <SelectItem value="outro">Outro objetivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="current-age">Idade Atual</Label>
                <Input
                  id="current-age"
                  type="number"
                  value={currentAge}
                  onChange={(e) => handleCurrentAgeChange(e.target.value)}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retirement-age">Idade de Aposentadoria</Label>
                <Input
                  id="retirement-age"
                  type="number"
                  value={retirementAge}
                  onChange={(e) => handleRetirementAgeChange(e.target.value)}
                  min={currentAge + 1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initial-amount">Investimento Inicial (R$)</Label>
                <Input
                  id="initial-amount"
                  type="text"
                  value={formatCurrency(initialAmount)}
                  onChange={(e) => handleInitialAmountChange(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthly-amount">Aporte Mensal (R$)</Label>
                <Input
                  id="monthly-amount"
                  type="text"
                  value={formatCurrency(monthlyAmount)}
                  onChange={(e) => handleMonthlyAmountChange(e.target.value)}
                />
              </div>
              
              <Button className="w-full bg-black hover:bg-gray-800" onClick={calculateProjection}>
                Calcular Projeção
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6">Resultados da Projeção</h3>
            
            {calculationResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-500">Investimento inicial</p>
                    <p className="text-2xl font-bold">{formatCurrency(initialAmount)}</p>
                  </Card>
                  
                  <Card className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-500">Patrimônio na aposentadoria</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculationResult.finalAmount)}</p>
                  </Card>
                  
                  <Card className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-500">Renda mensal estimada</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculationResult.monthlyIncome)}</p>
                  </Card>
                  
                  <Card className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-500">Duração da renda</p>
                    <p className="text-2xl font-bold">{lifeExpectancy - retirementAge} anos</p>
                  </Card>
                </div>
                
                <div className="chart-container h-[400px]">
                  <ChartComponent 
                    data={calculationResult.yearlyValues} 
                    accumulationYears={accumulationYears}
                    lifeExpectancy={lifeExpectancy}
                    currentAge={currentAge}
                    onLifeExpectancyChange={handleLifeExpectancyChange} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
