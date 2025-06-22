import { useState, useEffect } from 'react';
import { Calculator } from '@/components/calculator/Calculator';
import { HeroSection } from '@/components/HeroSection';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { useCalculator } from '@/components/calculator/useCalculator';
import { MatrixRain } from '@/components/MatrixRain';
import { useOverscroll } from '@/hooks/useOverscroll';

const Index = () => {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);
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
    investorProfile: calculatorData.investorProfile
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
      
      // Indicador de bottom (seta para descer)
      setShowBottomIndicator(!isNearBottom && !isAtTop);
      
      lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Matrix Rain Easter Egg */}
      <MatrixRain isActive={isOverscrolling} />
      
      {/* Hero Section - Centralized */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <HeroSection onReceivePlan={() => setIsLeadFormOpen(true)} />
          </div>
        </div>
        
        {/* Navigation Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div 
            className="section-arrow cursor-pointer"
            onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            ∨
          </div>
        </div>
      </section>

      {/* Analysis Section - Centralized */}
      <section id="calculator-section" className="min-h-screen flex items-center justify-center relative py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <Calculator />
          </div>
        </div>
        
        {/* Navigation Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div 
            className="section-arrow cursor-pointer"
            onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            ∨
          </div>
        </div>
      </section>

      {/* CTA Section - Centralized */}
      <section id="cta-section" className="min-h-screen flex items-center justify-center relative py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="aurora-cta-banner rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
              {/* CTA Aurora Background */}
              <div id="aurora-cta-background">
                <div id="cta-blob1" className="aurora-cta-blob"></div>
                <div id="cta-blob2" className="aurora-cta-blob"></div>
                <div id="cta-blob3" className="aurora-cta-blob"></div>
                <div id="cta-blob4" className="aurora-cta-blob"></div>
                <div id="cta-blob5" className="aurora-cta-blob"></div>
                <div id="cta-blob6" className="aurora-cta-blob"></div>
                <div id="cta-blob7" className="aurora-cta-blob"></div>
                <div id="cta-blob8" className="aurora-cta-blob"></div>
                <div id="cta-blob9" className="aurora-cta-blob"></div>
              </div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 whitespace-pre-line">
                  {"Pronto para impulsionar \nsua jornada?"}
                </h2>
                <p className="text-lg text-white/90 mb-8 whitespace-pre-line">
                  {"Transforme seus sonhos objetivos em realidade \ncom um plano de gestão patrimonial sob medida."}
                </p>
                <button
                  onClick={() => setIsLeadFormOpen(true)}
                  className="tech-button-specialist-cta px-8 py-4 text-lg"
                >
                  Consultar um especialista para garantir o meu futuro
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Header - Visible at top and bottom */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10 transition-all duration-300">
          <div className="flex justify-center">
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div 
                  className="tech-logo-header text-white text-xl cursor-pointer"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  futuro em foco
                </div>
                <button
                  onClick={() => setIsLeadFormOpen(true)}
                  className="tech-button-header"
                >
                  Converse conosco
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Bottom indicator to show dynamic header */}
      {showBottomIndicator && (
        <div className="fixed bottom-8 right-8 z-40 animate-pulse">
          <div 
            className="section-arrow bg-black/80 backdrop-blur-sm border border-white/20 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-black/90 transition-all duration-300"
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
            title="Ver header no final da página"
          >
            ∨
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 bg-black">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs text-gray-700 opacity-30 leading-tight">
              As informações contidas neste material são de caráter exclusivamente informativo e não devem ser entendidas como oferta, recomendação ou análise de investimento.
              O Futuro em Foco Planner não garante que os rendimentos futuros serão iguais aos apresentados neste simulador.
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
