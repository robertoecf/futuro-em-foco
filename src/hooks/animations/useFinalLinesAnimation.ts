import { useEffect } from 'react';

/**
 * Hook para lidar com animação das linhas finais após o cálculo.
 * @param isCalculated boolean - indica se o cálculo foi realizado
 * @param onShowFinalLines? callback opcional chamado quando as linhas finais devem ser exibidas
 */
export function useFinalLinesAnimation(isCalculated: boolean, onShowFinalLines?: () => void) {
  useEffect(() => {
    if (isCalculated && onShowFinalLines) {
      onShowFinalLines();
    }
  }, [isCalculated, onShowFinalLines]);
}
