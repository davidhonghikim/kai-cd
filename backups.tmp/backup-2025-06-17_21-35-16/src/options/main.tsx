import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Options from './Options';
import AdvancedSettingsPage from './AdvancedSettingsPage';
import '@/styles/global.css';
import { initializeTheme } from '@/config/theme';

const App: React.FC = () => {
  const [page, setPage] = useState<'options' | 'advanced'>('options');
  useEffect(() => {
    initializeTheme();
  }, []);
  return page === 'options' ? (
    <Options onOpenAdvancedSettings={() => setPage('advanced')} />
  ) : (
    <AdvancedSettingsPage onBack={() => setPage('options')} />
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
); 