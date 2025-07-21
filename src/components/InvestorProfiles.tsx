import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import type { InvestorProfile } from '@/features/planning/components/calculator/useCalculator';
import { profiles } from '@/lib/data/profileData';

interface InvestorProfileProps {
  onProfileSelect: (profile: InvestorProfile) => void;
  selectedProfile: InvestorProfile;
}

export const InvestorProfiles = ({ onProfileSelect, selectedProfile }: InvestorProfileProps) => {
  const [openTooltips, setOpenTooltips] = useState<{ [key: string]: boolean }>({});

  const handleTooltipClick = (tooltipId: string) => {
    setOpenTooltips((prev) => ({
      ...prev,
      [tooltipId]: !prev[tooltipId],
    }));
  };

  const handleClickOutside = () => {
    setOpenTooltips({});
  };

  // Close tooltips when clicking anywhere on the document
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <div className="w-[90%] mx-auto space-y-4 sm:space-y-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Perfil do Investidor</h2>
          <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
            De acordo com o seu perfil de investidor, o seu perfil é o que melhor se adequa às suas
            expectativas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className={`p-4 sm:p-6 cursor-pointer investor-card investor-card-${profile.id} ${selectedProfile === profile.id ? 'active' : ''}`}
              onClick={() => onProfileSelect(profile.id as InvestorProfile)}
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-white">{profile.title}</h3>
                {selectedProfile === profile.id && (
                  <Badge className="bg-orange-500/75 text-white border-orange-400 text-xs sm:text-sm">
                    Selecionado
                  </Badge>
                )}
              </div>

              <p className="text-sm text-white mb-3 sm:mb-4">{profile.description}</p>

              <div className="space-y-2 text-sm text-white">
                <p>
                  Retorno anual esperado:{' '}
                  <span className="font-semibold">{(profile.annualReturn * 100).toFixed(1)}%</span>
                </p>

                <div className="flex items-center gap-1">
                  <span>Volatilidade esperada: </span>
                  <span className="font-semibold">{profile.volatility}%</span>
                  <Tooltip open={openTooltips[`${profile.id}-volatility`]}>
                    <TooltipTrigger asChild>
                      <InfoIcon
                        className="h-3 w-3 text-gray-300 hover:text-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTooltipClick(`${profile.id}-volatility`);
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        A volatilidade mede o grau de variação dos preços de um investimento ao
                        longo do tempo. Maior volatilidade significa que os preços podem subir ou
                        descer mais rapidamente e em maior amplitude.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-1">
                  <span>Perda máxima: </span>
                  <span className="font-semibold">{profile.maxLoss}%</span>
                  <Tooltip open={openTooltips[`${profile.id}-maxloss`]}>
                    <TooltipTrigger asChild>
                      <InfoIcon
                        className="h-3 w-3 text-gray-300 hover:text-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTooltipClick(`${profile.id}-maxloss`);
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        O drawdown representa a maior queda percentual que o investimento pode
                        sofrer em relação ao seu pico anterior. É uma medida de risco que indica a
                        perda máxima esperada em cenários adversos.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
