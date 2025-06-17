
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
        <div className="text-2xl font-bold">futuro em foco</div>
        <Button className="bg-black hover:bg-gray-800">Conheça o planner</Button>
      </header>

      {/* Hero Section - Banner Laranja */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <HeroSection onReceivePlan={handleReceivePlanByEmail} />
      </section>

      {/* Calculator Section - Análise Detalhada */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-sm font-medium mb-4">ANÁLISE DETALHADA</span>
            <h2 className="text-3xl font-bold">Análise do seu investimento para aposentadoria</h2>
          </div>
          <Calculator />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">O Futuro em Foco pode te ajudar alcançar seus objetivos</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Nossa calculadora de projeção patrimonial permite simular diferentes cenários para 
            aposentadoria, preservação ou usufruto do seu patrimônio, ajudando você a tomar 
            as melhores decisões financeiras.
          </p>
          <Button 
            className="bg-black hover:bg-gray-800 text-white"
            onClick={handleReceivePlanByEmail}
          >
            Quero ajuda de um especialista
          </Button>
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
