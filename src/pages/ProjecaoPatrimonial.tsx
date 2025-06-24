import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from '@/components/calculator/Calculator';

const ProjecaoPatrimonial = () => {
  const [activeTab, setActiveTab] = useState('simulador');

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="tech-logo-header text-white text-xl cursor-pointer">
                futuro em foco
              </a>
              <div className="flex items-center space-x-6">
                <a href="/ferramenta-completa" className="text-white/80 hover:text-white transition-colors">
                  Ferramenta Completa
                </a>
                <a href="/mapa-patrimonial" className="text-white/80 hover:text-white transition-colors">
                  Mapa Patrimonial
                </a>
                <a href="/projecao-patrimonial" className="text-white hover:text-white transition-colors font-semibold">
                  Projeção Patrimonial
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Projeção Patrimonial
              </h1>
              <p className="text-lg text-white/80 max-w-3xl mx-auto">
                Simulações avançadas para seu planejamento de aposentadoria usando Monte Carlo
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm">
                <TabsTrigger value="simulador" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
                  Simulador
                </TabsTrigger>
                <TabsTrigger value="cenarios" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
                  Cenários
                </TabsTrigger>
                <TabsTrigger value="estrategias" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
                  Estratégias
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simulador" className="mt-8">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Calculadora de Aposentadoria</CardTitle>
                    <CardDescription className="text-white/70">
                      Simulação Monte Carlo com análise probabilística avançada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calculator />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cenarios" className="mt-8">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Cenários de Investimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Cenários em desenvolvimento...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estrategias" className="mt-8">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Estratégias Recomendadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Estratégias em desenvolvimento...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjecaoPatrimonial;
