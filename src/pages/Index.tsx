
import { useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { Calculator } from '@/components/calculator/Calculator';
import { InvestorProfiles } from '@/components/InvestorProfiles';
import { Recommendations } from '@/components/Recommendations';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [investorProfile, setInvestorProfile] = useState('moderado');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold">futuro em foco</div>
        <Button className="bg-black hover:bg-gray-800">Conheça o planner</Button>
      </header>

      {/* Investor Profile Section - Moved to top */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <InvestorProfiles onProfileSelect={setInvestorProfile} selectedProfile={investorProfile} />
          <Recommendations investorProfile={investorProfile} />
        </div>
      </section>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <HeroSection />
      </section>

      {/* Calculator Section */}
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
        <h2 className="text-3xl font-bold mb-4">O Futuro em Foco pode te ajudar alcançar seus objetivos</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          Nossa calculadora de projeção patrimonial permite simular diferentes cenários para 
          aposentadoria, preservação ou usufruto do seu patrimônio, ajudando você a tomar 
          as melhores decisões financeiras.
        </p>
        <Button className="bg-black hover:bg-gray-800 text-white">Falar com um especialista</Button>
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
    </div>
  );
};

export default Index;
