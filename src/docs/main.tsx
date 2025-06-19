import React from 'react';
import ReactDOM from 'react-dom/client';
import DocsViewer from './DocsViewer.tsx';
import '../styles/global.css';
import { ThemeProvider } from '../components/ThemeProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <DocsViewer />
    </ThemeProvider>
  </React.StrictMode>,
); 