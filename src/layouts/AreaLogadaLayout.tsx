import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Visão Geral', href: '/area-logada/visao-geral' },
  { name: 'Gestão de Gastos', href: '/area-logada/gestao-gastos' },
  { name: 'Riscos e Seguros', href: '/area-logada/riscos-seguros' },
  { name: 'Aposentadoria', href: '/area-logada/aposentadoria' },
  { name: 'Investimentos', href: '/area-logada/investimentos' },
  { name: 'Tributário', href: '/area-logada/tributario' },
  { name: 'Sucessório', href: '/area-logada/sucessorio' },
];

const AreaLogadaLayout = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex justify-center">
          <div className="w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="tech-logo-header text-white text-xl cursor-pointer">
                futuro em foco
              </a>
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'text-sm font-medium transition-colors hover:text-white',
                        isActive ? 'text-white' : 'text-white/60'
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="flex justify-center">
          <div className="w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AreaLogadaLayout; 