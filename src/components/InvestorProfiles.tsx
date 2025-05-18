
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface InvestorProfileProps {
  onProfileSelect: (profile: string) => void;
  selectedProfile: string;
}

export const InvestorProfiles = ({ onProfileSelect, selectedProfile }: InvestorProfileProps) => {
  const profiles = [
    {
      id: 'conservador',
      title: 'Conservador',
      description: 'Investidor com pouca tolerância ao risco, busca segurança e menor volatilidade.',
      annualReturn: 0.06, // 6% a.a.
      monthlyContribution: 1000,
      initialAmount: 15000,
      years: 15,
      finalAmount: 378421,
      monthlyIncome: 1513
    },
    {
      id: 'moderado',
      title: 'Moderado',
      description: 'Investidor que equilibra segurança e risco, está disposto a enfrentar alguma volatilidade.',
      annualReturn: 0.09, // 9% a.a.
      monthlyContribution: 1000,
      initialAmount: 15000,
      years: 15,
      finalAmount: 479861,
      monthlyIncome: 1919
    },
    {
      id: 'arrojado',
      title: 'Arrojado',
      description: 'Investidor mais tolerante ao risco, disposto a assumir mais volatilidade em busca de maiores retornos.',
      annualReturn: 0.12, // 12% a.a.
      monthlyContribution: 1000,
      initialAmount: 15000,
      years: 15,
      finalAmount: 611597,
      monthlyIncome: 2446
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Perfil do Investidor</h2>
      <p className="text-gray-600 mb-6">De acordo com o seu perfil de investidor, o seu perfil é o que melhor se adequa às suas expectativas:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <Card 
            key={profile.id}
            className={`p-6 cursor-pointer investor-card ${selectedProfile === profile.id ? 'active' : ''}`}
            onClick={() => onProfileSelect(profile.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{profile.title}</h3>
              {selectedProfile === profile.id && (
                <Badge className="bg-green-500">Selecionado</Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{profile.description}</p>
            
            <div className="space-y-2 text-sm">
              <p>Retorno anual esperado: <span className="font-semibold">{(profile.annualReturn * 100).toFixed(1)}%</span></p>
              <p>Patrimônio acumulado: <span className="font-semibold">{formatCurrency(profile.finalAmount)}</span></p>
              <p>Renda mensal estimada: <span className="font-semibold">{formatCurrency(profile.monthlyIncome)}</span></p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
