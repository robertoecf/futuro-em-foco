import { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator } from '@/components/calculator/Calculator';
import { HeroSection } from '@/components/HeroSection';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { useCalculator } from '@/components/calculator/useCalculator';
import { MatrixRain } from '@/components/MatrixRain';
import { useOverscroll } from '@/hooks/useOverscroll';
import { Button } from '@/components/ui/button';

// Função throttle simples
function throttle<T extends unknown[]>(fn: (...args: T) => void, wait: number) {
  let lastTime = 0;
  return function (...args: T) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn(...args);
    }
  };
}

// Função debounce simples
function debounce<T extends unknown[]>(fn: (...args: T) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  const debounced = function (...args: T) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

// Tipagem explícita para o debounce com método cancel
interface DebouncedFunction<T extends unknown[]> {
  (...args: T): void;
  cancel: () => void;
}

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

  // Optimized scroll handler with throttling and cached dimensions
  const lastScrollTopRef = useRef(0);
  const ticking = useRef(false);
  const scrollDimensionsRef = useRef({
    scrollHeight: 0,
    clientHeight: 0,
  });

  // Update cached scroll dimensions
  const updateScrollDimensions = useCallback(() => {
    scrollDimensionsRef.current = {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
    };
  }, []);

  // Debounced setter para o header
  const debouncedSetShowHeader = useRef<DebouncedFunction<[boolean]> | null>(null);
  if (!debouncedSetShowHeader.current) {
    debouncedSetShowHeader.current = debounce(setShowHeader, 200) as DebouncedFunction<[boolean]>;
  }

  const BOTTOM_ACTIVE_ZONE = 150;

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const { scrollHeight, clientHeight } = scrollDimensionsRef.current;
        const isAtTop = scrollTop <= 900;
        const isAtBottomZone = scrollTop + clientHeight >= scrollHeight - BOTTOM_ACTIVE_ZONE;
        if (isAtTop || isAtBottomZone) {
          if (debouncedSetShowHeader.current && typeof debouncedSetShowHeader.current.cancel === 'function') {
            debouncedSetShowHeader.current.cancel();
          }
          setShowHeader(true); // Mostra imediatamente ao voltar ao topo ou chegar na zona ativa do fim
        } else {
          // Esconde com delay se não está no topo/fim
          if (debouncedSetShowHeader.current) {
            debouncedSetShowHeader.current(false);
          }
        }
        lastScrollTopRef.current = scrollTop;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  // Set up scroll listener with cached dimensions and resize handling
  useEffect(() => {
    // Initialize cached dimensions
    updateScrollDimensions();
    
    // Handle resize events to update cached dimensions
    const handleResize = () => {
      updateScrollDimensions();
    };

    const throttledScroll = throttle(handleScroll, 50);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, updateScrollDimensions]);

  return (
    <div className="min-h-screen bg-background dark:text-white text-gray-900 relative">
      {/* Matrix Rain Easter Egg */}
      {/* <MatrixRain isActive={isOverscrolling} mask="top" /> */}
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
        <MatrixRain isActive={isOverscrolling} mask="bottom" />
      </div>

      {/* Hero Section - Centralized */}
      <section className="min-h-screen flex items-center justify-center relative">
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
            className="aurora-banner text-white p-8 sm:p-12 md:p-12 lg:p-12 xl:p-14 rounded-3xl relative overflow-hidden dark:shadow-none shadow-2xl"
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

      {/* Dynamic Header - Visible at top and bottom */}
      {showHeader && (
        <header
          className="fixed top-0 left-0 right-0 z-50 border-b dark:border-white/10 border-gray-300/30 transition-all duration-300 glass-header bg-background/80 backdrop-blur-md"
        >
          <div className="flex justify-center">
            <div className="w-full max-w-7xl px-2 sm:px-4 lg:px-4">
              <div className="flex flex-wrap items-center justify-between h-16 gap-y-2">
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
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Footer */}
      <footer className="py-4 bg-background">
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
