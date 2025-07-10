import { useState, useEffect } from 'react';
import { Calculator } from '@/components/calculator/Calculator';
import { HeroSection } from '@/components/HeroSection';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { useCalculator } from '@/components/calculator/useCalculator';
import { MatrixRain } from '@/components/MatrixRain';
import { useOverscroll } from '@/hooks/useOverscroll';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true); // Header visível no início

  // Easter egg Matrix rain effect
  const isOverscrolling = useOverscroll();

  // Calculator data
  const calculatorData = useCalculator();

  // Planning inputs for lead form
  const planningInputs = {
    initialAmount: calculatorData.initialAmount,
    monthlyAmount: calculatorData.monthlyAmount,
    currentAge: calculatorData.currentAge,
    retirementAge: calculatorData.retirementAge,
    lifeExpectancy: calculatorData.lifeExpectancy,
    retirementIncome: calculatorData.retirementIncome,
    portfolioReturn: calculatorData.portfolioReturn,
    investorProfile: calculatorData.investorProfile,
  };

  // Check scroll position to show/hide header
  useEffect(() => {
    let lastScrollTop = 0;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Detectar se está no topo (primeiros 50px)
      const isAtTop = scrollTop <= 50;

      // Detectar se está no final (últimos 50px)
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

      // Lógica do header:
      // 1. Sempre visível no topo
      // 2. Aparece quando chega ao final
      // 3. Some quando sobe qualquer pixel do final
      // 4. Só aparece novamente quando volta ao topo

      if (isAtTop) {
        setShowHeader(true);
      } else if (isNearBottom) {
        setShowHeader(true);
      } else if (lastScrollTop > scrollTop && !isAtTop) {
        // Se está subindo e não está no topo, esconder
        setShowHeader(false);
      } else if (lastScrollTop < scrollTop && !isNearBottom) {
        // Se está descendo e não está no final, esconder
        setShowHeader(false);
      }

      lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const heroBannerBackground = document.getElementById('aurora-banner-background');
    const ctaBanner = document.getElementById('cta-banner');

    if (heroBannerBackground && ctaBanner) {
      const clonedBackground = heroBannerBackground.cloneNode(true) as HTMLElement;
      clonedBackground.id = 'aurora-cta-background-cloned';
      ctaBanner.prepend(clonedBackground);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background dark:text-white text-gray-900 relative">
      {/* Matrix Rain Easter Egg */}
      <MatrixRain isActive={isOverscrolling} />

      {/* Hero Section - Centralized */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            <HeroSection onReceivePlan={() => setIsLeadFormOpen(true)} />
          </div>
        </div>

        {/* Navigation Arrow */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div
            className="section-arrow cursor-pointer"
            onClick={() =>
              document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            ∨
          </div>
        </div>
      </section>

      {/* Analysis Section - Centralized */}
      <section
        id="calculator-section"
        className="min-h-screen flex items-center justify-center relative"
      >
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            <Calculator />
          </div>
        </div>

        {/* Navigation Arrow */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div
            className="section-arrow cursor-pointer animate-bounce"
            onClick={() =>
              document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            ∨
          </div>
        </div>
      </section>

      {/* CTA Section - Centralized */}
      <div className="flex justify-center mt-48">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
          <section
            id="cta-section"
            className="min-h-screen flex items-center justify-center relative pb-24"
          >
            <div
              id="cta-banner"
              className="aurora-banner text-white p-12 md:p-16 lg:p-20 rounded-3xl relative overflow-hidden"
              style={{ width: '100%', display: 'block' }}
            >
              {/* Aurora Background will be prepended here by useEffect */}

              {/* Content */}
              <div className="relative z-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Pronto para impulsionar sua jornada?
                </h1>
                <p className="text-lg mb-8 opacity-90">
                  Transforme seus objetivos em realidade com um plano de gestão patrimonial sob
                  medida.
                </p>
                <Button
                  onClick={() => setIsLeadFormOpen(true)}
                  className="tech-button-specialist-cta"
                >
                  Receber plano por email
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Dynamic Header - Visible at top and bottom */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b dark:border-white/10 border-gray-300/30 transition-all duration-300">
          <div className="flex justify-center">
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
              <div className="flex items-center justify-between h-16">
                <div
                  className="tech-logo-header dark:text-white text-gray-900 text-xl cursor-pointer"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  futuro em foco
                </div>
                <div className="flex items-center space-x-8">
                  <a href="/area-logada" className="text-white/80 hover:text-white transition-colors text-sm">
                    Área Logada
                  </a>
                  <button onClick={() => setIsLeadFormOpen(true)} className="tech-button-header dark:text-white text-gray-900">
                    Converse conosco
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Footer */}
      <footer className="py-4 bg-background">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            <p className="text-center text-xs dark:text-gray-700 text-gray-500 opacity-30 leading-tight">
              As informações contidas neste material são de caráter exclusivamente informativo e não
              devem ser entendidas como oferta, recomendação ou análise de investimento. O Futuro em
              Foco Planner não garante que os rendimentos futuros serão iguais aos apresentados
              neste simulador.
            </p>
          </div>
        </div>
      </footer>

      {/* Lead Capture Form Modal */}
      <LeadCaptureForm
        isOpen={isLeadFormOpen}
        onClose={() => setIsLeadFormOpen(false)}
        planningInputs={planningInputs}
        calculationResult={calculatorData.calculationResult}
      />
    </div>
  );
};

export default Index;
