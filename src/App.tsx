import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PostHogProvider } from "@/components/PostHogProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FerramentaCompleta from "./pages/FerramentaCompleta";
import MapaPatrimonial from "./pages/MapaPatrimonial";
import ProjecaoPatrimonial from "./pages/ProjecaoPatrimonial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PostHogProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ferramenta-completa" element={<FerramentaCompleta />} />
            <Route path="/mapa-patrimonial" element={<MapaPatrimonial />} />
            <Route path="/projecao-patrimonial" element={<ProjecaoPatrimonial />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PostHogProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
