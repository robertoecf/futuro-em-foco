import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/base.css';
import './styles/utilities.pcss';
import './styles/banner.css';
import './styles/cta-aurora.css';
import './styles/buttons.css';

// Aplicar tema baseado na preferência salva ou no sistema
const savedTheme = localStorage.getItem('theme') || 'system';

if (savedTheme === 'system') {
  const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', systemIsDark);
} else {
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
