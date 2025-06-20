import React from 'react'
import ReactDOM from 'react-dom/client'
import Tab from './Tab'
import '../styles/global.css'
import ThemeProvider from '../components/ThemeProvider'
import { overrideGlobalConsole } from '../utils/logger';
import { Toaster } from 'react-hot-toast';

// Initialize the logger as the very first step
overrideGlobalConsole();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Tab />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f8fafc',
            },
          },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>,
) 