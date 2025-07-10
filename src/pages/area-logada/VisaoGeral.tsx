import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const VisaoGeral = () => {
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
    <div className="space-y-12">
      {/* Título da Página */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Visão Geral do Patrimônio
        </h1>
        <p className="text-lg text-white/80 max-w-3xl mx-auto">
          Dashboard completo da sua situação patrimonial atual.
        </p>
      </div>

      {/* Mapa de vulnerabilidades */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Mapa de vulnerabilidades
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-400">01</span>
                </div>
                <CardTitle className="text-lg">Gestão de gastos</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-400">02</span>
                </div>
                <CardTitle className="text-lg">Gestão de riscos e seguros</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-400">03</span>
                </div>
                <CardTitle className="text-lg">Planejamento de aposentadoria</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-red-400">04</span>
                </div>
                <CardTitle className="text-lg">Gestão de investimentos</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-400">05</span>
                </div>
                <CardTitle className="text-lg">Tributário</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-600/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-pink-400">06</span>
                </div>
                <CardTitle className="text-lg">Sucessório</CardTitle>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
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

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ativos Líquidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              R$ 480.000
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ativos Ilíquidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              R$ 920.000
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribuição do Patrimônio */}
        <Card className="glass-card">
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
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Evolução Patrimonial */}
        <Card className="glass-card">
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
            <Card key={index} className="glass-card">
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
                      <p>• Reserva de Liquidez: 15%</p>
                      <p>• Aquisições futuras: 20%</p>
                      <p>• Crescimento: 45%</p>
                      <p>• Preservação: 20%</p>
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
          <Card className="glass-card">
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

          <Card className="glass-card">
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

          <Card className="glass-card">
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
  );
};

export default VisaoGeral; 