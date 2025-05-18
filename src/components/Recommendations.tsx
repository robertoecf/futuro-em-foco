
import { Card } from '@/components/ui/card';
import { ChartBarIcon, CircleDollarSignIcon, InfoIcon } from 'lucide-react';

interface RecommendationsProps {
  investorProfile: string;
}

export const Recommendations = ({ investorProfile }: RecommendationsProps) => {
  const getRecommendationsByProfile = () => {
    switch (investorProfile) {
      case 'conservador':
        return [
          {
            icon: <InfoIcon className="h-6 w-6 text-blue-500" />,
            title: 'Diversificação é essencial',
            description: 'Mesmo com perfil conservador, diversifique seus investimentos entre renda fixa pública e privada.'
          },
          {
            icon: <ChartBarIcon className="h-6 w-6 text-blue-500" />,
            title: 'Foque em liquidez',
            description: 'Mantenha parte dos investimentos em ativos de alta liquidez para emergências.'
          },
          {
            icon: <CircleDollarSignIcon className="h-6 w-6 text-blue-500" />,
            title: 'Aumente contribuições',
            description: 'Considere aumentar seus aportes mensais em 10% ao ano para compensar a taxa de retorno mais baixa.'
          }
        ];
      
      case 'moderado':
        return [
          {
            icon: <InfoIcon className="h-6 w-6 text-orange-500" />,
            title: 'Balanceamento periódico',
            description: 'Reequilibre sua carteira a cada 6 meses para manter a proporção ideal entre renda fixa e variável.'
          },
          {
            icon: <ChartBarIcon className="h-6 w-6 text-orange-500" />,
            title: 'Diversificação internacional',
            description: 'Considere alocar até 15% do seu patrimônio em investimentos internacionais para maior diversificação.'
          },
          {
            icon: <CircleDollarSignIcon className="h-6 w-6 text-orange-500" />,
            title: 'Revise anualmente',
            description: 'Faça uma revisão completa de seus investimentos e objetivos uma vez ao ano.'
          }
        ];
      
      case 'arrojado':
        return [
          {
            icon: <InfoIcon className="h-6 w-6 text-red-500" />,
            title: 'Controle emocional',
            description: 'Mantenha disciplina nos momentos de alta volatilidade, evitando vendas em momentos de pânico.'
          },
          {
            icon: <ChartBarIcon className="h-6 w-6 text-red-500" />,
            title: 'Reserva estratégica',
            description: 'Mesmo com perfil arrojado, mantenha uma reserva de 6-12 meses de despesas em ativos seguros.'
          },
          {
            icon: <CircleDollarSignIcon className="h-6 w-6 text-red-500" />,
            title: 'Diversificação ampla',
            description: 'Diversifique entre classes de ativos, setores econômicos e regiões geográficas para mitigar riscos.'
          }
        ];
      
      default:
        return [];
    }
  };

  const recommendations = getRecommendationsByProfile();

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Recomendações para otimizar seu plano</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, index) => (
          <Card key={index} className="p-6 recommendation-card">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-gray-100">
                {rec.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{rec.title}</h3>
              <p className="text-gray-600">{rec.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
