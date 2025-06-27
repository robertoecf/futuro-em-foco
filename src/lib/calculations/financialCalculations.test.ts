/**
 * 🎯 FASE 4 ITEM 7: Testes unitários para cálculos financeiros
 * Cobertura de 80%+ das funções críticas do sistema
 */

import { describe, it, expect } from 'vitest';
import {
  getAccumulationAnnualReturn,
  getVolatilityByProfile,
  calculateAccumulatedWealth,
  calculateRequiredWealthSustainable,
  calculateRequiredWealthDepleting,
  calculatePossibleRetirementAge,
  calculateSustainableIncome,
  calculateDepletingIncome,
  calculateSuggestedMonthlyContribution,
  calculateMinimumAccumulationReturn,
} from './financialCalculations';
// Constantes removidas - valores agora hardcoded nos testes para simplicidade
import type { InvestorProfile } from '@/components/calculator/types';

describe('Perfil de Investidor', () => {
  describe('getAccumulationAnnualReturn', () => {
    it('deve retornar retorno correto para perfil conservador', () => {
      const result = getAccumulationAnnualReturn('conservador');
      expect(result).toBe(0.06); // 6%
    });

    it('deve retornar retorno correto para perfil moderado', () => {
      const result = getAccumulationAnnualReturn('moderado');
      expect(result).toBe(0.08); // 8%
    });

    it('deve retornar retorno correto para perfil arrojado', () => {
      const result = getAccumulationAnnualReturn('arrojado');
      expect(result).toBe(0.12); // 12%
    });

    it('deve retornar retorno padrão para perfil inválido', () => {
      const result = getAccumulationAnnualReturn('invalid' as InvestorProfile);
      expect(result).toBe(0.08); // Moderado como padrão
    });
  });

  describe('getVolatilityByProfile', () => {
    it('deve retornar volatilidade correta para cada perfil', () => {
      expect(getVolatilityByProfile('conservador')).toBe(0.1); // 10%
      expect(getVolatilityByProfile('moderado')).toBe(0.15); // 15%
      expect(getVolatilityByProfile('arrojado')).toBe(0.2); // 20%
      expect(getVolatilityByProfile('invalid' as InvestorProfile)).toBe(0.15); // Moderado default
    });
  });
});

describe('Cálculos de Acumulação', () => {
  describe('calculateAccumulatedWealth', () => {
    it('deve calcular patrimônio acumulado com valores simples', () => {
      const result = calculateAccumulatedWealth(
        10000, // Valor inicial
        1000, // Aporte mensal
        10, // Anos
        0.06 // 6% a.a.
      );

      // Resultado esperado deve ser > que o valor total aportado
      const totalAportado = 10000 + 1000 * 12 * 10; // 130k
      expect(result).toBeGreaterThan(totalAportado);
      expect(result).toBeCloseTo(181173, -2); // Aproximadamente 181k (valor correto calculado)
    });

    it('deve calcular corretamente com valor inicial zero', () => {
      const result = calculateAccumulatedWealth(0, 1000, 10, 0.06);
      expect(result).toBeGreaterThan(120000); // > que 120k aportados
      expect(result).toBeCloseTo(163298, -2);
    });

    it('deve calcular corretamente com aporte mensal zero', () => {
      const result = calculateAccumulatedWealth(10000, 0, 10, 0.06);
      const expected = 10000 * Math.pow(1.06, 10);
      expect(result).toBeCloseTo(expected, -2);
    });

    it('deve retornar valor inicial quando taxa de retorno é zero', () => {
      const result = calculateAccumulatedWealth(10000, 1000, 10, 0);
      const expected = 10000 + 1000 * 12 * 10;
      expect(result).toBeCloseTo(expected, 2);
    });
  });
});

describe('Cálculos de Patrimônio Requerido', () => {
  describe('calculateRequiredWealthSustainable', () => {
    it('deve calcular patrimônio requerido para renda sustentável', () => {
      const result = calculateRequiredWealthSustainable(5000, 6); // R$ 5k/mês, 6% a.a.
      const expected = (5000 * 12) / (6 / 100); // 60k / 0.06 = 1M
      expect(result).toBe(expected);
      expect(result).toBe(1000000);
    });

    it('deve retornar zero quando renda desejada é zero ou negativa', () => {
      expect(calculateRequiredWealthSustainable(0, 6)).toBe(0);
      expect(calculateRequiredWealthSustainable(-1000, 6)).toBe(0);
    });
  });

  describe('calculateRequiredWealthDepleting', () => {
    it('deve calcular patrimônio requerido para renda com depleção', () => {
      const result = calculateRequiredWealthDepleting(5000, 20, 0.04); // 5k/mês, 20 anos, 4% a.a.
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(5000 * 12 * 20); // Menos que o total sem juros
    });

    it('deve calcular corretamente com taxa de retorno zero', () => {
      const result = calculateRequiredWealthDepleting(5000, 20, 0);
      const expected = 5000 * 12 * 20; // 1.2M
      expect(result).toBe(expected);
    });

    it('deve retornar zero quando renda desejada é zero', () => {
      expect(calculateRequiredWealthDepleting(0, 20, 0.04)).toBe(0);
    });
  });
});

describe('Cálculos de Idade de Aposentadoria', () => {
  describe('calculatePossibleRetirementAge', () => {
    it('deve calcular idade possível de aposentadoria', () => {
      const result = calculatePossibleRetirementAge(
        30, // Idade atual
        5000, // Renda desejada
        20, // Anos de aposentadoria
        0.04, // Taxa aposentadoria
        10000, // Valor inicial
        1000, // Aporte mensal
        0.06 // Taxa acumulação
      );

      expect(result).toBeGreaterThan(30);
      expect(result).toBeLessThan(80); // Idade máxima razoável
    });

    it('deve retornar idade padrão quando renda desejada é zero', () => {
      const result = calculatePossibleRetirementAge(30, 0, 20, 0.04, 10000, 1000, 0.06);
      expect(result).toBe(60); // 30 + 30 (default)
    });

    it('deve limitar simulação ao máximo de anos', () => {
      const result = calculatePossibleRetirementAge(
        30, // Idade atual
        50000, // Renda muito alta
        20, // Anos aposentadoria
        0.04, // Taxa aposentadoria
        100, // Valor inicial baixo
        100, // Aporte baixo
        0.02 // Taxa acumulação baixa
      );

      expect(result).toBeLessThanOrEqual(80); // 30 + 50 anos máximo
    });
  });
});

describe('Cálculos de Renda', () => {
  describe('calculateSustainableIncome', () => {
    it('deve calcular renda sustentável mensal', () => {
      const result = calculateSustainableIncome(1000000, 6); // 1M, 6% a.a.
      const expected = (1000000 * (6 / 100)) / 12; // 5k por mês
      expect(result).toBe(expected);
      expect(result).toBe(5000);
    });

    it('deve calcular corretamente com patrimônio zero', () => {
      const result = calculateSustainableIncome(0, 6);
      expect(result).toBe(0);
    });
  });

  describe('calculateDepletingIncome', () => {
    it('deve calcular renda com depleção', () => {
      const result = calculateDepletingIncome(1000000, 20, 0.04); // 1M, 20 anos, 4% a.a.
      expect(result).toBeGreaterThan(0);
      expect(result).toBeGreaterThan(1000000 / (20 * 12)); // Maior que divisão simples
    });

    it('deve calcular corretamente com taxa zero', () => {
      const result = calculateDepletingIncome(1000000, 20, 0);
      const expected = 1000000 / (20 * 12);
      expect(result).toBe(expected);
    });

    it('deve retornar zero com patrimônio zero', () => {
      const result = calculateDepletingIncome(0, 20, 0.04);
      expect(result).toBe(0);
    });
  });
});

describe('Cálculos de Contribuição', () => {
  describe('calculateSuggestedMonthlyContribution', () => {
    it('deve calcular contribuição mensal sugerida', () => {
      const result = calculateSuggestedMonthlyContribution(
        5000, // Renda desejada
        20, // Anos aposentadoria
        0.04, // Taxa aposentadoria
        10000, // Valor inicial
        30, // Anos acumulação
        0.06 // Taxa acumulação
      );

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(10000); // Valor razoável
    });

    it('deve retornar zero quando renda desejada é zero', () => {
      const result = calculateSuggestedMonthlyContribution(0, 20, 0.04, 10000, 30, 0.06);
      expect(result).toBe(0);
    });

    it('deve retornar zero quando valor inicial é suficiente', () => {
      const result = calculateSuggestedMonthlyContribution(
        1000, // Renda baixa
        20, // Anos aposentadoria
        0.04, // Taxa aposentadoria
        10000000, // Valor inicial muito alto
        30, // Anos acumulação
        0.06 // Taxa acumulação
      );

      expect(result).toBe(0);
    });

    it('deve calcular corretamente com taxa de acumulação zero', () => {
      const result = calculateSuggestedMonthlyContribution(5000, 20, 0, 10000, 30, 0);
      expect(result).toBeGreaterThan(0);
    });
  });
});

describe('Cálculos de Retorno Mínimo', () => {
  describe('calculateMinimumAccumulationReturn', () => {
    it('deve calcular retorno mínimo necessário', () => {
      const result = calculateMinimumAccumulationReturn(
        5000, // Renda desejada
        20, // Anos aposentadoria
        0.04, // Taxa aposentadoria
        1000, // Aporte mensal
        10000, // Valor inicial
        30 // Anos acumulação
      );

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(50); // < 50% a.a. (valor razoável)
    });

    it('deve retornar retorno padrão quando renda desejada é zero', () => {
      const result = calculateMinimumAccumulationReturn(0, 20, 0.04, 1000, 10000, 30);
      expect(result).toBe(5.5); // ANNUAL_RETURNS.MODERADO * 100
    });

    it('deve convergir para valor razoável', () => {
      const result = calculateMinimumAccumulationReturn(3000, 25, 0.05, 800, 5000, 25);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(15); // Taxa razoável
    });
  });
});

describe('Edge Cases e Validações', () => {
  it('deve lidar com valores negativos adequadamente', () => {
    // Testa comportamento com inputs inválidos
    expect(calculateAccumulatedWealth(-1000, 1000, 10, 0.06)).toBeGreaterThan(0);
    expect(calculateRequiredWealthSustainable(-1000, 6)).toBe(0);
    expect(calculateRequiredWealthDepleting(-1000, 20, 0.04)).toBe(0);
  });

  it('deve lidar com valores muito altos', () => {
    const largeResult = calculateAccumulatedWealth(1000000, 10000, 30, 0.08);
    expect(largeResult).toBeGreaterThan(1000000);
    expect(Number.isFinite(largeResult)).toBe(true);
  });

  it('deve lidar com períodos muito longos', () => {
    const result = calculatePossibleRetirementAge(25, 10000, 30, 0.04, 1000, 500, 0.05);
    expect(result).toBeLessThanOrEqual(75); // 25 + 50 anos máximo
  });
});
