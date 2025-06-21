import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface MagicMomentDebugPanelProps {
  animationPhase: string;
  isShowingLines: boolean;
  isShowing50Lines: boolean;
  isDrawingFinalLines: boolean;
  monteCarloData: any;
  getDebugReport?: () => any[];
}

export const MagicMomentDebugPanel: React.FC<MagicMomentDebugPanelProps> = ({
  animationPhase,
  isShowingLines,
  isShowing50Lines,
  isDrawingFinalLines,
  monteCarloData,
  getDebugReport
}) => {
  const [debugLog, setDebugLog] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Atualizar log de debug
  useEffect(() => {
    if (getDebugReport) {
      const report = getDebugReport();
      setDebugLog(report);
    }
  }, [animationPhase, isShowingLines, isShowing50Lines, isDrawingFinalLines, getDebugReport]);

  // Auto-mostrar durante desenvolvimento
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && animationPhase !== 'final') {
      setIsVisible(true);
    }
  }, [animationPhase]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          🔍 Debug Momento Mágico
        </button>
      </div>
    );
  }

  const getPhaseEmoji = (phase: string) => {
    switch (phase) {
      case 'projecting': return '⏳';
      case 'paths': return '📊';
      case 'optimizing': return '⚡';
      case 'drawing-final': return '✨';
      case 'final': return '✅';
      default: return '❓';
    }
  };

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case 'projecting': return 'Calculando cenários...';
      case 'paths': return 'Exibindo 500 linhas';
      case 'optimizing': return 'Mostrando 50 linhas';
      case 'drawing-final': return 'Desenhando 3 linhas finais';
      case 'final': return 'Completo';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="p-4 bg-black/90 text-white border-orange-500">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-orange-400">🔍 Magic Moment Debug</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Status Atual */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getPhaseEmoji(animationPhase)}</span>
            <div>
              <div className="font-semibold text-orange-300">
                Fase: {animationPhase.toUpperCase()}
              </div>
              <div className="text-sm text-gray-300">
                {getPhaseDescription(animationPhase)}
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores Visuais */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className={`p-2 rounded text-center text-xs ${
            isShowingLines ? 'bg-green-600' : 'bg-gray-700'
          }`}>
            500 Linhas
            <div className="font-bold">{isShowingLines ? 'ON' : 'OFF'}</div>
          </div>
          
          <div className={`p-2 rounded text-center text-xs ${
            isShowing50Lines ? 'bg-blue-600' : 'bg-gray-700'
          }`}>
            50 Linhas
            <div className="font-bold">{isShowing50Lines ? 'ON' : 'OFF'}</div>
          </div>
          
          <div className={`p-2 rounded text-center text-xs ${
            isDrawingFinalLines ? 'bg-purple-600' : 'bg-gray-700'
          }`}>
            3 Linhas Finais
            <div className="font-bold">{isDrawingFinalLines ? 'ON' : 'OFF'}</div>
          </div>
          
          <div className={`p-2 rounded text-center text-xs ${
            monteCarloData ? 'bg-orange-600' : 'bg-gray-700'
          }`}>
            Dados MC
            <div className="font-bold">{monteCarloData ? 'READY' : 'WAITING'}</div>
          </div>
        </div>

        {/* Verificações de Integridade */}
        <div className="space-y-1 mb-4">
          <div className="text-sm font-semibold text-yellow-400">✅ Verificações:</div>
          
          <div className={`text-xs flex items-center ${
            (animationPhase === 'paths' && isShowingLines) ? 'text-green-400' : 'text-red-400'
          }`}>
            • Fase 'paths' → 500 linhas: {
              (animationPhase === 'paths' && isShowingLines) ? '✅' : '❌'
            }
          </div>
          
          <div className={`text-xs flex items-center ${
            (animationPhase === 'optimizing' && isShowing50Lines) ? 'text-green-400' : 'text-red-400'
          }`}>
            • Fase 'optimizing' → 50 linhas: {
              (animationPhase === 'optimizing' && isShowing50Lines) ? '✅' : '❌'
            }
          </div>
          
          <div className={`text-xs flex items-center ${
            (animationPhase === 'drawing-final' && isDrawingFinalLines) ? 'text-green-400' : 'text-red-400'
          }`}>
            • Fase 'drawing-final' → 3 linhas: {
              (animationPhase === 'drawing-final' && isDrawingFinalLines) ? '✅' : '❌'
            }
          </div>
        </div>

        {/* Log de Checkpoints */}
        {debugLog.length > 0 && (
          <div className="max-h-32 overflow-y-auto">
            <div className="text-sm font-semibold text-blue-400 mb-2">📋 Últimos Checkpoints:</div>
            {debugLog.slice(-3).map((checkpoint, index) => (
              <div key={index} className="text-xs bg-gray-800 p-2 rounded mb-1">
                <div className="font-semibold text-green-400">{checkpoint.step}</div>
                <div className="text-gray-300">
                  Fase: {checkpoint.phase} | Dados: {checkpoint.dataReady ? '✅' : '❌'} | 
                  Linhas: {checkpoint.linesVisible ? '✅' : '❌'}
                </div>
                {checkpoint.details.message && (
                  <div className="text-orange-300 italic">{checkpoint.details.message}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botão para Ver Relatório Completo */}
        <button
          onClick={() => {
            if (getDebugReport) {
              console.log('📋 RELATÓRIO COMPLETO MOMENTO MÁGICO:', getDebugReport());
            }
          }}
          className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
        >
          📋 Ver Relatório Completo no Console
        </button>
      </Card>
    </div>
  );
}; 