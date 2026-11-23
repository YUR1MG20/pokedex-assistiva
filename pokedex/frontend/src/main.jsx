import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProvedorAnunciador } from './acessibilidade/Anunciador';
import { ProvedorPreferencias } from './acessibilidade/Preferencias';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProvedorPreferencias>
        <ProvedorAnunciador>
          <App />
        </ProvedorAnunciador>
      </ProvedorPreferencias>
    </BrowserRouter>
  </StrictMode>
);
