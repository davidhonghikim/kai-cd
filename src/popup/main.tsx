import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup'
import '../styles/global.css'
import ThemeProvider from '../components/ThemeProvider'
import { overrideGlobalConsole } from '../utils/logger';

// Apply the logger override as early as possible
overrideGlobalConsole();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Popup />
    </ThemeProvider>
  </React.StrictMode>,
) 