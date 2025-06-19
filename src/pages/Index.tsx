
import { useState, useEffect } from 'react';
import { Calculator } from '@/components/calculator/Calculator';
import { HeroSection } from '@/components/HeroSection';
import { InvestorProfiles } from '@/components/InvestorProfiles';
import { Recommendations } from '@/components/Recommendations';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';
import { Button } from '@/components/ui/button';
import { useCalculator } from '@/components/calculator/useCalculator';
import { cleanupExpiredData } from '@/components/calculator/storageUtils';

const Index = () => {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  // Cleanup expired data on app start
  useEffect(() => {
    cleanupExpiredData();
  }, []);

  // Usar os dados do calculador para capturar no formulário
  const calculatorData = useCalculator();
  const handleReceivePlanByEmail = () => {
    setIsLeadFormOpen(true);
  };
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">Futuro em Foco</div>
        <Button 
          className="tech-button-header"
          onClick={handleReceivePlanByEmail}
        >
          Converse conosco
        </Button>
      </header>

      {/* Hero Section - Banner Laranja */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <HeroSection onReceivePlan={handleReceivePlanByEmail} />
      </section>

      {/* Calculator Section - Análise Detalhada com Background Tecno-Etéreo */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Background Técnico Sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-blue-50/30 backdrop-blur-sm"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 fade-in-slide-up">
            <span className="inline-block bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-sm font-medium mb-4 tech-label">ANÁLISE DETALHADA</span>
            <h2 className="text-3xl font-bold">Análise do seu investimento para aposentadoria</h2>
          </div>
          <Calculator />
        </div>
      </section>

      {/* CTA Section with Aurora Background */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="aurora-cta-banner text-white p-8 md:p-16 rounded-lg max-w-7xl mx-auto relative overflow-hidden">
          {/* Aurora Background */}
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

          {/* Content */}
          <div className="max-w-3xl ml-auto text-right relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O Futuro em Foco pode te ajudar alcançar seus objetivos
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Nossa calculadora de projeção patrimonial permite simular diferentes cenários para 
              aposentadoria, preservação ou usufruto do seu patrimônio, ajudando você a tomar 
              as melhores decisões financeiras.
            </p>
            <Button 
              className="tech-button-specialist"
              onClick={handleReceivePlanByEmail}
            >
              Consultar um especialista para garantir o meu futuro
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-12 bg-gray-100 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">
            As informações contidas neste material são de caráter exclusivamente informativo e não devem ser entendidas como oferta, recomendação ou análise de investimento.
            O Futuro em Foco Planner não garante que os rendimentos futuros serão iguais aos apresentados neste simulador.
          </p>
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
