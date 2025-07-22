import { Button } from './ui/button';
interface HeroSectionProps {
  onReceivePlan?: () => void;
}
export const HeroSection = ({ onReceivePlan: _onReceivePlan }: HeroSectionProps) => {
  const handleClick = () => {
    // Scroll para a seção da calculadora
    document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div
      id="hero-banner"
      className="aurora-banner text-white p-6 sm:p-8 md:p-12 lg:p-12 xl:p-14 rounded-3xl relative overflow-hidden dark:shadow-none shadow-2xl"
      style={{
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 'clamp(95px, 8vh, 80px) auto',
        minHeight: '80vh',
      }}
    >
      {/* Aurora Background */}
      <div id="aurora-banner-background" className="aurora-background-container">
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
      <div className="relative z-10 text-center" style={{ marginTop: '60px' }}>
        <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold mb-4 leading-tight lg:text-5xl">
          Quer garantir sua aposentadoria tranquila?
        </h1>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90">
          O patrimônio acumulado terá um impacto direto nos recursos disponíveis ao se aposentar. A
          boa notícia é que definindo metas claras e investindo regularmente, você pode assegurar
          sua tranquilidade financeira por muitos anos. Vamos entender o seu objetivo e checar a
          necessidade de ajustes no seu planejamento.
        </p>
        <Button className="tech-button-specialist-cta min-h-[44px] px-6 py-3" onClick={handleClick}>
          Calcular projeção patrimonial
        </Button>
      </div>
    </div>
  );
};
