import React from 'react';
import ReactDOM from 'react-dom/client';
import ServiceTab from './ServiceTab';
import '@/styles/vendors/tab.css';
import '@/styles/global.css';
import { initializeTheme } from '@/config/theme';

// Initialize theme
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceTab />
  </React.StrictMode>
);