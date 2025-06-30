// src/lib/data/profileData.ts

// Esta é a nova fonte única da verdade para os dados do perfil do investidor.
// Todas as partes do aplicativo (UI e lógica de cálculo) devem usar este arquivo.

import type { InvestorProfile as InvestorProfileId } from '@/components/calculator/types';

interface ProfileData {
  id: InvestorProfileId;
  title: string;
  description: string;
  annualReturn: number;
  volatility: number; // Em %, ex: 5.5 para 5.5%
  maxLoss: number;
}

export const profiles: readonly ProfileData[] = [
  {
    id: 'conservador',
    title: 'Conservador',
    description: 'Investidor com pouca tolerância ao risco, busca segurança e menor volatilidade.',
    annualReturn: 0.04, // 4% a.a.
    volatility: 1, // 1%
    maxLoss: -5,
  },
  {
    id: 'moderado',
    title: 'Moderado',
    description:
      'Investidor que equilibra segurança e risco, está disposto a enfrentar alguma volatilidade.',
    annualReturn: 0.055, // 5.5% a.a.
    volatility: 5.5, // 5.5%
    maxLoss: -15,
  },
  {
    id: 'arrojado',
    title: 'Arrojado',
    description:
      'Investidor mais tolerante ao risco, disposto a assumir mais volatilidade em busca de maiores retornos.',
    annualReturn: 0.065, // 6.5% a.a.
    volatility: 9, // 9%
    maxLoss: -25,
  },
] as const; 