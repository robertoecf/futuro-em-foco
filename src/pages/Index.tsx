import { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator } from '@/components/calculator/Calculator';
import { HeroSection } from '@/components/HeroSection';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { useCalculator } from '@/components/calculator/useCalculator';
import { MatrixRain } from '@/components/MatrixRain';
import { useOverscroll } from '@/hooks/useOverscroll';
import { Button } from '@/components/ui/button';
import { performanceValidator } from '@/utils/performanceValidation';

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

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        performanceValidator.startMeasuring('Index-scrollHandler');
        
        // Only get current scroll position, use cached dimensions
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const { scrollHeight, clientHeight } = scrollDimensionsRef.current;

        // Detect if at top (first 900px)
        const isAtTop = scrollTop <= 900;

        // Detect if near bottom (last 50px)
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

        // Header visibility logic:
        // 1. Always visible at top
        // 2. Appears when reaching bottom
        // 3. Hides when scrolling up from bottom
        // 4. Only appears again when returning to top

        if (isAtTop) {
          setShowHeader(true);
        } else if (isNearBottom) {
          setShowHeader(true);
        } else if (lastScrollTopRef.current > scrollTop && !isAtTop) {
          // Scrolling up and not at top, hide
          setShowHeader(false);
        } else if (lastScrollTopRef.current < scrollTop && !isNearBottom) {
          // Scrolling down and not at bottom, hide
          setShowHeader(false);
        }

        lastScrollTopRef.current = scrollTop;
        ticking.current = false;
        
        performanceValidator.endMeasuring('Index-scrollHandler');
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, updateScrollDimensions]);

  // Optimized DOM manipulation with proper timing
  useEffect(() => {
    // Use requestAnimationFrame to prevent layout thrashing
    const setupAuroraBackground = () => {
      const heroBannerBackground = document.getElementById('aurora-banner-background');
      const ctaBanner = document.getElementById('cta-banner');

      if (heroBannerBackground && ctaBanner) {
        // Check if already cloned to prevent duplicates
        const existingClone = document.getElementById('aurora-cta-background-cloned');
        if (!existingClone) {
          const clonedBackground = heroBannerBackground.cloneNode(true) as HTMLElement;
          clonedBackground.id = 'aurora-cta-background-cloned';
          ctaBanner.prepend(clonedBackground);
        }
      }
    };

    // Defer DOM manipulation to next frame
    requestAnimationFrame(setupAuroraBackground);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:text-white text-gray-900 relative">
      {/* Matrix Rain Easter Egg */}
      <MatrixRain isActive={isOverscrolling} />

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
      <section id="cta-section" className="min-h-screen flex items-center justify-center relative pb-24 mt-48">
        <div className="flex justify-center">
          <div className="w-full">
            <div
              id="cta-banner"
              className="aurora-banner text-white p-12 md:p-16 lg:p-20 rounded-3xl relative overflow-hidden"
              style={{
                width: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                margin: 'clamp(24px, 8vh, 80px)',
                minHeight: '80vh',
              }}
            >
              {/* Aurora Background will be prepended here by useEffect */}

              {/* Content */}
              <div className="relative z-10 text-center" style={{ marginTop: '60px' }}>
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
          </div>
        </div>
      </section>

      {/* Dynamic Header - Visible at top and bottom */}
      {showHeader && (
        <header
          className="fixed top-0 left-0 right-0 z-50 border-b dark:border-white/10 border-gray-300/30 transition-all duration-300 glass-header"
        >
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
                  <button
                    onClick={() => setIsLeadFormOpen(true)}
                    className="tech-button-header dark:text-white text-gray-900"
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
