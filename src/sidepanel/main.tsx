import React from 'react'
import ReactDOM from 'react-dom/client'
import Sidepanel from './Sidepanel'
import '../styles/global.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { overrideGlobalConsole } from '../utils/logger'

// Initialize the logger as the very first step
overrideGlobalConsole();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Sidepanel />
    </ThemeProvider>
  </React.StrictMode>,
) 