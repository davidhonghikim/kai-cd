import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Options from './Options';
import AdvancedSettingsPage from './AdvancedSettingsPage';
import '@/styles/global.css';

const App: React.FC = () => {
  const [page, setPage] = useState<'options' | 'advanced'>('options');
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