import { Button } from '@/components/ui/button';
interface HeroSectionProps {
  onReceivePlan?: () => void;
}
export const HeroSection = ({
  onReceivePlan
}: HeroSectionProps) => {
  const handleClick = () => {
    // Scroll para a seção da calculadora
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  return <div className="aurora-banner text-white p-8 sm:p-12 md:p-12 lg:p-12 xl:p-14 rounded-3xl relative overflow-hidden" style={{
    width: '100%',
    display: 'block'
  }}>
      {/* Aurora Background */}
      <div id="aurora-banner-background">
        <div id="banner-blob1" className="aurora-banner-blob"></div>
        <div id="banner-blob2" className="aurora-banner-blob"></div>
        <div id="banner-blob3" className="aurora-banner-blob"></div>
        <div id="banner-blob4" className="aurora-banner-blob"></div>
        <div id="banner-blob5" className="aurora-banner-blob"></div>
        <div id="banner-blob6" className="aurora-banner-blob"></div>
        <div id="banner-blob7" className="aurora-banner-blob mix-blob"></div>
        <div id="banner-blob8" className="aurora-banner-blob mix-blob"></div>
        <div id="banner-blob9" className="aurora-banner-blob mix-blob"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-4xl xl:text-5xl font-bold mb-4 leading-tight lg:text-5xl">
          Quer garantir sua aposentadoria tranquila?
        </h1>
        <p className="text-lg mb-8 opacity-90">
          O patrimônio acumulado terá um impacto direto nos recursos disponíveis ao se aposentar. 
          A boa notícia é que definindo metas claras e investindo regularmente, você pode assegurar sua tranquilidade financeira por muitos anos. 
          Vamos entender o seu objetivo e checar a necessidade de ajustes no seu planejamento.
        </p>
        <Button className="tech-button-specialist-cta" onClick={handleClick}>
          Calcular projeção patrimonial
        </Button>
      </div>
    </div>;
};