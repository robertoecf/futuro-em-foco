import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/base.css';
import './styles/utilities.pcss';
import './styles/banner.css';
import './styles/cta-aurora.css';
import './styles/buttons.css';

// Aplicar tema baseado na preferência salva (padrão: escuro)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
