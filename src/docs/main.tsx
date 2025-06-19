import React from 'react';
import ReactDOM from 'react-dom/client';
import DocsViewer from './DocsViewer.tsx';
import '../styles/global.css';
import { ThemeProvider } from '../components/ThemeProvider.tsx';
import { overrideGlobalConsole } from '../utils/logger.ts';

// Initialize the logger as the very first step
overrideGlobalConsole();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <DocsViewer />
    </ThemeProvider>
  </React.StrictMode>,
); 