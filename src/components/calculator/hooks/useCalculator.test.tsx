/**
 * 🎯 FASE 4 ITEM 7: Testes unitários para o hook useCalculator
 * Testando integração e comportamento do hook principal da calculadora
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCalculator } from './useCalculator';

// Mock das dependências
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value) // Retorna o valor imediatamente para testes
}));

vi.mock('@/lib/utils', () => ({
  calculateFullProjection: vi.fn(() => ({
    retirementAmount: 1000000,
    yearlyValues: [100000, 200000, 300000],
    monthlyIncome: 5000
  }))
}));

vi.mock('@/lib/gbm/ultraOptimizedSimulation', () => ({
  runUltraOptimizedMonteCarloSimulation: vi.fn(() => Promise.resolve({
    scenarios: [[100000, 200000, 300000]],
    statistics: {
      mean: 200000,
      p5: 150000,
      p95: 250000
    }
  }))
}));

vi.mock('@/lib/calculations/financialCalculations', () => ({
  getAccumulationAnnualReturn: vi.fn(() => 0.055),
  getVolatilityByProfile: vi.fn(() => 0.15)
}));

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock da URL
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  },
  writable: true
});

// Mock do history
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn()
  },
  writable: true
});

describe('useCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Inicialização', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useCalculator());
      
      expect(result.current.initialAmount).toBeDefined();
      expect(result.current.monthlyAmount).toBeDefined();
      expect(result.current.currentAge).toBeDefined();
      expect(result.current.retirementAge).toBeDefined();
      expect(result.current.lifeExpectancy).toBeDefined();
      expect(result.current.retirementIncome).toBeDefined();
      expect(result.current.portfolioReturn).toBeDefined();
      expect(result.current.investorProfile).toBeDefined();
    });

    it('deve calcular anos de acumulação corretamente', () => {
      const { result } = renderHook(() => useCalculator());
      
      const expectedYears = result.current.retirementAge - result.current.currentAge;
      expect(result.current.accumulationYears).toBe(expectedYears);
    });

    it('deve inicializar Monte Carlo como desabilitado', () => {
      const { result } = renderHook(() => useCalculator());
      
      expect(result.current.isMonteCarloEnabled).toBe(false);
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.monteCarloResult).toBeNull();
    });
  });

  describe('Handlers de Input', () => {
    it('deve atualizar valor inicial corretamente', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleInitialAmountBlur('50000');
      });
      
      expect(result.current.initialAmount).toBe(50000);
    });

    it('deve atualizar aporte mensal corretamente', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleMonthlyAmountBlur('2000');
      });
      
      expect(result.current.monthlyAmount).toBe(2000);
    });

    it('deve atualizar idade atual e ajustar idade de aposentadoria se necessário', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleCurrentAgeBlur('40');
      });
      
      expect(result.current.currentAge).toBe(40);
      
      // Se idade atual >= idade aposentadoria, deve ajustar
      if (result.current.retirementAge <= 40) {
        expect(result.current.retirementAge).toBe(41);
      }
    });

    it('deve atualizar idade de aposentadoria corretamente', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleCurrentAgeBlur('30');
      });
      
      act(() => {
        result.current.handleRetirementAgeBlur('65');
      });
      
      expect(result.current.retirementAge).toBe(65);
    });

    it('deve atualizar expectativa de vida', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleLifeExpectancyChange(85);
      });
      
      expect(result.current.lifeExpectancy).toBe(85);
    });

    it('deve atualizar renda desejada', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleRetirementIncomeBlur('8000');
      });
      
      expect(result.current.retirementIncome).toBe(8000);
    });

    it('deve atualizar retorno do portfólio', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handlePortfolioReturnBlur('7');
      });
      
      expect(result.current.portfolioReturn).toBe(7);
    });

    it('deve atualizar perfil do investidor', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleInvestorProfileChange('arrojado');
      });
      
      expect(result.current.investorProfile).toBe('arrojado');
    });
  });

  describe('Monte Carlo', () => {
    it('deve ativar Monte Carlo corretamente', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleMonteCarloToggle(true);
      });
      
      expect(result.current.isMonteCarloEnabled).toBe(true);
      expect(result.current.isCalculating).toBe(true);
    });

    it('deve desativar Monte Carlo e limpar resultados', () => {
      const { result } = renderHook(() => useCalculator());
      
      // Primeiro ativa
      act(() => {
        result.current.handleMonteCarloToggle(true);
      });
      
      // Depois desativa
      act(() => {
        result.current.handleMonteCarloToggle(false);
      });
      
      expect(result.current.isMonteCarloEnabled).toBe(false);
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.monteCarloResult).toBeNull();
    });

    it('deve finalizar cálculo corretamente', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleMonteCarloToggle(true);
      });
      
      act(() => {
        result.current.finishCalculation();
      });
      
      expect(result.current.isCalculating).toBe(false);
    });
  });

  describe('Validações de Input', () => {
    it('deve lidar com inputs inválidos no valor inicial', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleInitialAmountBlur('abc');
      });
      
      expect(result.current.initialAmount).toBe(0);
    });

    it('deve lidar com inputs inválidos no aporte mensal', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleMonthlyAmountBlur('xyz');
      });
      
      expect(result.current.monthlyAmount).toBe(0);
    });

    it('deve ignorar idade atual inválida', () => {
      const { result } = renderHook(() => useCalculator());
      const initialAge = result.current.currentAge;
      
      act(() => {
        result.current.handleCurrentAgeBlur('0');
      });
      
      expect(result.current.currentAge).toBe(initialAge); // Não deve mudar
    });

    it('deve ignorar idade de aposentadoria menor que idade atual', () => {
      const { result } = renderHook(() => useCalculator());
      
      act(() => {
        result.current.handleCurrentAgeBlur('40');
      });
      
      const initialRetirementAge = result.current.retirementAge;
      
      act(() => {
        result.current.handleRetirementAgeBlur('35'); // Menor que idade atual
      });
      
      expect(result.current.retirementAge).toBe(initialRetirementAge); // Não deve mudar
    });

    it('deve ignorar retorno do portfólio inválido', () => {
      const { result } = renderHook(() => useCalculator());
      const initialReturn = result.current.portfolioReturn;
      
      act(() => {
        result.current.handlePortfolioReturnBlur('0');
      });
      
      expect(result.current.portfolioReturn).toBe(initialReturn); // Não deve mudar
    });
  });

  describe('Idade Possível de Aposentadoria', () => {
    it('deve calcular idade possível de aposentadoria', () => {
      const { result } = renderHook(() => useCalculator());
      
      expect(result.current.possibleRetirementAge).toBeGreaterThan(result.current.currentAge);
      expect(typeof result.current.possibleRetirementAge).toBe('number');
    });
  });

  describe('Funcionalidades Avançadas', () => {
    it('deve manter consistência entre estado e handlers', () => {
      const { result } = renderHook(() => useCalculator());
      
      // Verifica se handlers existem e são funções
      expect(typeof result.current.handleInitialAmountBlur).toBe('function');
      expect(typeof result.current.handleMonteCarloToggle).toBe('function');
      expect(typeof result.current.finishCalculation).toBe('function');
      
      // Verifica se estado é consistente
      expect(result.current.accumulationYears).toBeGreaterThan(0);
      expect(result.current.possibleRetirementAge).toBeGreaterThan(result.current.currentAge);
    });
  });

  describe('Cálculo de Resultado', () => {
    it('deve ter resultado de cálculo após inicialização', () => {
      const { result } = renderHook(() => useCalculator());
      
      // O hook deve calcular automaticamente na inicialização
      expect(result.current.calculationResult).toBeDefined();
    });
  });
}); 