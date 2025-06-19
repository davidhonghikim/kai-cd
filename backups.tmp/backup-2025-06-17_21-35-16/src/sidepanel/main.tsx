import React from 'react';
import ReactDOM from 'react-dom/client';
import SidePanel from './SidePanel';
import '@/styles/global.css';
import { initializeTheme } from '@/config/theme';

// Initialize theme
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SidePanel />
  </React.StrictMode>,
); 