import { useState, useEffect, useRef } from 'react';
import { Calculator } from '@/features/planning/components/calculator/Calculator';
import { HeroSection } from '@/components/HeroSection';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { useCalculator } from '@/features/planning/components/calculator/useCalculator';
import { MatrixRain } from '@/components/MatrixRain';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true); // Header visível no início

  // Refs para as seções-chave
  const heroRef = useRef<HTMLElement | null>(null);
  const calculatorRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  // Estado para MatrixRain
  const [showMatrix, setShowMatrix] = useState(false);

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

  // NOVA LÓGICA: IntersectionObserver para header
  useEffect(() => {
    const hero = heroRef.current;
    const footer = footerRef.current;
    if (!hero || !footer) return;

    let heroVisible = false;
    let footerVisible = false;

    const updateHeader = () => {
      // Header aparece se hero OU footer visíveis
      setShowHeader(heroVisible || footerVisible);
    };

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === hero) {
            heroVisible = entry.isIntersecting;
          } else if (entry.target === footer) {
            footerVisible = entry.isIntersecting;
          }
        });
        updateHeader();
      },
      {
        threshold: 0.1, // Considera visível se pelo menos 10% da seção está na viewport
      }
    );

    observer.observe(hero);
    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  // NOVA LÓGICA: MatrixRain só ativa no fim da página e modo escuro
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    let isSentinelVisible = false;
    let isDark = document.documentElement.classList.contains('dark');

    const updateMatrix = () => {
      setShowMatrix(isSentinelVisible && isDark);
    };

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === sentinel) {
            isSentinelVisible = entry.isIntersecting;
          }
        });
        isDark = document.documentElement.classList.contains('dark');
        updateMatrix();
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);

    // Listener para mudança de tema
    const themeListener = () => {
      isDark = document.documentElement.classList.contains('dark');
      updateMatrix();
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', themeListener);

    // Também escuta mudanças manuais de classe
    const mutationObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
      updateMatrix();
    });
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', themeListener);
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark:text-white text-gray-900 relative">
      {/* Matrix Rain Easter Egg - só ativa no fim da página e modo escuro */}
      <div
        style={{
          transform: 'scaleY(-1)',
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100vw',
          height: '120px',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        {showMatrix && <MatrixRain isActive={true} mask="bottom" />}
      </div>

      {/* Hero Section - Centralized */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center relative">
        <div className="flex justify-center">
          <div className="w-full">
            <HeroSection onReceivePlan={() => setIsLeadFormOpen(true)} />
          </div>
        </div>

        {/* Navigation Arrow */}
        <div
          className="section-arrow cursor-pointer"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translate(-50%, calc(50% + 40px))',
            bottom: '10%',
          }}
          onClick={() =>
            document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          ∨
        </div>
      </section>

      {/* Analysis Section - Centralized */}
      <section
        ref={calculatorRef}
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
      <section id="cta-section" className="h-auto flex items-center justify-center relative">
        <div className="w-full">
          <div
            id="cta-banner"
            className="aurora-banner text-white p-8 sm:p-12 md:p-12 lg:p-12 xl:p-14 rounded-3xl relative overflow-hidden"
            style={{
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              margin: '0 auto 0 auto',
              minHeight: '80vh',
            }}
          >
            {/* Aurora Background CTA */}
            <div id="aurora-cta-background" className="absolute inset-0 w-full h-full pointer-events-none select-none">
              <svg viewBox="0 0 1200 800" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: '100%', height: '100%' }}>
                <ellipse cx="240" cy="240" rx="210" ry="210" fill="#E48200" opacity="0.8" /> {/* banner-blob1 */}
                <ellipse cx="600" cy="160" rx="180" ry="180" fill="#00b4d8" opacity="0.8" /> {/* banner-blob2 */}
                <ellipse cx="120" cy="480" rx="160" ry="160" fill="#a7c957" opacity="0.8" /> {/* banner-blob3 */}
                <ellipse cx="720" cy="320" rx="230" ry="230" fill="#E48200" opacity="0.8" /> {/* banner-blob4 */}
                <ellipse cx="360" cy="400" rx="170" ry="170" fill="#0077b6" opacity="0.8" /> {/* banner-blob5 */}
                <ellipse cx="840" cy="200" rx="130" ry="130" fill="#2F3B29" opacity="0.8" /> {/* banner-blob6 */}
                <ellipse cx="480" cy="280" rx="150" ry="150" fill="url(#grad1)" opacity="0.8" /> {/* banner-blob7 */}
                <ellipse cx="180" cy="360" rx="125" ry="125" fill="url(#grad2)" opacity="0.8" /> {/* banner-blob8 */}
                <ellipse cx="660" cy="440" rx="140" ry="140" fill="#455a3e" opacity="0.8" /> {/* banner-blob9 */}
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E48200" />
                    <stop offset="100%" stopColor="#b30000" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#E48200" />
                    <stop offset="100%" stopColor="#b30000" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center" style={{ marginTop: '60px' }}>
              <h1 className="text-3xl sm:text-4xl md:text-4xl xl:text-5xl font-bold mb-4 leading-tight lg:text-5xl">
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
        </div>
      </section>

      {/* Divider antes do footer */}
      <div className="section-divider w-24 ml-auto !mt-0" />

      {/* Sentinela para MatrixRain no fim da página */}
      <div ref={bottomSentinelRef} style={{ height: 1 }} />

      {/* Dynamic Header - Visible at top and bottom */}
      {showHeader && (
        <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6 lg:px-4">
          <nav className="relative flex w-full max-w-[74rem] items-center justify-between gap-6 rounded-full transition-all duration-300 glass-header-3d px-6 py-3">
            <div
              className="tech-logo-header dark:text-white text-gray-900 text-lg sm:text-xl cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              futuro em foco
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
              <button
                onClick={() => setIsLeadFormOpen(true)}
                className="tech-button-header dark:text-white text-gray-900 px-2 py-1 text-sm sm:text-base"
              >
                Converse conosco
              </button>
            </div>
          </nav>
        </header>
      )}

      {/* Footer */}
      <footer ref={footerRef} className="py-4 bg-background">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            <p className="text-center text-xs leading-tight text-white dark:text-[#D2D2D2]">
              As informações contidas neste material são de caráter exclusivamente informativo e não
              devem ser entendidas como oferta, recomendação ou análise de investimento. O Futuro em
              Foco Planner não garante que os rendimentos futuros serão iguais aos apresentados
              neste simulador.
            </p>
          </div>
        </div>
      </footer>

      {/* Lead Capture Form Modal */}
      {isLeadFormOpen && (
        <LeadCaptureForm
          isOpen={isLeadFormOpen}
          onClose={() => setIsLeadFormOpen(false)}
          planningInputs={planningInputs}
          calculationResult={calculatorData.calculationResult}
        />
      )}
    </div>
  );
};

export default Index;
