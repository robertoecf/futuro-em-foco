
import { useState, useEffect } from 'react';

type Theme = 'system' | 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (newTheme: Theme) => {
      // Remove existing theme classes
      root.classList.remove('light-theme', 'dark-theme', 'theme-mix');
      
      let effectiveTheme = newTheme;
      
      if (newTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      // Apply theme classes
      root.classList.add(`${effectiveTheme}-theme`, 'theme-mix');
      
      // Also apply the existing dark/light classes for shadcn components
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(theme);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
};
