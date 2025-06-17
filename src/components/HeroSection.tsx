
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onReceivePlan?: () => void;
}

export const HeroSection = ({ onReceivePlan }: HeroSectionProps) => {
  const handleClick = () => {
    if (onReceivePlan) {
      onReceivePlan();
    } else {
      // Comportamento padrão se não houver callback
      console.log('Consultar um especialista clicked');
    }
  };

  return (
    <div className="aurora-gradient dark-theme:aurora-gradient-dark text-white p-8 md:p-16 rounded-lg max-w-7xl mx-auto">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Quer garantir sua aposentadoria tranquila?
        </h1>
        <p className="text-lg mb-8 opacity-90">
          O patrimônio acumulado terá um impacto direto nos recursos disponíveis ao se aposentar. 
          A boa notícia é que definindo metas claras e investindo regularmente, você pode assegurar sua tranquilidade financeira por muitos anos. 
          Vamos entender o seu objetivo e checar a necessidade de ajustes no seu planejamento.
        </p>
        <Button 
          className="bg-black hover:bg-gray-800 text-white"
          onClick={handleClick}
        >
          Consultar um especialista
        </Button>
      </div>
    </div>
  );
};
