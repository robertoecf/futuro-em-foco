import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Layouts
import AreaLogadaLayout from './layouts/AreaLogadaLayout';

// Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ProjecaoPatrimonial from "./pages/ProjecaoPatrimonial";

// Area Logada Pages
import VisaoGeral from './pages/area-logada/VisaoGeral';
import GestaoGastos from './pages/area-logada/GestaoGastos';
import RiscosSeguros from './pages/area-logada/RiscosSeguros';
import Aposentadoria from './pages/area-logada/Aposentadoria';
import Investimentos from './pages/area-logada/Investimentos';
import Tributario from './pages/area-logada/Tributario';
import Sucessorio from './pages/area-logada/Sucessorio';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeToggle />
      <BrowserRouter>
        <PostHogProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Área Logada - Rota aninhada */}
            <Route path="/area-logada" element={<AreaLogadaLayout />}>
              <Route index element={<Navigate to="visao-geral" replace />} />
              <Route path="visao-geral" element={<VisaoGeral />} />
              <Route path="gestao-gastos" element={<GestaoGastos />} />
              <Route path="riscos-seguros" element={<RiscosSeguros />} />
              <Route path="aposentadoria" element={<Aposentadoria />} />
              <Route path="investimentos" element={<Investimentos />} />
              <Route path="tributario" element={<Tributario />} />
              <Route path="sucessorio" element={<Sucessorio />} />
            </Route>

            <Route path="/projecao-patrimonial" element={<ProjecaoPatrimonial />} />

            {/* Redirecionamentos de rotas antigas */}
            <Route path="/mapa-patrimonial" element={<Navigate to="/area-logada/visao-geral" replace />} />
            <Route path="/ferramenta-completa" element={<Navigate to="/area-logada/visao-geral" replace />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PostHogProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
