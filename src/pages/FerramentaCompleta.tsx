import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from '@/components/calculator/Calculator';

const FerramentaCompleta = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Simples */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            <div className="flex items-center justify-between h-16">
              <a 
                href="/"
                className="tech-logo-header text-white text-xl cursor-pointer"
              >
                futuro em foco
              </a>
              <div className="flex items-center space-x-6">
                <a href="/ferramenta-completa" className="text-white/80 hover:text-white transition-colors">
                  Ferramenta Completa
                </a>
                <a href="/mapa-patrimonial" className="text-white/80 hover:text-white transition-colors">
                  Mapa Patrimonial
                </a>
                <a href="/projecao-patrimonial" className="text-white/80 hover:text-white transition-colors">
                  Projeção Patrimonial
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-20 pb-12">
        <div className="flex justify-center">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-4">
            
            {/* Título da Página */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Ferramenta Completa
              </h1>
              <p className="text-lg text-white/80 max-w-3xl mx-auto">
                Sua plataforma integrada para planejamento patrimonial e projeções de aposentadoria
              </p>
            </div>

            {/* Sistema de Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="mapeamento" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
                  Mapeamento
                </TabsTrigger>
                <TabsTrigger value="projecoes" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
                  Projeções
                </TabsTrigger>
                <TabsTrigger value="orcamento" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
                  Orçamento
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle>Patrimônio Total</CardTitle>
                      <CardDescription className="text-white/70">
                        Visão consolidada dos seus ativos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-400">
                        R$ 0,00
                      </div>
                      <p className="text-sm text-white/60 mt-2">
                        Configure seus dados no Mapeamento
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle>Fluxo Mensal</CardTitle>
                      <CardDescription className="text-white/70">
                        Receitas vs Despesas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-400">
                        R$ 0,00
                      </div>
                      <p className="text-sm text-white/60 mt-2">
                        Defina seu orçamento
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle>Meta Aposentadoria</CardTitle>
                      <CardDescription className="text-white/70">
                        Projeção do patrimônio necessário
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-400">
                        R$ 0,00
                      </div>
                      <p className="text-sm text-white/60 mt-2">
                        Use a calculadora de projeções
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Mapeamento Tab */}
              <TabsContent value="mapeamento" className="mt-8">
                <div className="space-y-8">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle>Mapeamento Patrimonial</CardTitle>
                      <CardDescription className="text-white/70">
                        Configure seus ativos, passivos e objetivos financeiros
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <h3 className="text-2xl font-semibold mb-4">
                          Módulo de Gestão Patrimonial
                        </h3>
                        <p className="text-white/70 mb-6">
                          Em desenvolvimento - Sistema completo baseado no padrão Warren Wealth Management
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <div className="p-4 border border-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Ativos Líquidos</h4>
                            <p className="text-sm text-white/60">Conta corrente, poupança, investimentos</p>
                          </div>
                          <div className="p-4 border border-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Ativos Ilíquidos</h4>
                            <p className="text-sm text-white/60">Imóveis, empresas, participações</p>
                          </div>
                          <div className="p-4 border border-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Passivos</h4>
                            <p className="text-sm text-white/60">Financiamentos, empréstimos, dívidas</p>
                          </div>
                          <div className="p-4 border border-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Fluxo de Caixa</h4>
                            <p className="text-sm text-white/60">Receitas e despesas mensais</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Projeções Tab */}
              <TabsContent value="projecoes" className="mt-8">
                <div className="space-y-8">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle>Simulador de Aposentadoria</CardTitle>
                      <CardDescription className="text-white/70">
                        Monte Carlo e projeções avançadas para planejamento de aposentadoria
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Calculator />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Orçamento Tab */}
              <TabsContent value="orcamento" className="mt-8">
                <div className="space-y-8">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle>Gestão de Orçamento</CardTitle>
                      <CardDescription className="text-white/70">
                        Controle suas receitas e despesas mensais
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <h3 className="text-2xl font-semibold mb-4">
                          Módulo de Orçamento
                        </h3>
                        <p className="text-white/70 mb-6">
                          Em desenvolvimento - Sistema de categorização e controle de gastos
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                          <div className="p-4 border border-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Receitas</h4>
                            <p className="text-sm text-white/60">Salários, aluguéis, dividendos</p>
                          </div>
                          <div className="p-4 border border-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Despesas Fixas</h4>
                            <p className="text-sm text-white/60">Moradia, alimentação, transporte</p>
                          </div>
                          <div className="p-4 border border-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Despesas Variáveis</h4>
                            <p className="text-sm text-white/60">Lazer, compras, imprevistos</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FerramentaCompleta; 