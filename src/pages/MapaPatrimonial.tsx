import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MapaPatrimonial = () => {
  // Dados mock para demonstração
  const patrimonioData = [
    { name: 'Investimentos', value: 450000, color: '#10B981' },
    { name: 'Imóveis', value: 800000, color: '#3B82F6' },
    { name: 'Previdência', value: 120000, color: '#F59E0B' },
    { name: 'Conta Corrente', value: 30000, color: '#EF4444' },
  ];

  const evolucaoData = [
    { mes: 'Jan', valor: 1200000 },
    { mes: 'Fev', valor: 1250000 },
    { mes: 'Mar', valor: 1180000 },
    { mes: 'Abr', valor: 1320000 },
    { mes: 'Mai', valor: 1400000 },
    { mes: 'Jun', valor: 1400000 },
  ];

  const totalPatrimonio = patrimonioData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
                <a href="/mapa-patrimonial" className="text-white hover:text-white transition-colors font-semibold">
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
                Mapa Patrimonial
              </h1>
              <p className="text-lg text-white/80 max-w-3xl mx-auto">
                Visualização completa da sua situação patrimonial atual
              </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 0 
                    }).format(totalPatrimonio)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ativos Líquidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    R$ 480.000
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ativos Ilíquidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">
                    R$ 920.000
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    +16,7%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Distribuição do Patrimônio */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Distribuição do Patrimônio</CardTitle>
                  <CardDescription className="text-white/70">
                    Alocação por categoria de ativos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={patrimonioData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {patrimonioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [
                            new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL',
                              minimumFractionDigits: 0 
                            }).format(value),
                            'Valor'
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Evolução Patrimonial */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Evolução Patrimonial</CardTitle>
                  <CardDescription className="text-white/70">
                    Últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolucaoData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="mes" stroke="rgba(255,255,255,0.7)" />
                        <YAxis 
                          stroke="rgba(255,255,255,0.7)"
                          tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [
                            new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL',
                              minimumFractionDigits: 0 
                            }).format(value),
                            'Patrimônio'
                          ]}
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="valor" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhamento por Categoria */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Detalhamento por Categoria</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patrimonioData.map((categoria, index) => (
                  <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.color }}
                        />
                        {categoria.name}
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        {((categoria.value / totalPatrimonio) * 100).toFixed(1)}% do patrimônio total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4" style={{ color: categoria.color }}>
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL',
                          minimumFractionDigits: 0 
                        }).format(categoria.value)}
                      </div>
                      <div className="space-y-2 text-sm text-white/60">
                        {categoria.name === 'Investimentos' && (
                          <>
                            <p>• Renda Fixa: 60%</p>
                            <p>• Renda Variável: 35%</p>
                            <p>• Fundos: 5%</p>
                          </>
                        )}
                        {categoria.name === 'Imóveis' && (
                          <>
                            <p>• Residência Principal: 70%</p>
                            <p>• Imóvel para Renda: 30%</p>
                          </>
                        )}
                        {categoria.name === 'Previdência' && (
                          <>
                            <p>• PGBL: 80%</p>
                            <p>• VGBL: 20%</p>
                          </>
                        )}
                        {categoria.name === 'Conta Corrente' && (
                          <>
                            <p>• Reserva de Emergência</p>
                            <p>• Liquidez imediata</p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Indicadores de Saúde Financeira */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Indicadores de Saúde Financeira</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Diversificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      Boa
                    </div>
                    <p className="text-sm text-white/60">
                      Patrimônio bem distribuído entre diferentes classes de ativos
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Liquidez</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      Média
                    </div>
                    <p className="text-sm text-white/60">
                      34% em ativos líquidos - considere aumentar a reserva
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle>Crescimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      Excelente
                    </div>
                    <p className="text-sm text-white/60">
                      Crescimento consistente nos últimos meses
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default MapaPatrimonial; 