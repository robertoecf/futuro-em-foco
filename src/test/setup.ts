/**
 * 🎯 FASE 4 ITEM 7: Setup para testes unitários
 * Configurações globais para execução de testes com Vitest
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do IntersectionObserver para testes
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock do ResizeObserver para testes
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock do requestIdleCallback
global.requestIdleCallback = vi
  .fn()
  .mockImplementation(
    (callback: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void) => {
      return setTimeout(() => callback({ timeRemaining: () => 50, didTimeout: false }), 0);
    }
  );

global.cancelIdleCallback = vi.fn().mockImplementation((id: number) => {
  clearTimeout(id);
});

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
