import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider } from './components/ui/Toast';
import { FiltersProvider } from './contexts/FiltersContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* Settings sits inside Auth so it can load the signed-in user's preferences. */}
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <FiltersProvider>
              <App />
            </FiltersProvider>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);