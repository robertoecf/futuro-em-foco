
interface ProjectingMessageProps {
  lifeExpectancy: number;
  possibleRetirementAge: number;
  isMonteCarloEnabled: boolean;
  onLifeExpectancyChange: (value: number) => void;
  onMonteCarloToggle: (enabled: boolean) => void;
  showLifeExpectancyControl: boolean;
}

export const ProjectingMessage = ({
  lifeExpectancy,
  possibleRetirementAge,
  isMonteCarloEnabled,
  onLifeExpectancyChange,
  onMonteCarloToggle,
  showLifeExpectancyControl
}: ProjectingMessageProps) => {
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
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Monte Carlo Toggle */}
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Simulação Probabilística | Método de Monte Carlo</h3>
                <p className="text-xs text-gray-500">
                  Mil cenários aleatórios baseados em risco e volatilidade
                </p>
              </div>
              <button
                className={`px-4 py-2 rounded text-sm font-medium ${
                  isMonteCarloEnabled 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => onMonteCarloToggle(!isMonteCarloEnabled)}
              >
                Calcular
              </button>
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
      )}
    </div>
  );
};
