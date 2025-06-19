import React from 'react'
import ReactDOM from 'react-dom/client'
import Sidepanel from './Sidepanel'
import '../styles/global.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { initializeInAppLogger } from '../utils/logger';

// Initialize the logger as the very first step
initializeInAppLogger();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Sidepanel />
    </ThemeProvider>
  </React.StrictMode>,
) 