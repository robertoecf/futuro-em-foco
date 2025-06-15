
import { Button } from '@/components/ui/button';

interface ChartControlsProps {
  lifeExpectancy: number;
  possibleRetirementAge: number;
  isMonteCarloEnabled: boolean;
  onLifeExpectancyChange: (value: number) => void;
  onMonteCarloToggle: (enabled: boolean) => void;
}

export const ChartControls = ({
  lifeExpectancy,
  possibleRetirementAge,
  isMonteCarloEnabled,
  onLifeExpectancyChange,
  onMonteCarloToggle
}: ChartControlsProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Monte Carlo Toggle */}
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Simulação Probabilística | Método de Monte Carlo</h3>
            <p className="text-xs text-gray-500">
              Três cenários baseados em risco e volatilidade
            </p>
          </div>
          <Button
            variant={isMonteCarloEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => onMonteCarloToggle(!isMonteCarloEnabled)}
            className={isMonteCarloEnabled ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            Calcular
          </Button>
        </div>

        {/* Life Expectancy Control */}
        <div className="flex items-center space-x-3">
          <label htmlFor="life-expectancy" className="text-sm font-medium text-gray-700">
            Expectativa de vida:
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="life-expectancy"
              type="number"
              value={lifeExpectancy}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  onLifeExpectancyChange(value);
                }
              }}
              className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium"
              min={possibleRetirementAge + 1}
            />
            <span className="text-sm text-gray-500">anos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
