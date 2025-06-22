interface ProjectingMessageProps {
  phase: 'projecting' | 'optimizing';
  lifeExpectancy: number;
  possibleRetirementAge: number;
  onLifeExpectancyChange: (value: number) => void;
  showLifeExpectancyControl: boolean;
}

export const ProjectingMessage = ({
  phase,
  lifeExpectancy,
  possibleRetirementAge,
  onLifeExpectancyChange,
  showLifeExpectancyControl
}: ProjectingMessageProps) => {
  const messages = {
    projecting: {
      title: "Calculando possíveis resultados...",
      subtitle: "Analisando mil cenários diferentes baseados em risco e volatilidade"
    },
    optimizing: {
      title: "Otimizando exibição...",
      subtitle: "Preparando visualização dos caminhos mais prováveis"
    }
  };

  const currentMessage = messages[phase];

  return (
    <div className="w-full">
      <div className="relative h-[400px] w-full bg-white/50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-black mb-2">{currentMessage.title}</h3>
          <p className="text-gray-800">{currentMessage.subtitle}</p>
        </div>
      </div>
      
      {/* Controls Section */}
      {showLifeExpectancyControl && (
                    <div className="bg-gray-50/50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Monte Carlo Toggle */}
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-sm font-medium text-black">Simulação Probabilística | Método de Monte Carlo</h3>
                <p className="text-xs text-gray-800">
                  {phase === 'projecting' ? 'Calculando mil cenários aleatórios...' : 'Otimizando visualização...'}
                </p>
              </div>
              <button
                className="px-4 py-2 rounded text-sm font-medium bg-orange-500 text-white cursor-not-allowed opacity-50"
                disabled
              >
                {phase === 'projecting' ? 'Calculando...' : 'Otimizando...'}
              </button>
            </div>

            {/* Life Expectancy Control */}
            <div className="flex items-center space-x-3">
              <label htmlFor="life-expectancy" className="text-sm font-medium text-black">
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
                <span className="text-sm text-gray-800">anos</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
