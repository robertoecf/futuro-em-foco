import { useState, useEffect } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  // Get theme from localStorage or default to 'system'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed bottom-4 left-1.5 z-50 w-10 h-10 rounded-full shadow-lg hover:scale-110 transition-all duration-200 border-0"
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="h-5 w-5 text-yellow-500" />}
      {theme === 'dark' && <Moon className="h-5 w-5 text-blue-600" />}
      {theme === 'system' && <Laptop className="h-5 w-5 text-gray-500" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
