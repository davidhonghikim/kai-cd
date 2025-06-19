import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/styles/vendors/popup.css';
import '@/styles/global.css';
import { initializeTheme } from '@/config/theme';

// Initialize theme
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 